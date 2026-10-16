import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../_lib/aws.js";
import { json } from "../../_lib/http.js";
import {
  ADMIN_STATUSES,
  isAdminStatus,
  STATUS_INDEX,
  tableName,
  type Inquiry,
} from "../../_lib/inquiry.js";
import { requireAdmin } from "../../_lib/session.js";

/**
 * GET /api/admin/inquiries?status=new|contacted|closed
 *
 * Newest first. Without ?status, all three statuses merged ("uploading"
 * inquiries were never completed and are left for TTL to remove).
 */
export async function GET(request: Request): Promise<Response> {
  const user = await requireAdmin(request);
  if (user instanceof Response) return user;

  const status = new URL(request.url).searchParams.get("status");
  if (status && !isAdminStatus(status)) return json({ error: "invalid" }, 400);

  // ponytail: no pagination. One Query page is 1 MB, roughly thousands of
  // inquiries, and TTL caps the table at 90 days. Add LastEvaluatedKey if that changes.
  const pages = await Promise.all(
    (status ? [status] : ADMIN_STATUSES).map((value) =>
      ddb.send(
        new QueryCommand({
          TableName: tableName(),
          IndexName: STATUS_INDEX,
          KeyConditionExpression: "#status = :status",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":status": value },
          ScanIndexForward: false,
        }),
      ),
    ),
  );

  const inquiries = pages
    .flatMap((page) => (page.Items ?? []) as Inquiry[])
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => ({
      id: item.id,
      status: item.status,
      createdAt: item.createdAt,
      businessName: item.businessName,
      firstName: item.firstName,
      lastName: item.lastName,
      fileCount: item.files.length,
    }));

  return json({ inquiries });
}
