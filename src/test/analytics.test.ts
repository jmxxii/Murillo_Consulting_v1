import { beforeEach, describe, expect, it } from "vitest";
import { track } from "@/lib/analytics";

interface TestWindow extends Window {
  dataLayer?: Array<Record<string, unknown>>;
}

describe("analytics privacy contract", () => {
  beforeEach(() => {
    (window as TestWindow).dataLayer = [];
  });

  it("forwards events to the data layer when a provider is present", () => {
    track({ name: "cta_click", placement: "hero", variant: "primary" });
    expect((window as TestWindow).dataLayer).toEqual([
      { event: "cta_click", placement: "hero", variant: "primary" },
    ]);
  });

  it("is a no-op when no provider is installed", () => {
    delete (window as TestWindow).dataLayer;
    expect(() =>
      track({ name: "lead_form_success", file_count: 2 }),
    ).not.toThrow();
  });

  it("sends file counts and sizes but never identifying keys", () => {
    track({ name: "bill_upload_complete", file_count: 3, total_size_kb: 900 });
    const [event] = (window as TestWindow).dataLayer!;
    expect(event).toEqual({
      event: "bill_upload_complete",
      file_count: 3,
      total_size_kb: 900,
    });
  });

  it("strips PII-shaped keys even if a caller passes them", () => {
    // Deliberately bypassing the type to simulate a future mistake.
    track({
      name: "lead_form_success",
      file_count: 1,
      email: "owner@example.com",
      businessName: "Casa Murillo",
      file_name: "march-bill.pdf",
      notes: "account 12345",
    } as never);

    const [event] = (window as TestWindow).dataLayer!;
    expect(event).toEqual({ event: "lead_form_success", file_count: 1 });
    expect(JSON.stringify(event)).not.toMatch(/example\.com|Casa Murillo|march-bill|12345/);
  });

  it("keeps the campaign slug, which we author ourselves", () => {
    track({ name: "campaign_view", campaign: "restaurants" });
    expect((window as TestWindow).dataLayer![0]).toEqual({
      event: "campaign_view",
      campaign: "restaurants",
    });
  });
});
