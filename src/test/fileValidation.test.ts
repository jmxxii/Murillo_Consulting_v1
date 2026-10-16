import { describe, expect, it } from "vitest";
import {
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILES,
  sanitizeFileName,
  validateFiles,
} from "@/lib/fileValidation";
import { makeFile } from "./utils";

describe("sanitizeFileName", () => {
  it("strips path separators so traversal cannot survive", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("..\\..\\windows\\system32\\cmd.exe")).toBe("cmd.exe");
    expect(sanitizeFileName("/absolute/path/bill.pdf")).toBe("bill.pdf");
  });

  it("removes shell/archive metacharacters", () => {
    expect(sanitizeFileName('bi<>l|l?*.pdf')).toBe("bill.pdf");
  });

  it("drops leading dots so a file cannot become a dotfile", () => {
    expect(sanitizeFileName("...bill.pdf")).toBe("bill.pdf");
  });

  it("never returns an empty name", () => {
    expect(sanitizeFileName("")).toBe("file");
    expect(sanitizeFileName("///")).toBe("file");
  });

  it("caps very long names", () => {
    const long = `${"a".repeat(400)}.pdf`;
    expect(sanitizeFileName(long).length).toBeLessThanOrEqual(121);
  });
});

describe("validateFiles", () => {
  it("accepts PDF, JPEG and PNG with matching signatures", async () => {
    const files = [
      makeFile("bill.pdf", "application/pdf", { signature: "pdf" }),
      makeFile("bill.jpg", "image/jpeg", { signature: "jpeg" }),
      makeFile("bill.png", "image/png", { signature: "png" }),
    ];
    const { accepted, rejections } = await validateFiles(files);
    expect(accepted).toHaveLength(3);
    expect(rejections).toEqual([]);
  });

  it("rejects a disallowed extension", async () => {
    const { accepted, rejections } = await validateFiles([
      makeFile("bill.exe", "application/octet-stream", { signature: "none" }),
    ]);
    expect(accepted).toEqual([]);
    expect(rejections[0]).toMatchObject({ fileName: "bill.exe", reason: "wrong-type" });
  });

  it("rejects an executable renamed to .pdf (magic-byte check)", async () => {
    // Correct extension AND correct declared MIME type — only the content
    // reveals it is not a PDF.
    const { accepted, rejections } = await validateFiles([
      makeFile("payload.pdf", "application/pdf", { signature: "none" }),
    ]);
    expect(accepted).toEqual([]);
    expect(rejections[0].reason).toBe("content-mismatch");
  });

  it("rejects files over the size cap", async () => {
    const { accepted, rejections } = await validateFiles([
      makeFile("huge.pdf", "application/pdf", { sizeBytes: MAX_FILE_BYTES + 1 }),
    ]);
    expect(accepted).toEqual([]);
    expect(rejections[0].reason).toBe("too-large");
  });

  it("rejects empty files", async () => {
    const empty = new File([], "empty.pdf", { type: "application/pdf" });
    const { rejections } = await validateFiles([empty]);
    expect(rejections[0].reason).toBe("empty");
  });

  it("enforces the file-count cap across calls", async () => {
    const existing = Array.from({ length: MAX_FILES }, (_, i) =>
      makeFile(`bill-${i}.pdf`, "application/pdf"),
    );
    const { accepted, rejections } = await validateFiles(
      [makeFile("one-too-many.pdf", "application/pdf")],
      existing,
    );
    expect(accepted).toEqual([]);
    expect(rejections[0].reason).toBe("too-many");
  });

  it("reports sanitized names in rejections, not raw input", async () => {
    const { rejections } = await validateFiles([
      makeFile("../../evil.exe", "application/octet-stream", { signature: "none" }),
    ]);
    expect(rejections[0].fileName).toBe("evil.exe");
  });
});

describe("formatBytes", () => {
  it("formats readable sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});
