import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import LeadForm from "@/components/lead/LeadForm";
import en from "@/i18n/en";
import es from "@/i18n/es";
import { createLeadSchema } from "@/lib/leadSchema";
import { MAX_FILES } from "@/lib/fileValidation";
import { makeFile, renderWithLocale } from "./utils";

/**
 * Minimal XHR stand-in. The real transport uses XMLHttpRequest for upload
 * progress, so tests drive it rather than stubbing `submitLead` — that keeps
 * the FormData assembly and status handling under test.
 */
class FakeXhr {
  static instances: FakeXhr[] = [];
  static status = 200;

  upload = { addEventListener: vi.fn() };
  listeners: Record<string, Array<() => void>> = {};
  status = 0;
  responseType = "";
  timeout = 0;
  body: FormData | null = null;

  open = vi.fn();
  addEventListener(name: string, handler: () => void) {
    (this.listeners[name] ??= []).push(handler);
  }
  abort = vi.fn();
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

  it("states the accepted formats and size limit", () => {
    renderWithLocale(<LeadForm />, "en");
    expect(screen.getByText(/PDF, JPG, JPEG or PNG/)).toBeInTheDocument();
    expect(screen.getByText(/10 MB/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${MAX_FILES} files max`))).toBeInTheDocument();
  });

  it("restricts the file input to the supported types", () => {
    const { container } = renderWithLocale(<LeadForm />, "en");
    const input = container.querySelector('input[type="file"]')!;
    expect(input.getAttribute("accept")).toContain("application/pdf");
    expect(input.getAttribute("accept")).toContain("image/png");
    expect(input).toHaveAttribute("multiple");
  });
});

describe("LeadForm upload behaviour", () => {
  it("accepts a valid PDF and lists it", async () => {
    const { container } = renderWithLocale(<LeadForm />, "en");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [makeFile("march-bill.pdf", "application/pdf")] },
      });
    });

    expect(await screen.findByText("march-bill.pdf")).toBeInTheDocument();
  });

  it("rejects a disallowed type with a translated message", async () => {
    const { container } = renderWithLocale(<LeadForm />, "es");
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
    const { container } = renderWithLocale(<LeadForm />, "en");
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
    const { container } = renderWithLocale(<LeadForm />, "en");
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

  beforeEach(() => {
    FakeXhr.instances = [];
    FakeXhr.status = 200;
    vi.stubEnv("VITE_LEAD_ENDPOINT", "https://leads.example.com/submit");
    globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXhr;
    vi.unstubAllEnvs();
  });

  it("posts the lead and shows the translated confirmation", async () => {
    renderWithLocale(<LeadForm />, "es");
    fillValidForm(es as unknown as typeof en);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(es.form.submit, "i") }));
    });

    expect(await screen.findByText(es.form.status.successBody)).toBeInTheDocument();
    expect(FakeXhr.instances).toHaveLength(1);

    const body = FakeXhr.instances[0].body!;
    expect(body.get("firstName")).toBe("Ana");
    expect(body.get("businessName")).toBe("Ramirez Supply");
    expect(body.get("serviceType")).toBe("both");
    expect(body.get("consent")).toBe("true");
    expect(body.get("submittedLocale")).toBe("es");
  });

  it("sends a sanitized filename, never the raw path", async () => {
    const { container } = renderWithLocale(<LeadForm />, "en");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [makeFile("../../secret/bill.pdf", "application/pdf")] },
      });
    });

    expect(await screen.findByText("bill.pdf")).toBeInTheDocument();

    fillValidForm(en);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(en.form.submit, "i") }));
    });

    await screen.findByText(en.form.status.successBody);
    const uploaded = FakeXhr.instances[0].body!.get("bills") as File;
    expect(uploaded.name).toBe("bill.pdf");
  });

  it("attaches the campaign slug when submitted from a campaign page", async () => {
    renderWithLocale(<LeadForm campaign="restaurants" />, "en");
    fillValidForm(en);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(en.form.submit, "i") }));
    });

    await screen.findByText(en.form.status.successBody);
    expect(FakeXhr.instances[0].body!.get("campaign")).toBe("restaurants");
  });

  it("shows a recoverable error state on a server failure", async () => {
    FakeXhr.status = 500;
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(en.form.submit, "i") }));
    });

    expect(await screen.findByText(en.form.status.errorTitle)).toBeInTheDocument();
    // Falls back to the direct contact route rather than a dead end.
    expect(screen.getAllByText("contact@murilloconsulting.com").length).toBeGreaterThan(0);
    // No internal detail is surfaced.
    expect(document.body.textContent).not.toMatch(/500|leads\.example\.com/);
  });

  it("explains that submission is unavailable when no endpoint is configured", async () => {
    vi.stubEnv("VITE_LEAD_ENDPOINT", "");
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(en.form.submit, "i") }));
    });

    expect(
      await screen.findByText(en.form.status.unconfiguredTitle),
    ).toBeInTheDocument();
    expect(FakeXhr.instances).toHaveLength(0);
  });

  it("shows the Spanish confirmation on the Spanish form", async () => {
    renderWithLocale(<LeadForm />, "es");
    fillValidForm(es as unknown as typeof en);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(es.form.submit, "i") }));
    });

    expect(await screen.findByText(es.form.status.successBody)).toBeInTheDocument();
    expect(screen.queryByText(en.form.status.successBody)).toBeNull();
  });

  it("lets the visitor submit another business after success", async () => {
    renderWithLocale(<LeadForm />, "en");
    fillValidForm(en);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(en.form.submit, "i") }));
    });
    await screen.findByText(en.form.status.successBody);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: en.form.submitAnother }));
    });

    await waitFor(() =>
      expect(screen.getByLabelText(en.form.firstName)).toHaveValue(""),
    );
  });
});
