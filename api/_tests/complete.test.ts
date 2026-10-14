import { ddb, s3, ses } from "../_lib/aws.js";
import type { Inquiry } from "../_lib/inquiry.js";
import { POST } from "../inquiries/[id]/complete.js";
import { awsError, ID, mockSend, request, sent } from "./helpers.js";

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const inquiry = {
  id: ID,
  status: "uploading",
  businessName: "Lopez\nBakery",
  email: "ana@example.com",
  phone: "(305) 555-0123",
  files: [
    { key: `inquiries/${ID}/a.pdf`, name: "bill.pdf", type: "application/pdf", size: 1000 },
    { key: `inquiries/${ID}/b.png`, name: "meter.png", type: "image/png", size: 2000 },
  ],
} as unknown as Inquiry;

/** Stored objects by key: leading bytes + real size. Missing keys throw NoSuchKey. */
function storage(objects: Record<string, { bytes: number[]; size: number }>) {
  mockSend(s3, {
    GetObjectCommand: ({ Key }) => {
      const object = objects[Key];
      if (!object) throw awsError("NoSuchKey");
      return {
        ContentRange: `bytes 0-7/${object.size}`,
        Body: { transformToByteArray: async () => new Uint8Array(object.bytes) },
      };
    },
  });
}

const goodFiles = {
  [inquiry.files[0].key]: { bytes: PDF, size: 1000 },
  [inquiry.files[1].key]: { bytes: PNG, size: 2000 },
};

function complete(id = ID) {
  return POST(request(`/api/inquiries/${id}/complete`, { method: "POST" }));
}

describe("POST /api/inquiries/:id/complete", () => {
  beforeEach(() => {
    mockSend(ddb, { GetCommand: () => ({ Item: structuredClone(inquiry) }) });
    mockSend(ses, {});
  });

  it("marks the inquiry new and emails Larry without contact or bill details", async () => {
    storage(goodFiles);

    const res = await complete();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ rejected: [] });

    const [update] = sent(ddb, "UpdateCommand");
    expect(update.ConditionExpression).toBe("#status = :uploading");
    expect(update.ExpressionAttributeValues[":new"]).toBe("new");
    expect(update.ExpressionAttributeValues[":files"]).toHaveLength(2);

    const [email] = sent(ses, "SendEmailCommand");
    expect(email.Destination.ToAddresses).toEqual(["larry@murilloconsulting.co"]);
    const { Subject, Body } = email.Content.Simple;
    expect(Subject.Data).toBe("New inquiry: Lopez Bakery");
    expect(Body.Text.Data).toContain(`https://murilloconsulting.com/admin/inquiries/${ID}`);
    const text = JSON.stringify(email);
    for (const secret of ["ana@example.com", "555-0123", "bill.pdf", inquiry.files[0].key]) {
      expect(text).not.toContain(secret);
    }
  });

  it("deletes and drops a file whose content does not match its declared type", async () => {
    storage({ ...goodFiles, [inquiry.files[1].key]: { bytes: PDF, size: 2000 } });

    const res = await complete();

    expect(await res.json()).toEqual({ rejected: [1] });
    expect(sent(s3, "DeleteObjectCommand")).toEqual([
      { Bucket: "test-bucket", Key: inquiry.files[1].key },
    ]);
    const [update] = sent(ddb, "UpdateCommand");
    expect(update.ExpressionAttributeValues[":files"]).toEqual([inquiry.files[0]]);
  });

  it("deletes a file whose real size differs from the declared size", async () => {
    storage({ ...goodFiles, [inquiry.files[0].key]: { bytes: PDF, size: 999 } });

    expect(await (await complete()).json()).toEqual({ rejected: [0] });
    expect(sent(s3, "DeleteObjectCommand")).toHaveLength(1);
  });

  it("drops a file that was never uploaded", async () => {
    storage({ [inquiry.files[0].key]: goodFiles[inquiry.files[0].key] });

    expect(await (await complete()).json()).toEqual({ rejected: [1] });
    expect(sent(s3, "DeleteObjectCommand")).toHaveLength(0);
  });

  it("returns 404 and sends nothing for an inquiry that is already complete", async () => {
    mockSend(ddb, { GetCommand: () => ({ Item: { ...inquiry, status: "new" } }) });

    expect((await complete()).status).toBe(404);
    expect(sent(ddb, "UpdateCommand")).toHaveLength(0);
    expect(sent(ses, "SendEmailCommand")).toHaveLength(0);
  });

  it("returns 404 for an unknown or malformed id", async () => {
    mockSend(ddb, { GetCommand: () => ({}) });
    expect((await complete()).status).toBe(404);
    expect((await complete("not-a-uuid")).status).toBe(404);
  });

  it("sends no second email when a concurrent call already completed it", async () => {
    storage(goodFiles);
    mockSend(ddb, {
      GetCommand: () => ({ Item: structuredClone(inquiry) }),
      UpdateCommand: () => {
        throw awsError("ConditionalCheckFailedException");
      },
    });

    expect((await complete()).status).toBe(409);
    expect(sent(ses, "SendEmailCommand")).toHaveLength(0);
  });

  it("still succeeds when the notification email fails", async () => {
    storage(goodFiles);
    mockSend(ses, {
      SendEmailCommand: () => {
        throw awsError("MessageRejected");
      },
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    expect((await complete()).status).toBe(200);
    expect(log).toHaveBeenCalledWith(expect.any(String), "MessageRejected");
  });
});
