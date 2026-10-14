import { beforeEach, vi } from "vitest";

/**
 * Every API test runs against mocked AWS clients and presigners, so the
 * suite needs no AWS account. Tests drive behavior through `mockSend` and
 * inspect what was sent with `sent` (see helpers.ts).
 */
vi.mock("../_lib/aws.js", () => ({
  ddb: { send: vi.fn() },
  s3: { send: vi.fn() },
  ses: { send: vi.fn() },
}));

vi.mock("@aws-sdk/s3-presigned-post", () => ({
  createPresignedPost: vi.fn(async ({ Key }: { Key: string }) => ({
    url: "https://test-bucket.s3.us-east-1.amazonaws.com/",
    fields: { key: Key },
  })),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(
    async (_client: unknown, command: { input: Record<string, string> }) =>
      `https://signed.test/${command.input.Key}?disposition=${encodeURIComponent(
        command.input.ResponseContentDisposition ?? "",
      )}`,
  ),
}));

Object.assign(process.env, {
  SITE_URL: "https://murilloconsulting.com",
  INQUIRIES_TABLE: "inquiries",
  UPLOADS_BUCKET: "test-bucket",
  SES_FROM_EMAIL: "inquiries@murilloconsulting.co",
  NOTIFY_EMAIL: "larry@murilloconsulting.co",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  ENTRA_TENANT_ID: "11111111-2222-3333-4444-555555555555",
  ENTRA_CLIENT_ID: "client-id",
  ENTRA_CLIENT_SECRET: "client-secret",
  SESSION_SECRET: "test-session-secret-that-is-long-enough",
});

beforeEach(() => {
  vi.resetAllMocks();
});
