import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { DeleteCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddb, s3 } from "../../_lib/aws.js";
import { env, json, pathId, readJson } from "../../_lib/http.js";
import { isAdminStatus, tableName, type Inquiry, type StoredFile } from "../../_lib/inquiry.js";
import { requireAdmin } from "../../_lib/session.js";

/**
 * GET    /api/admin/inquiries/:id   details + 5-minute view/download links
 * PATCH  /api/admin/inquiries/:id   { status }
 * DELETE /api/admin/inquiries/:id   files + record
 */
const LINK_SECONDS = 5 * 60;

/** RFC 6266 header with an ASCII fallback, so any filename downloads correctly. */
function attachment(name: string): string {
  const ascii = name.replace(/[^\x20-\x7e]|["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

async function exists(Key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: env("UPLOADS_BUCKET"), Key }));
    return true;
  } catch (error) {
    if ((error as Error).name === "NotFound") return false;
    throw error;
  }
}

/** Lifecycle can expire a file before TTL removes its record, so check first. */
async function withLinks(file: StoredFile) {
  const { name, type, size } = file;
  if (!(await exists(file.key))) return { name, type, size, available: false };

  const Bucket = env("UPLOADS_BUCKET");
  const [viewUrl, downloadUrl] = await Promise.all([
    getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket,
        Key: file.key,
        ResponseContentType: type,
        ResponseContentDisposition: "inline",
      }),
      { expiresIn: LINK_SECONDS },
    ),
    getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket, Key: file.key, ResponseContentDisposition: attachment(name) }),
      { expiresIn: LINK_SECONDS },
    ),
  ]);
  return { name, type, size, available: true, viewUrl, downloadUrl };
}

export async function GET(request: Request): Promise<Response> {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const id = pathId(request);
  if (!id) return json({ error: "not_found" }, 404);

  const { Item } = await ddb.send(new GetCommand({ TableName: tableName(), Key: { id } }));
  const inquiry = Item as Inquiry | undefined;
  if (!inquiry || inquiry.status === "uploading") return json({ error: "not_found" }, 404);

  const { files, expiresAt, ...details } = inquiry;
  return json({ inquiry: { ...details, files: await Promise.all(files.map(withLinks)) } });
}

export async function PATCH(request: Request): Promise<Response> {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const id = pathId(request);
  const body = (await readJson(request)) as { status?: unknown } | undefined;
  if (!id || !isAdminStatus(body?.status)) return json({ error: "invalid" }, 400);

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { id },
        UpdateExpression: "SET #status = :status",
        ConditionExpression: "attribute_exists(id) AND #status <> :uploading",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": body.status, ":uploading": "uploading" },
      }),
    );
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      return json({ error: "not_found" }, 404);
    }
    throw error;
  }
  return json({ status: body.status });
}

export async function DELETE(request: Request): Promise<Response> {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;
  const id = pathId(request);
  if (!id) return json({ error: "not_found" }, 404);

  // List the prefix rather than trusting the record, so files dropped by
  // /complete or uploaded late are removed too. Files first: if this fails
  // halfway the record survives and Delete can be retried.
  const Bucket = env("UPLOADS_BUCKET");
  const listing = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: `inquiries/${id}/` }));
  await Promise.all(
    (listing.Contents ?? []).map(({ Key }) => s3.send(new DeleteObjectCommand({ Bucket, Key }))),
  );
  await ddb.send(new DeleteCommand({ TableName: tableName(), Key: { id } }));
  return new Response(null, { status: 204 });
}
