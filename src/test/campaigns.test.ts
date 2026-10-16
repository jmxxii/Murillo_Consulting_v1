import { describe, expect, it } from "vitest";
import {
  campaigns,
  getCampaign,
  isCampaignVisible,
  pick,
  publicCampaignSlugs,
  type Campaign,
} from "@/content/campaigns";
import { LOCALES } from "@/i18n";

const base: Campaign = {
  name: "Test",
  slug: "test",
  status: "active",
  audience: { en: "For testers", es: "Para probadores" },
  hero: {
    eyebrow: { en: "e", es: "e-es" },
    headline: { en: "h", es: "h-es" },
    supporting: { en: "s", es: "s-es" },
    primaryCta: { en: "c", es: "c-es" },
  },
  seo: {
    title: { en: "t", es: "t-es" },
    description: { en: "d", es: "d-es" },
  },
};

describe("campaign registry", () => {
  it("has unique slugs", () => {
    const slugs = campaigns.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses URL-safe slugs", () => {
    for (const campaign of campaigns) {
      expect(campaign.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("provides every localized field in every supported language", () => {
    const missing: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (!value || typeof value !== "object") return;
      const keys = Object.keys(value as object);
      const isLocalized = LOCALES.every((code) => keys.includes(code));
      if (isLocalized) {
        for (const code of LOCALES) {
          const entry = (value as Record<string, unknown>)[code];
          if (entry === undefined || entry === null || entry === "") {
            missing.push(`${path}.${code}`);
          }
        }
        return;
      }
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        walk(child, `${path}.${key}`);
      }
    };
    for (const campaign of campaigns) walk(campaign, campaign.slug);
    expect(missing).toEqual([]);
  });

  it("ships no fabricated testimonials", () => {
    for (const campaign of campaigns) {
      expect(campaign.testimonials, `${campaign.slug} has testimonials`).toBeUndefined();
    }
  });

  it("looks campaigns up by slug", () => {
    expect(getCampaign("restaurants")?.slug).toBe("restaurants");
    expect(getCampaign("does-not-exist")).toBeUndefined();
    expect(getCampaign(undefined)).toBeUndefined();
  });
});

describe("campaign visibility", () => {
  it("shows active campaigns", () => {
    expect(isCampaignVisible(base)).toBe(true);
  });

  it("hides drafts in production but shows them in development", () => {
    const draft = { ...base, status: "draft" as const };
    expect(isCampaignVisible(draft, { isDev: false })).toBe(false);
    expect(isCampaignVisible(draft, { isDev: true })).toBe(true);
  });

  it("hides ended campaigns even in development", () => {
    const ended = { ...base, status: "ended" as const };
    expect(isCampaignVisible(ended, { isDev: true })).toBe(false);
  });

  it("respects the start and end dates", () => {
    const dated = { ...base, startDate: "2026-03-01", endDate: "2026-03-31" };
    expect(isCampaignVisible(dated, { today: new Date("2026-02-28T12:00:00Z") })).toBe(false);
    expect(isCampaignVisible(dated, { today: new Date("2026-03-01T12:00:00Z") })).toBe(true);
    expect(isCampaignVisible(dated, { today: new Date("2026-03-31T12:00:00Z") })).toBe(true);
    expect(isCampaignVisible(dated, { today: new Date("2026-04-01T12:00:00Z") })).toBe(false);
  });

  it("keeps drafts out of the sitemap", () => {
    // The bundled example campaign is a draft, so nothing is public yet.
    expect(publicCampaignSlugs()).toEqual([]);
  });
});

describe("pick", () => {
  it("selects the value for the active locale", () => {
    expect(pick(base.hero.headline, "en")).toBe("h");
    expect(pick(base.hero.headline, "es")).toBe("h-es");
  });
});
