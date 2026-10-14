import { fileExtension, sanitizeFileName } from "./fileValidation";

/**
 * Lead + bill submission transport. Three steps against our own API (`/api`):
 *
 *   1. POST /api/inquiries            form fields, file metadata, Turnstile token
 *                                     -> { id, uploads: one presigned S3 POST per file }
 *   2. POST each file straight to S3  (Vercel functions reject bodies over 4.5 MB)
 *   3. POST /api/inquiries/:id/complete
 *                                     -> { rejected: indexes of files that did not arrive }
 *
 * The server repeats every check (type, size, count, magic bytes) and makes
 * its own storage keys. See docs/admin-plan.md.
 *
 * A failed file upload does not fail the submission: the contact details are
 * already saved, so /complete reports the file as rejected and the form tells
 * the visitor which files to email instead.
 */

export interface LeadPayload {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  businessLocation: string;
  serviceType: "electricity" | "gas" | "both";
  locationCount: number;
  notes?: string;
  consent: true;
  /** Locale the form was completed in, helps route the follow-up call. */
  submittedLocale: string;
  /** Campaign slug when submitted from a campaign page. */
  campaign?: string;
}

export type SubmitResult =
  | { status: "success"; rejected: number[] }
  | { status: "unconfigured" }
  | { status: "error"; reason: "network" | "server" | "verification" };

export interface SubmitOptions {
  payload: LeadPayload;
  files: File[];
  turnstileToken: string;
  /** 0–100. Reported from real XHR upload progress across all files. */
  onProgress?: (percent: number) => void;
}

interface UploadSlot {
  url: string;
  fields: Record<string, string>;
}

export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  return typeof key === "string" && key.length > 0 ? key : undefined;
}

/** Without a Turnstile site key the API would refuse every submission. */
export function isSubmissionConfigured(): boolean {
  return getTurnstileSiteKey() !== undefined;
}

const TYPE_FOR_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/**
 * Some browsers report an empty type for files picked from certain apps;
 * validateFiles already confirmed the magic bytes, so the extension decides.
 */
function mimeTypeOf(file: File): string {
  return file.type || TYPE_FOR_EXTENSION[fileExtension(file.name)] || "";
}

async function postJson(url: string, body?: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/**
 * Uploads one file to its presigned S3 POST. XHR rather than fetch because
 * fetch still has no upload-progress event. Resolves false on any failure.
 */
function uploadFile(
  slot: UploadSlot,
  file: File,
  onLoaded: (bytes: number) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(slot.fields)) data.append(key, value);
    data.append("file", file); // S3 requires the file to be the last field

    const request = new XMLHttpRequest();
    request.open("POST", slot.url, true);
    request.timeout = 120_000;
    request.upload.addEventListener("progress", (event) => onLoaded(event.loaded));
    request.addEventListener("load", () => {
      onLoaded(file.size);
      resolve(request.status >= 200 && request.status < 300);
    });
    for (const failure of ["error", "timeout", "abort"]) {
      request.addEventListener(failure, () => resolve(false));
    }
    request.send(data);
  });
}

export async function submitLead({
  payload,
  files,
  turnstileToken,
  onProgress,
}: SubmitOptions): Promise<SubmitResult> {
  if (!isSubmissionConfigured()) {
    if (import.meta.env.DEV) {
      console.warn(
        "[leadSubmission] VITE_TURNSTILE_SITE_KEY is not set, so the lead form renders its " +
          "'submission unavailable' state. See docs/aws-setup.md.",
      );
    }
    return { status: "unconfigured" };
  }

  try {
    const created = await postJson("/api/inquiries", {
      ...payload,
      turnstileToken,
      files: files.map((file) => ({
        name: sanitizeFileName(file.name),
        type: mimeTypeOf(file),
        size: file.size,
      })),
    });
    // Deliberately not surfacing the response body: server errors can carry
    // internal detail we should not show a visitor.
    if (created.status === 403) return { status: "error", reason: "verification" };
    if (!created.ok) return { status: "error", reason: "server" };
    const { id, uploads } = (await created.json()) as { id: string; uploads: UploadSlot[] };

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const loaded = files.map(() => 0);
    await Promise.all(
      files.map((file, index) =>
        uploadFile(uploads[index], file, (bytes) => {
          loaded[index] = bytes;
          const sum = loaded.reduce((a, b) => a + b, 0);
          onProgress?.(Math.round((sum / totalBytes) * 100));
        }),
      ),
    );

    const completed = await postJson(`/api/inquiries/${encodeURIComponent(id)}/complete`);
    if (!completed.ok) return { status: "error", reason: "server" };
    const { rejected } = (await completed.json()) as { rejected: number[] };
    return { status: "success", rejected };
  } catch {
    return { status: "error", reason: "network" };
  }
}
