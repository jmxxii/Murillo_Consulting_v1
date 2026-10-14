import type { LeadFormValues } from "../../src/lib/leadSchema.js";

export const ADMIN_STATUSES = ["new", "contacted", "closed"] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];
/** "uploading" until /complete verifies the files; never shown in /admin. */
export type InquiryStatus = AdminStatus | "uploading";

export const RETENTION_DAYS = 90;
export const STATUS_INDEX = "status-createdAt-index";

export const EXTENSION_FOR_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export interface StoredFile {
  /** Server-generated: inquiries/<id>/<uuid>.<ext> */
  key: string;
  /** Sanitized original filename. Display only, never used as a key. */
  name: string;
  type: string;
  size: number;
}

export interface Inquiry extends LeadFormValues {
  id: string;
  status: InquiryStatus;
  /** ISO timestamp, sort key of the status index. */
  createdAt: string;
  /** Epoch seconds. DynamoDB TTL attribute. */
  expiresAt: number;
  submittedLocale: "en" | "es";
  campaign?: string;
  files: StoredFile[];
}

export function isAdminStatus(value: unknown): value is AdminStatus {
  return (ADMIN_STATUSES as readonly unknown[]).includes(value);
}

export function tableName(): string {
  return process.env.INQUIRIES_TABLE ?? "inquiries";
}
