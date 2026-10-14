import { ddb, s3 } from "../_lib/aws.js";
import { GET as list } from "../admin/inquiries/index.js";
import { DELETE, GET, PATCH } from "../admin/inquiries/[id].js";
import { adminCookie, awsError, ID, mockSend, request, sent, SITE } from "./helpers.js";

const stored = {
  id: ID,
  status: "new",
  createdAt: "2026-10-01T12:00:00.000Z",
  expiresAt: 1_800_000_000,
  businessName: "Lopez Bakery",
  firstName: "Ana",
  lastName: "Lopez",
  files: [
    { key: `inquiries/${ID}/a.pdf`, name: "Factura junio.pdf", type: "application/pdf", size: 1000 },
    { key: `inquiries/${ID}/b.png`, name: "meter.png", type: "image/png", size: 2000 },
  ],
};

async function admin(path: string, init: RequestInit & { json?: unknown } = {}) {
  const cookie = await adminCookie();
  return request(path, { ...init, headers: { cookie, origin: SITE, ...init.headers } });
}

describe("admin endpoints require a session", () => {
  const path = `/api/admin/inquiries/${ID}`;

  it.each([
    ["list", () => list(request("/api/admin/inquiries"))],
    ["detail", () => GET(request(path))],
    ["status change", () => PATCH(request(path, { method: "PATCH", json: { status: "closed" } }))],
    ["delete", () => DELETE(request(path, { method: "DELETE" }))],
    [
      "a forged cookie",
      () => GET(request(path, { headers: { cookie: "mc_admin=eyJhbGciOiJIUzI1NiJ9.e30.x" } })),
    ],
  ])("401 for %s", async (_label, call) => {
    mockSend(ddb, {});
    expect((await call()).status).toBe(401);
    expect(vi.mocked(ddb.send)).not.toHaveBeenCalled();
  });

  it("403 for a state change from another origin", async () => {
    mockSend(ddb, {});
    const req = await admin(path, {
      method: "DELETE",
      headers: { origin: "https://evil.example" },
    });
    expect((await DELETE(req)).status).toBe(403);
    expect(vi.mocked(s3.send)).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/inquiries", () => {
  it("merges all statuses newest first", async () => {
    const byStatus: Record<string, object[]> = {
      new: [{ ...stored, id: "a", createdAt: "2026-10-03T00:00:00Z" }],
      contacted: [{ ...stored, id: "b", status: "contacted", createdAt: "2026-10-05T00:00:00Z" }],
      closed: [{ ...stored, id: "c", status: "closed", createdAt: "2026-10-01T00:00:00Z" }],
    };
    mockSend(ddb, {
      QueryCommand: (input) => ({ Items: byStatus[input.ExpressionAttributeValues[":status"]] }),
    });

    const res = await list(await admin("/api/admin/inquiries"));
    const body = await res.json();

    expect(body.inquiries.map((i: { id: string }) => i.id)).toEqual(["b", "a", "c"]);
    expect(body.inquiries[0]).toEqual({
      id: "b",
      status: "contacted",
      createdAt: "2026-10-05T00:00:00Z",
      businessName: "Lopez Bakery",
      firstName: "Ana",
      lastName: "Lopez",
      fileCount: 2,
    });
    expect(body.user).toEqual({ name: "Larry Murillo", email: "larry@murilloconsulting.co" });
    expect(sent(ddb, "QueryCommand")[0]).toMatchObject({
      IndexName: "status-createdAt-index",
      ScanIndexForward: false,
    });
  });

  it("queries a single status when filtered", async () => {
    mockSend(ddb, { QueryCommand: () => ({ Items: [] }) });

    await list(await admin("/api/admin/inquiries?status=closed"));

    const queries = sent(ddb, "QueryCommand");
    expect(queries).toHaveLength(1);
    expect(queries[0].ExpressionAttributeValues[":status"]).toBe("closed");
  });

  it("rejects an unknown status, including uploading", async () => {
    const res = await list(await admin("/api/admin/inquiries?status=uploading"));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/admin/inquiries/:id", () => {
  it("returns short-lived view and download links, and flags expired files", async () => {
    mockSend(ddb, { GetCommand: () => ({ Item: stored }) });
    mockSend(s3, {
      HeadObjectCommand: ({ Key }) => {
        if (Key.endsWith("b.png")) throw awsError("NotFound");
        return {};
      },
    });

    const res = await GET(await admin(`/api/admin/inquiries/${ID}`));
    const { inquiry } = await res.json();

    expect(inquiry.expiresAt).toBeUndefined();
    expect(JSON.stringify(inquiry)).not.toContain(`"key"`);
    const [pdf, png] = inquiry.files;
    expect(pdf).toMatchObject({ name: "Factura junio.pdf", available: true });
    expect(decodeURIComponent(pdf.viewUrl)).toContain("disposition=inline");
    expect(decodeURIComponent(pdf.downloadUrl)).toContain(
      `attachment; filename="Factura junio.pdf"; filename*=UTF-8''Factura%20junio.pdf`,
    );
    expect(png).toEqual({ name: "meter.png", type: "image/png", size: 2000, available: false });
  });

  it("hides inquiries that never finished uploading", async () => {
    mockSend(ddb, { GetCommand: () => ({ Item: { ...stored, status: "uploading" } }) });
    expect((await GET(await admin(`/api/admin/inquiries/${ID}`))).status).toBe(404);
  });
});

describe("PATCH /api/admin/inquiries/:id", () => {
  const patch = async (json: unknown) =>
    PATCH(await admin(`/api/admin/inquiries/${ID}`, { method: "PATCH", json }));

  it("changes the status of an existing, completed inquiry", async () => {
    mockSend(ddb, {});

    const res = await patch({ status: "contacted" });

    expect(res.status).toBe(200);
    const [update] = sent(ddb, "UpdateCommand");
    expect(update.ConditionExpression).toBe("attribute_exists(id) AND #status <> :uploading");
    expect(update.ExpressionAttributeValues[":status"]).toBe("contacted");
  });

  it("rejects an unknown status", async () => {
    expect((await patch({ status: "uploading" })).status).toBe(400);
  });

  it("returns 404 when the inquiry is gone", async () => {
    mockSend(ddb, {
      UpdateCommand: () => {
        throw awsError("ConditionalCheckFailedException");
      },
    });
    expect((await patch({ status: "closed" })).status).toBe(404);
  });
});

describe("DELETE /api/admin/inquiries/:id", () => {
  it("deletes every object under the inquiry's prefix, then the record", async () => {
    mockSend(s3, {
      ListObjectsV2Command: () => ({
        Contents: [{ Key: `inquiries/${ID}/a.pdf` }, { Key: `inquiries/${ID}/late.png` }],
      }),
    });
    mockSend(ddb, {});

    const res = await DELETE(await admin(`/api/admin/inquiries/${ID}`, { method: "DELETE" }));

    expect(res.status).toBe(204);
    expect(sent(s3, "ListObjectsV2Command")[0].Prefix).toBe(`inquiries/${ID}/`);
    expect(sent(s3, "DeleteObjectCommand").map((input) => input.Key)).toEqual([
      `inquiries/${ID}/a.pdf`,
      `inquiries/${ID}/late.png`,
    ]);
    expect(sent(ddb, "DeleteCommand")[0].Key).toEqual({ id: ID });
  });
});
