/**
 * Provider-agnostic analytics.
 *
 * There is no analytics vendor wired into this project yet, so `track()` is a
 * no-op until one appears on `window` (GTM's `dataLayer` or a `gtag` shim).
 * Adding Google Analytics, Plausible, etc. later means adding a snippet to
 * index.html — no component changes.
 *
 * PRIVACY CONTRACT — read before adding an event:
 * Energy bills contain account numbers, addresses and usage history. Nothing
 * derived from a bill or from a lead's personal details may be sent here.
 * Payloads are limited to the primitive shapes below; file *counts* and
 * *sizes* are fine, file *names* and *contents* are not.
 */

type AnalyticsValue = string | number | boolean;

export type AnalyticsEvent =
  | { name: "cta_click"; placement: string; variant: "primary" | "secondary" }
  | { name: "language_change"; from: string; to: string }
  | { name: "bill_upload_start"; file_count: number }
  | { name: "bill_upload_complete"; file_count: number; total_size_kb: number }
  | { name: "lead_form_submit"; has_files: boolean; file_count: number }
  | { name: "lead_form_error"; reason: "validation" | "network" | "server" | "verification" | "unconfigured" }
  | { name: "lead_form_success"; file_count: number }
  | { name: "phone_click"; placement: string }
  | { name: "email_click"; placement: string }
  | { name: "schedule_click"; placement: string }
  | { name: "campaign_view"; campaign: string }
  | { name: "campaign_conversion"; campaign: string };

interface DataLayerWindow extends Window {
  dataLayer?: Array<Record<string, AnalyticsValue>>;
  gtag?: (command: "event", name: string, params?: Record<string, AnalyticsValue>) => void;
}

/**
 * Defence in depth: even if a caller passes something unexpected, only
 * primitives survive, and any key that looks like it carries personal data or
 * a filename is dropped before it leaves the browser.
 */
const BLOCKED_KEY_PATTERN =
  /(name|email|phone|address|account|file_?name|notes|business|location|bill)/i;

function sanitize(payload: Record<string, unknown>): Record<string, AnalyticsValue> {
  const safe: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "name" || key === "campaign") {
      // `name` is the event name and `campaign` is a slug we author ourselves.
      if (typeof value === "string") safe[key] = value;
      continue;
    }
    if (BLOCKED_KEY_PATTERN.test(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    }
  }
  return safe;
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const { name, ...rest } = event;
  const params = sanitize(rest as Record<string, unknown>);
  const target = window as DataLayerWindow;

  try {
    if (typeof target.gtag === "function") {
      target.gtag("event", name, params);
    } else if (Array.isArray(target.dataLayer)) {
      target.dataLayer.push({ event: name, ...params });
    }
  } catch {
    // Analytics must never break the page.
  }
}

export function trackCtaClick(
  placement: string,
  variant: "primary" | "secondary" = "primary",
): void {
  track({ name: "cta_click", placement, variant });
}

export function trackLanguageChange(from: string, to: string): void {
  track({ name: "language_change", from, to });
}
