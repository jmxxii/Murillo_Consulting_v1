/**
 * Client-side bill-attachment validation.
 *
 * ⚠️ THIS IS A UX AFFORDANCE, NOT A SECURITY CONTROL.
 *
 * Anything here can be bypassed by posting directly to the endpoint. The
 * server MUST repeat every one of these checks (extension allow-list, MIME
 * allow-list, magic-byte sniffing, size cap, count cap) plus the controls it
 * alone can perform — malware scanning, storing outside the web root, and
 * generating its own filename. See docs/backend-requirements.md.
 *
 * What this buys us is a fast, clear error before a business owner spends
 * time uploading a 40 MB scan we would only reject later.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const MAX_FILES = 6;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024; // 30 MB per submission

export const ACCEPTED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"] as const;
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

/** `accept` attribute for the file input. */
export const ACCEPT_ATTRIBUTE = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

/** Leading bytes that identify each accepted format. */
const MAGIC_NUMBERS: ReadonlyArray<{ mime: string; bytes: readonly number[] }> = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

export type FileRejectionReason =
  | "too-large"
  | "wrong-type"
  | "content-mismatch"
  | "empty"
  | "too-many";

export interface FileRejection {
  /** Sanitized display name — safe to render. */
  fileName: string;
  reason: FileRejectionReason;
}

export interface FileValidationResult {
  accepted: File[];
  rejections: FileRejection[];
}

/** Drops C0/C1 control characters without embedding raw control bytes in source. */
function stripControlCharacters(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x20 && code !== 0x7f) out += char;
  }
  return out;
}

/**
 * Makes a filename safe to render in the DOM and to send as a form field.
 *
 * Strips path separators (defeats `../` traversal and Windows paths), control
 * characters, and characters that shells or archive tools treat specially,
 * then caps the length. The server must still generate its own storage name;
 * this is only what we display and pass along as a hint.
 */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = stripControlCharacters(base)
    .replace(/[<>:"|?*]/g, "")
    .replace(/^\.+/, "")
    .trim();
  const safe = cleaned.length > 0 ? cleaned : "file";
  return safe.length > 120 ? `${safe.slice(0, 110)}…${safe.slice(-8)}` : safe;
}

export function fileExtension(name: string): string {
  const parts = sanitizeFileName(name).split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/**
 * Reads the leading bytes of a blob.
 *
 * `Blob.arrayBuffer()` is the fast path, but it is missing on Safari before
 * 14 (and in jsdom), so FileReader is kept as a fallback. Business owners
 * uploading from an older phone should still get validation rather than a
 * thrown error.
 */
function readHeaderBytes(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/** Reads the first bytes and checks them against the known signatures. */
export async function hasValidSignature(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file.slice(0, 8));
  return MAGIC_NUMBERS.some(({ bytes }) =>
    bytes.every((byte, index) => header[index] === byte),
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

/**
 * Validates a batch of files against the already-accepted list.
 * Runs extension, MIME and magic-byte checks so a renamed `.exe` is caught.
 */
export async function validateFiles(
  incoming: File[],
  existing: File[] = [],
): Promise<FileValidationResult> {
  const accepted: File[] = [];
  const rejections: FileRejection[] = [];
  let slotsLeft = MAX_FILES - existing.length;
  let totalBytes = existing.reduce((sum, file) => sum + file.size, 0);

  for (const file of incoming) {
    const fileName = sanitizeFileName(file.name);

    if (slotsLeft <= 0) {
      rejections.push({ fileName, reason: "too-many" });
      continue;
    }
    if (file.size === 0) {
      rejections.push({ fileName, reason: "empty" });
      continue;
    }
    if (file.size > MAX_FILE_BYTES || totalBytes + file.size > MAX_TOTAL_BYTES) {
      rejections.push({ fileName, reason: "too-large" });
      continue;
    }

    const extension = fileExtension(file.name);
    const extensionOk = (ACCEPTED_EXTENSIONS as readonly string[]).includes(extension);
    // Some browsers report an empty type for files chosen from certain apps;
    // in that case the magic-byte check below is what decides.
    const mimeOk =
      file.type === "" || (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);

    if (!extensionOk || !mimeOk) {
      rejections.push({ fileName, reason: "wrong-type" });
      continue;
    }

    if (!(await hasValidSignature(file))) {
      rejections.push({ fileName, reason: "content-mismatch" });
      continue;
    }

    accepted.push(file);
    slotsLeft -= 1;
    totalBytes += file.size;
  }

  return { accepted, rejections };
}
