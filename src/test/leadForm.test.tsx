import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import LeadForm from "@/components/lead/LeadForm";
import FileDropzone from "@/components/lead/FileDropzone";
import en from "@/i18n/en";
import es from "@/i18n/es";
import { createLeadSchema } from "@/lib/leadSchema";
import { MAX_FILES } from "@/lib/fileValidation";
import { makeFile, renderWithLocale } from "./utils";

/**
 * Minimal XHR stand-in for the direct-to-S3 uploads. The real transport uses
 * XMLHttpRequest for upload progress, so tests drive it rather than stubbing
 * `submitLead`, which keeps the FormData assembly under test.
 */
class FakeXhr {
  static instances: FakeXhr[] = [];
  static status = 204;

  upload = { addEventListener: vi.fn() };
  listeners: Record<string, Array<() => void>> = {};
  status = 0;
  timeout = 0;
  url = "";
  body: FormData | null = null;

  open(_method: string, url: string) {
    this.url = url;
  }
  addEventListener(name: string, handler: () => void) {
    (this.listeners[name] ??= []).push(handler);
  }
  send(body: FormData) {
    this.body = body;
    FakeXhr.instances.push(this);
    queueMicrotask(() => {
      this.status = FakeXhr.status;
      this.listeners.load?.forEach((fn) => fn());
    });
  }
}

function fillValidForm(dict: typeof en) {
  fireEvent.change(screen.getByLabelText(dict.form.firstName), {
    target: { value: "Ana" },
  });
  fireEvent.change(screen.getByLabelText(dict.form.lastName), {
    target: { value: "Ramirez" },
  });
  fireEvent.change(screen.getByLabelText(dict.form.email), {
    target: { value: "ana@example.com" },
  });
  fireEvent.change(screen.getByLabelText(dict.form.phone), {
    target: { value: "312 555 0134" },
  });
  fireEvent.change(screen.getByLabelText(dict.form.businessName), {
    target: { value: "Ramirez Supply" },
  });
  fireEvent.change(screen.getByLabelText(dict.form.businessLocation), {
    target: { value: "Chicago, IL" },
  });
  fireEvent.click(screen.getByRole("radio", { name: dict.form.serviceTypeBoth }));
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("lead schema", () => {
  it("uses the active dictionary for every message", () => {
    const enSchema = createLeadSchema(en);
    const esSchema = createLeadSchema(es);

    const empty = {};
    const enErrors = enSchema.safeParse(empty);
    const esErrors = esSchema.safeParse(empty);
    expect(enErrors.success).toBe(false);
    expect(esErrors.success).toBe(false);

    const messages = (result: typeof enErrors) =>
      result.success ? [] : result.error.issues.map((i) => i.message);

    expect(messages(enErrors)).toContain(en.form.errors.firstNameRequired);
    expect(messages(esErrors)).toContain(es.form.errors.firstNameRequired);
  });

  it("rejects an invalid email and an impossible phone number", () => {
    const schema = createLeadSchema(en);
    const result = schema.safeParse({
      firstName: "Ana",
      lastName: "Ramirez",
      businessName: "Ramirez Supply",
      email: "not-an-email",
      phone: "abc",
      preferredLanguage: "en",
      businessLocation: "Chicago, IL",
      serviceType: "both",
      locationCount: 1,
      consent: true,
    });
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((i) => i.message);
    expect(messages).toContain(en.form.errors.emailInvalid);
    expect(messages).toContain(en.form.errors.phoneInvalid);
  });

  it("requires the consent checkbox", () => {
    const schema = createLeadSchema(en);
    const result = schema.safeParse({
      firstName: "Ana",
      lastName: "Ramirez",
      businessName: "Ramirez Supply",
      email: "ana@example.com",
      phone: "3125550134",
      preferredLanguage: "en",
      businessLocation: "Chicago, IL",
      serviceType: "both",
      locationCount: 1,
      consent: false,
    });
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((i) => i.message);
    expect(messages).toContain(en.form.errors.consentRequired);
  });

  it("coerces the location count from the string a number input produces", () => {
    const schema = createLeadSchema(en);
    const result = schema.safeParse({
      firstName: "Ana",
      lastName: "Ramirez",
      businessName: "Ramirez Supply",
      email: "ana@example.com",
      phone: "3125550134",
      preferredLanguage: "en",
      businessLocation: "Chicago, IL",
      serviceType: "both",
      locationCount: "3",
      consent: true,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.locationCount).toBe(3);
  });
});

describe("LeadForm rendering", () => {
  it("renders every field label translated", () => {
    renderWithLocale(<LeadForm />, "es");
    for (const label of [
      es.form.firstName,
      es.form.lastName,
      es.form.email,
      es.form.phone,
      es.form.businessName,
      es.form.businessLocation,
      es.form.locationCount,
      es.form.notes,
    ]) {
      // Start-anchored: "Nombre" must not also match "Nombre del negocio".
      const pattern = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
      expect(screen.getAllByLabelText(pattern).length).toBeGreaterThan(0);
    }
  });

  it("defaults the preferred language to the page language", () => {
    renderWithLocale(<LeadForm />, "es");
    expect(screen.getByRole("combobox")).toHaveTextContent("Español");
  });

  it("shows translated validation errors on submit", async () => {
    renderWithLocale(<LeadForm />, "es");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(es.form.submit, "i") }));
    });

    expect(await screen.findByText(es.form.errors.firstNameRequired)).toBeInTheDocument();
    expect(screen.getByText(es.form.errors.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(es.form.errors.consentRequired)).toBeInTheDocument();
    // No English leaked through.
    expect(screen.queryByText(en.form.errors.firstNameRequired)).toBeNull();
  });

  it("lets the visitor attach bills", () => {
    const { container } = renderWithLocale(<LeadForm />, "en");
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
    expect(screen.getByText(en.form.sectionFiles)).toBeInTheDocument();
  });

  it("asks visitors to submit their bills in both languages", () => {
    expect(en.form.submit).toBe("Submit Your Bills");
    expect(es.form.submit).toBe("Envía tus facturas");
    for (const dict of [en, es]) {
      expect(dict.nav.primaryCta).toBe(dict.form.submit);
      expect(dict.hero.primaryCta).toBe(dict.form.submit);
      expect(dict.billCta.primaryCta).toBe(dict.form.submit);
    }
  });
});

