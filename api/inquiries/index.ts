import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { z } from "zod";
import en from "../../src/i18n/en.js";
import { createLeadSchema } from "../../src/lib/leadSchema.js";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  sanitizeFileName,
} from "../../src/lib/fileValidation.js";
import { ddb, s3 } from "../_lib/aws.js";
import { env, json, readJson } from "../_lib/http.js";
import {
  EXTENSION_FOR_TYPE,
  RETENTION_DAYS,
  tableName,
  type Inquiry,
  type StoredFile,
} from "../_lib/inquiry.js";

/**
 * POST /api/inquiries (public)
 *
 * Validates the form and the file list, checks Turnstile, saves the inquiry
 * as "uploading" and returns one presigned S3 POST per file, in the same
 * order. The browser then uploads straight to S3 (Vercel caps request bodies
 * at 4.5 MB) and calls /api/inquiries/:id/complete.
 */
const UPLOAD_SLOT_SECONDS = 5 * 60;

const requestSchema = z.object({
  turnstileToken: z.string().min(1).max(2048),
  submittedLocale: z.enum(["en", "es"]),
  campaign: z
    .string()
    .regex(/^[a-z0-9-]{1,80}$/)
    .optional(),
  files: z
    .array(
      z.object({
        name: z.string().max(255),
        type: z.enum(ACCEPTED_MIME_TYPES),
        size: z.number().int().min(1).max(MAX_FILE_BYTES),
      }),
    )
    .max(MAX_FILES)
    .refine((files) => files.reduce((sum, f) => sum + f.size, 0) <= MAX_TOTAL_BYTES),
});

const leadSchema = createLeadSchema(en);

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const body = new URLSearchParams({ secret: env("TURNSTILE_SECRET_KEY"), response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false; // fail closed
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  const meta = requestSchema.safeParse(body);
  const lead = leadSchema.safeParse(body);
  // No field-level detail: the form already validated, so this is a bypass.
  if (!meta.success || !lead.success) return json({ error: "invalid" }, 400);

  if (!(await verifyTurnstile(meta.data.turnstileToken, request.headers.get("x-real-ip")))) {
    return json({ error: "captcha" }, 403);
  }

  const id = randomUUID();
  const now = new Date();
  const files: StoredFile[] = meta.data.files.map((file) => ({
    key: `inquiries/${id}/${randomUUID()}.${EXTENSION_FOR_TYPE[file.type]}`,
    name: sanitizeFileName(file.name),
    type: file.type,
    size: file.size,
  }));

  const item: Inquiry = {
    ...lead.data,
    id,
    status: "uploading",
    createdAt: now.toISOString(),
    expiresAt: Math.floor(now.getTime() / 1000) + RETENTION_DAYS * 24 * 60 * 60,
    submittedLocale: meta.data.submittedLocale,
    campaign: meta.data.campaign,
    files,
  };
  await ddb.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: "attribute_not_exists(id)",
    }),
  );

  const uploads = await Promise.all(
    files.map((file) =>
      createPresignedPost(s3, {
        Bucket: env("UPLOADS_BUCKET"),
        Key: file.key,
        Fields: { "Content-Type": file.type },
        Conditions: [
          ["content-length-range", file.size, file.size],
          ["eq", "$Content-Type", file.type],
        ],
        Expires: UPLOAD_SLOT_SECONDS,
      }),
    ),
  );

  return json({ id, uploads: uploads.map(({ url, fields }) => ({ url, fields })) }, 201);
}
