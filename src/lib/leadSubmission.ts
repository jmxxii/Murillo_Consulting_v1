import { sanitizeFileName } from "./fileValidation";

/**
 * Lead + bill submission transport.
 *
 * This repository has no backend. The form posts `multipart/form-data` to the
 * endpoint named by `VITE_LEAD_ENDPOINT`; when that variable is not set the
 * UI shows an explicit "not available yet" state and points the visitor at
 * the direct contact details, rather than pretending a submission succeeded.
 *
 * Security responsibilities that live on the SERVER, not here:
 *   - re-validate type/size/count and sniff magic bytes
 *   - malware scan before the file is durably stored
 *   - store outside the web root, private ACL, server-generated object key
 *   - never echo the storage path or an internal error back to the client
 *   - enforce rate limiting and spam protection
 *   - apply the documented retention/deletion schedule
 * See docs/backend-requirements.md for the full contract.
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
  /** Locale the form was completed in — helps route the follow-up call. */
  submittedLocale: string;
  /** Campaign slug when submitted from a campaign page. */
  campaign?: string;
}

export type SubmitResult =
  | { status: "success" }
  | { status: "unconfigured" }
  | { status: "error"; reason: "network" | "server" };

export interface SubmitOptions {
  payload: LeadPayload;
  files: File[];
  /** 0–100. Reported from real XHR upload progress. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export function getLeadEndpoint(): string | undefined {
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT;
  return typeof endpoint === "string" && endpoint.length > 0 ? endpoint : undefined;
}

export function isSubmissionConfigured(): boolean {
  return getLeadEndpoint() !== undefined;
}

function buildFormData(payload: LeadPayload, files: File[]): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    data.append(key, String(value));
  }
  for (const file of files) {
    // Pass a sanitized name as a display hint. The server must still generate
    // its own storage key and must not trust this value as a path.
    data.append("bills", file, sanitizeFileName(file.name));
  }
  return data;
}

/**
 * Posts the lead. Uses XHR rather than fetch because `fetch` still has no
 * upload-progress event, and a progress bar matters when someone is sending
 * several photographed bills over a phone connection.
 */
export function submitLead({
  payload,
  files,
  onProgress,
  signal,
}: SubmitOptions): Promise<SubmitResult> {
  const endpoint = getLeadEndpoint();

  if (!endpoint) {
    if (import.meta.env.DEV) {
      console.warn(
        "[leadSubmission] VITE_LEAD_ENDPOINT is not set — the lead form will render its " +
          "'submission unavailable' state. See docs/backend-requirements.md.",
      );
    }
    return Promise.resolve({ status: "unconfigured" });
  }

  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", endpoint, true);
    request.responseType = "json";
    request.timeout = 120_000;

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      onProgress?.(100);
      if (request.status >= 200 && request.status < 300) {
        resolve({ status: "success" });
      } else {
        // Deliberately not surfacing the response body — server errors can
        // carry internal detail we should not show a visitor.
        resolve({ status: "error", reason: "server" });
      }
    });

    request.addEventListener("error", () => resolve({ status: "error", reason: "network" }));
    request.addEventListener("timeout", () => resolve({ status: "error", reason: "network" }));
    request.addEventListener("abort", () => resolve({ status: "error", reason: "network" }));

    signal?.addEventListener("abort", () => request.abort(), { once: true });

    request.send(buildFormData(payload, files));
  });
}
