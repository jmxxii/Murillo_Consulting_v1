import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SESv2Client } from "@aws-sdk/client-sesv2";

/**
 * AWS clients, one per service, reused across invocations of a warm function.
 *
 * Credentials come from APP_AWS_* because Vercel reserves the AWS_* names.
 * Tests replace this whole module (see api/_tests/setup.ts).
 */
const config = {
  region: process.env.APP_AWS_REGION ?? "us-east-2",
  credentials: process.env.APP_AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY ?? "",
      }
    : undefined,
};

export const ddb = DynamoDBDocumentClient.from(new DynamoDBClient(config), {
  marshallOptions: { removeUndefinedValues: true },
});
export const s3 = new S3Client(config);
export const ses = new SESv2Client(config);
