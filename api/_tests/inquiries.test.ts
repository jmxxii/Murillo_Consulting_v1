import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { ddb } from "../_lib/aws.js";
import { GET } from "../config.js";
import { POST } from "../inquiries/index.js";
import { mockSend, request, sent } from "./helpers.js";

const validBody = {
  firstName: "Ana",
  lastName: "Lopez",
  businessName: "Lopez Bakery",
  email: "ana@example.com",
  phone: "(305) 555-0123",
  preferredLanguage: "es",
  businessLocation: "Miami, FL",
  serviceType: "electricity",
  locationCount: 2,
  consent: true,
  submittedLocale: "es",
  turnstileToken: "token",
  files: [
    { name: "../../June bill.pdf", type: "application/pdf", size: 1000 },
    { name: "meter.png", type: "image/png", size: 2000 },
  ],
};

function turnstile(success: boolean) {
  const fetchMock = vi.fn(async () => Response.json({ success }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function post(body: unknown) {
  return POST(request("/api/inquiries", { method: "POST", json: body }));
}

describe("POST /api/inquiries", () => {
  beforeEach(() => mockSend(ddb, {}));

  it("saves the inquiry as uploading and returns one bound upload slot per file", async () => {
    const fetchMock = turnstile(true);

    const res = await post(validBody);

    expect(res.status).toBe(201);
    const body = await res.json();
    const [item] = sent(ddb, "PutCommand").map((input) => input.Item);
    expect(item).toMatchObject({
      id: body.id,
      status: "uploading",
      businessName: "Lopez Bakery",
      submittedLocale: "es",
    });
    expect(item.turnstileToken).toBeUndefined();
    const days = (item.expiresAt * 1000 - Date.parse(item.createdAt)) / 86_400_000;
    expect(Math.round(days)).toBe(90);

    // Server-generated keys; the client filename is sanitized display text only.
    expect(item.files[0].key).toMatch(new RegExp(`^inquiries/${body.id}/[0-9a-f-]{36}\\.pdf$`));
    expect(item.files[1].key).toMatch(/\.png$/);
    expect(item.files[0].name).toBe("June bill.pdf");

    expect(body.uploads).toHaveLength(2);
    expect(vi.mocked(createPresignedPost).mock.calls[0][1]).toMatchObject({
      Key: item.files[0].key,
      Fields: { "Content-Type": "application/pdf" },
      Conditions: [
        ["content-length-range", 1000, 1000],
        ["eq", "$Content-Type", "application/pdf"],
      ],
      Expires: 300,
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, { body: URLSearchParams }];
    expect(init.body.get("secret")).toBe("turnstile-secret");
    expect(init.body.get("response")).toBe("token");
  });

  it.each([
    ["an invalid email", { email: "nope" }],
    ["missing consent", { consent: false }],
    ["a disallowed file type", { files: [{ name: "a.gif", type: "image/gif", size: 10 }] }],
    ["a file over 10 MB", { files: [{ name: "a.pdf", type: "application/pdf", size: 11e6 }] }],
    ["more than 6 files", { files: Array(7).fill(validBody.files[0]) }],
    [
      "more than 30 MB in total",
      { files: Array(4).fill({ name: "a.pdf", type: "application/pdf", size: 9e6 }) },
    ],
    ["no Turnstile token", { turnstileToken: "" }],
  ])("rejects %s before checking Turnstile", async (_label, override) => {
    const fetchMock = turnstile(true);

    const res = await post({ ...validBody, ...override });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sent(ddb, "PutCommand")).toHaveLength(0);
  });

  it("rejects a non-JSON body", async () => {
    const res = await POST(request("/api/inquiries", { method: "POST", body: "not json" }));
    expect(res.status).toBe(400);
  });

  it("rejects a failed Turnstile check without saving", async () => {
    turnstile(false);

    const res = await post(validBody);

    expect(res.status).toBe(403);
    expect(sent(ddb, "PutCommand")).toHaveLength(0);
  });

  it("fails closed when Turnstile is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    expect((await post(validBody)).status).toBe(403);
  });
});

describe("GET /api/config", () => {
  it("serves the public Turnstile site key from the server environment", async () => {
    process.env.TURNSTILE_SITE_KEY = "site-key";
    expect(await GET().json()).toEqual({ turnstileSiteKey: "site-key" });
    delete process.env.TURNSTILE_SITE_KEY;
    expect(await GET().json()).toEqual({ turnstileSiteKey: null });
  });
});