/** FileDropzone validation, tested directly without the rest of the form. */
function DropzoneHarness() {
  const [files, setFiles] = useState<File[]>([]);
  return <FileDropzone files={files} onChange={setFiles} uploadProgress={null} />;
}

describe("FileDropzone", () => {
  it("states the accepted formats and size limit", () => {
    renderWithLocale(<DropzoneHarness />, "en");
    expect(screen.getByText(/PDF, JPG, JPEG or PNG/)).toBeInTheDocument();
    expect(screen.getByText(/10 MB/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${MAX_FILES} files max`))).toBeInTheDocument();
  });

  it("restricts the file input to the supported types", () => {
    const { container } = renderWithLocale(<DropzoneHarness />, "en");
    const input = container.querySelector('input[type="file"]')!;
    expect(input.getAttribute("accept")).toContain("application/pdf");
    expect(input.getAttribute("accept")).toContain("image/png");
    expect(input).toHaveAttribute("multiple");
  });

  it("accepts a valid PDF and lists it", async () => {
    const { container } = renderWithLocale(<DropzoneHarness />, "en");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [makeFile("march-bill.pdf", "application/pdf")] },
      });
    });

    expect(await screen.findByText("march-bill.pdf")).toBeInTheDocument();
  });

  it("rejects a disallowed type with a translated message", async () => {
    const { container } = renderWithLocale(<DropzoneHarness />, "es");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [makeFile("virus.exe", "application/octet-stream", { signature: "none" })],
        },
      });
    });

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/no es un tipo de archivo compatible/i)).toBeInTheDocument();
  });

  it("rejects an executable disguised as a PDF", async () => {
    const { container } = renderWithLocale(<DropzoneHarness />, "en");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [makeFile("payload.pdf", "application/pdf", { signature: "none" })],
        },
      });
    });

    const alert = await screen.findByRole("alert");
    expect(
      within(alert).getByText(/does not appear to be a valid PDF or image file/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("payload.pdf")).toBeNull();
  });

  it("rejects a file over the size limit", async () => {
    const { container } = renderWithLocale(<DropzoneHarness />, "en");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [
            makeFile("huge.pdf", "application/pdf", { sizeBytes: 11 * 1024 * 1024 }),
          ],
        },
      });
    });

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/is larger than 10 MB/i)).toBeInTheDocument();
  });
});

describe("LeadForm submission", () => {
  const originalXhr = globalThis.XMLHttpRequest;
  const INQUIRY_ID = "0b9c6a44-3a2f-4e8e-9d6b-2f1f6a7c8d90";
  let createResponse: () => Response;
  let completeResponse: () => Response;
  let configResponse: () => Response;
  let fetchMock: ReturnType<typeof vi.fn>;
  let turnstileRender: ReturnType<typeof vi.fn>;

  /** JSON bodies of the calls to our API, keyed by endpoint. */
  const apiCall = (suffix: string) => {
    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith(suffix));
    return call && call[1].body ? JSON.parse(call[1].body) : call && {};
  };

  const submit = async (dict: typeof en = en) => {
    await act(async () => {}); // let the Turnstile widget deliver its token
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(dict.form.submit, "i") }));
    });
  };

  const attach = async (container: HTMLElement, files: File[]) => {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });
  };

  beforeEach(() => {
    FakeXhr.instances = [];
    FakeXhr.status = 204;
    globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;

    createResponse = () =>
      Response.json(
        {
          id: INQUIRY_ID,
          uploads: [0, 1, 2].map((n) => ({
            url: "https://bucket.s3.amazonaws.com/",
            fields: { key: `inquiries/${INQUIRY_ID}/${n}.pdf`, policy: "p" },
          })),
        },
        { status: 201 },
      );
    completeResponse = () => Response.json({ rejected: [] });
    configResponse = () => Response.json({ turnstileSiteKey: "test-site-key" });
    fetchMock = vi.fn(async (url: string) =>
      url === "/api/config"
        ? configResponse()
        : url.endsWith("/complete")
          ? completeResponse()
          : createResponse(),
    );
    vi.stubGlobal("fetch", fetchMock);

    // Passes the bot check straight away, as Turnstile's managed mode usually does.
    turnstileRender = vi.fn((_el: HTMLElement, options: { callback: (t: string) => void }) => {
      queueMicrotask(() => options.callback("turnstile-token"));
      return "widget-1";
    });
    vi.stubGlobal("turnstile", { render: turnstileRender, remove: vi.fn() });
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXhr;
  });

  /** True once the form has posted to the inquiry API (the config fetch does not count). */
  const submitted = () => fetchMock.mock.calls.some(([url]) => String(url).startsWith("/api/inquiries"));

  it("creates the inquiry, completes it and shows the translated confirmation", async () => {
    renderWithLocale(<LeadForm />, "es");
    fillValidForm(es as unknown as typeof en);
    await submit(es as unknown as typeof en);

    expect(await screen.findByText(es.form.status.successBody)).toBeInTheDocument();
    expect(screen.queryByText(en.form.status.successBody)).toBeNull();

    expect(apiCall("/api/inquiries")).toMatchObject({
      firstName: "Ana",
      businessName: "Ramirez Supply",
      serviceType: "both",
      consent: true,
      submittedLocale: "es",
      turnstileToken: "turnstile-token",
      files: [],
    });
    expect(apiCall(`/api/inquiries/${INQUIRY_ID}/complete`)).toEqual({});
    expect(FakeXhr.instances).toHaveLength(0);
  });

  it("uploads each bill straight to its S3 slot, sending only a sanitized name to the API", async () => {
    const { container } = renderWithLocale(<LeadForm />, "en");
    await attach(container, [makeFile("../../secret/bill.pdf", "application/pdf")]);
    expect(await screen.findByText("bill.pdf")).toBeInTheDocument();

    fillValidForm(en);
    await submit();
    await screen.findByText(en.form.status.successBody);

    expect(apiCall("/api/inquiries").files).toEqual([
      { name: "bill.pdf", type: "application/pdf", size: 1024 },
    ]);
    const [upload] = FakeXhr.instances;
    expect(upload.url).toBe("https://bucket.s3.amazonaws.com/");
    const fields = [...upload.body!.keys()];
    expect(fields).toEqual(["key", "policy", "file"]); // S3 needs the file last
    expect(upload.body!.get("key")).toBe(`inquiries/${INQUIRY_ID}/0.pdf`);
    expect(apiCall("/complete")).toEqual({});
  });

  it("tells the visitor which files did not arrive", async () => {
    completeResponse = () => Response.json({ rejected: [1] });
    const { container } = renderWithLocale(<LeadForm />, "en");
    await attach(container, [
      makeFile("june.pdf", "application/pdf"),
      makeFile("meter.png", "image/png", { signature: "png" }),
    ]);
    expect(await screen.findByText("meter.png")).toBeInTheDocument();
    fillValidForm(en);
    await submit();

    expect(await screen.findByText(en.form.status.successBody)).toBeInTheDocument();
    expect(screen.getByText(/these files did not upload: meter\.png\./)).toBeInTheDocument();
  });

  it("attaches the campaign slug when submitted from a campaign page", async () => {
    renderWithLocale(<LeadForm campaign="restaurants" />, "en");
    fillValidForm(en);
    await submit();

    await screen.findByText(en.form.status.successBody);
    expect(apiCall("/api/inquiries").campaign).toBe("restaurants");
  });

  it("shows a recoverable error state on a server failure", async () => {
    createResponse = () => new Response("Internal detail: table inquiries", { status: 500 });
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);
    await submit();

    expect(await screen.findByText(en.form.status.errorTitle)).toBeInTheDocument();
    // Falls back to the direct contact route rather than a dead end.
    expect(screen.getAllByText("contact@murilloconsulting.co").length).toBeGreaterThan(0);
    // No internal detail is surfaced.
    expect(document.body.textContent).not.toMatch(/500|Internal detail/);
  });

  it("shows an error state when the network fails", async () => {
    createResponse = () => {
      throw new TypeError("Failed to fetch");
    };
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);
    await submit();

    expect(await screen.findByText(en.form.status.errorTitle)).toBeInTheDocument();
  });

  it("explains a failed bot check and gets a fresh Turnstile token for the retry", async () => {
    createResponse = () => Response.json({ error: "captcha" }, { status: 403 });
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);
    await submit();

    expect(await screen.findByText(en.form.status.verificationTitle)).toBeInTheDocument();
    await waitFor(() => expect(turnstileRender).toHaveBeenCalledTimes(2));
  });

  it("waits for the bot check instead of submitting without a token", async () => {
    turnstileRender.mockImplementation(() => "widget-1"); // never calls back
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);
    await submit();

    expect(await screen.findByText(en.form.errors.verificationPending)).toBeInTheDocument();
    expect(submitted()).toBe(false);
  });

  it("reads the Turnstile site key from the API at runtime, not from the build", async () => {
    renderWithLocale(<LeadForm />, "en");
    await waitFor(() => expect(turnstileRender).toHaveBeenCalled());
    expect(turnstileRender.mock.calls[0][1]).toMatchObject({ sitekey: "test-site-key" });
  });

  it("explains that submission is unavailable when Turnstile is not configured", async () => {
    configResponse = () => Response.json({ turnstileSiteKey: null });
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);
    await submit();

    expect(await screen.findByText(en.form.status.unconfiguredTitle)).toBeInTheDocument();
    expect(submitted()).toBe(false);
  });

  it("lets the visitor submit another business after success", async () => {
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);
    await submit();
    await screen.findByText(en.form.status.successBody);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: en.form.submitAnother }));
    });

    await waitFor(() =>
      expect(screen.getByLabelText(en.form.firstName)).toHaveValue(""),
    );
  });
});

describe("LeadForm privacy notice", () => {
  it("links to the privacy policy in the visitor's language", () => {
    renderWithLocale(<LeadForm />, "es", ["/es"]);
    expect(screen.getByRole("link", { name: es.form.privacyLink })).toHaveAttribute(
      "href",
      "/es/privacy",
    );
  });
});
