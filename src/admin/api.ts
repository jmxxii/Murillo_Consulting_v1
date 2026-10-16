/**
 * Client for the admin API (`/api/admin/*`). Every call sends the httpOnly
 * session cookie automatically; a 401 means the session is missing or expired.
 */

export type AdminStatus = "new" | "contacted" | "closed";
export const ADMIN_STATUSES: AdminStatus[] = ["new", "contacted", "closed"];
export const STATUS_LABELS: Record<AdminStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export interface AdminUser {
  name: string;
  email: string;
}

export interface InquirySummary {
  id: string;
  status: AdminStatus;
  createdAt: string;
  businessName: string;
  firstName: string;
  lastName: string;
  fileCount: number;
}

export interface InquiryFile {
  name: string;
  type: string;
  size: number;
  /** False once S3 lifecycle has deleted the file. */
  available: boolean;
  /** 5-minute presigned links, present only when available. */
  viewUrl?: string;
  downloadUrl?: string;
}

export interface InquiryDetail {
  id: string;
  status: AdminStatus;
  createdAt: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  preferredLanguage: "en" | "es";
  businessLocation: string;
  serviceType: "electricity" | "gas" | "both";
  locationCount: number;
  notes?: string;
  submittedLocale: "en" | "es";
  campaign?: string;
  files: InquiryFile[];
}

export class ApiError extends Error {
  constructor(public status: number) {
    super(`Request failed with ${status}`);
  }
}

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;
export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
  });
  if (!response.ok) throw new ApiError(response.status);
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export const adminApi = {
  /** The signed-in admin, or null when signed out. */
  me: () =>
    call<{ user: AdminUser }>("/api/admin/auth/me").then(
      (body) => body.user,
      (error) => {
        if (isUnauthorized(error)) return null;
        throw error;
      },
    ),
  list: (status?: AdminStatus) =>
    call<{ inquiries: InquirySummary[] }>(
      `/api/admin/inquiries${status ? `?status=${status}` : ""}`,
    ).then((body) => body.inquiries),
  get: (id: string) =>
    call<{ inquiry: InquiryDetail }>(`/api/admin/inquiries/${encodeURIComponent(id)}`).then(
      (body) => body.inquiry,
    ),
  setStatus: (id: string, status: AdminStatus) =>
    call<void>(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  remove: (id: string) =>
    call<void>(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "DELETE" }),
  logout: () => call<void>("/api/admin/auth/logout", { method: "POST" }),
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}
