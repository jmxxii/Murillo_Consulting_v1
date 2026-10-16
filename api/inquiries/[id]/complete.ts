import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { detectMimeType } from "../../../src/lib/fileValidation.js";
import { ddb, s3, ses } from "../../_lib/aws.js";
import { env, json, pathId, siteUrl } from "../../_lib/http.js";
import { tableName, type Inquiry, type StoredFile } from "../../_lib/inquiry.js";

/**
 * POST /api/inquiries/:id/complete (public)
 *
 * Runs once per inquiry, after the browser's direct uploads. Reads the first
 * bytes of each stored object and deletes any whose content or size does not
 * match what was declared, marks the inquiry "new" and emails Larry.
 *
 * Response: { rejected: number[] }, indexes into the original file list, so
 * the form can tell the visitor which files did not arrive.
 */

/** True if the object exists, matches its declared type and size. Bad objects are deleted. */
async function verifyFile(file: StoredFile): Promise<boolean> {
  const Bucket = env("UPLOADS_BUCKET");
  let valid: boolean;
  try {
    const object = await s3.send(new GetObjectCommand({ Bucket, Key: file.key, Range: "bytes=0-7" }));
    const header = await object.Body!.transformToByteArray();
    const totalSize = Number(object.ContentRange?.split("/")[1]);
    valid = totalSize === file.size && detectMimeType(header) === file.type;
  } catch (error) {
    if ((error as Error).name === "NoSuchKey") return false; // never uploaded
    throw error;
  }
  if (!valid) await s3.send(new DeleteObjectCommand({ Bucket, Key: file.key }));
  return valid;
}

/** Business name and admin link only: no contact details, no bill data. */
function notify(inquiry: Inquiry) {
  const businessName = inquiry.businessName.replace(/\s+/g, " ");
  return ses.send(
    new SendEmailCommand({
      FromEmailAddress: env("SES_FROM_EMAIL"),
      Destination: { ToAddresses: [env("NOTIFY_EMAIL")] },
      Content: {
        Simple: {
          Subject: { Data: `New inquiry: ${businessName}` },
          Body: {
            Text: {
              Data:
                `A new inquiry from ${businessName} is waiting in the admin page:\n\n` +
                `${siteUrl()}/admin/inquiries/${inquiry.id}\n`,
            },
          },
        },
      },
    }),
  );
}

export async function POST(request: Request): Promise<Response> {
  const id = pathId(request);
  if (!id) return json({ error: "not_found" }, 404);

  const { Item } = await ddb.send(new GetCommand({ TableName: tableName(), Key: { id } }));
  const inquiry = Item as Inquiry | undefined;
  if (!inquiry || inquiry.status !== "uploading") return json({ error: "not_found" }, 404);

  const results = await Promise.all(inquiry.files.map(verifyFile));
  const rejected = results.flatMap((ok, index) => (ok ? [] : [index]));

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { id },
        UpdateExpression: "SET #status = :new, files = :files",
        ConditionExpression: "#status = :uploading",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":new": "new",
          ":uploading": "uploading",
          ":files": inquiry.files.filter((_, index) => results[index]),
        },
      }),
    );
  } catch (error) {
    // A second, concurrent /complete call won the race; it sends the email.
    if ((error as Error).name === "ConditionalCheckFailedException") {
      return json({ error: "conflict" }, 409);
    }
    throw error;
  }

  // The inquiry is saved either way; Larry still sees it in /admin.
  await notify(inquiry).catch((error: Error) =>
    console.error("[complete] notification email failed:", error.name),
  );

  return json({ rejected });
}
