import type { Locale } from "@/i18n";

/**
 * Campaign content model.
 *
 * A campaign is DATA, not a page. `CampaignPage.tsx` renders any object that
 * satisfies `Campaign`, so launching a new campaign means adding one file to
 * this folder and one line to `index.ts` — no new components, no duplicated
 * layout.
 *
 * Every visitor-facing string is `Localized<string>`, which forces both
 * languages to be supplied at the type level.
 */

/** A value that must exist in every supported language. */
export type Localized<T> = Record<Locale, T>;

export type CampaignStatus = "draft" | "active" | "ended";

export interface CampaignBenefit {
  title: string;
  body: string;
}

export interface CampaignStep {
  title: string;
  body: string;
}

export interface CampaignService {
  title: string;
  body: string;
}

export interface CampaignFaqItem {
  question: string;
  answer: string;
}

/**
 * Testimonials are optional and OFF by default.
 *
 * Do not populate these with invented quotes. Only add a testimonial that the
 * named business has agreed in writing to have published.
 */
export interface CampaignTestimonial {
  quote: string;
  attribution: string;
  /** Business name or role. Never fabricate. */
  context?: string;
}

export interface CampaignHero {
  /** Optional path under /public. Omit to use the standard hero treatment. */
  image?: string;
  /** Required whenever `image` is set and the image carries meaning. */
  imageAlt?: Localized<string>;
  eyebrow: Localized<string>;
  headline: Localized<string>;
  supporting: Localized<string>;
  primaryCta: Localized<string>;
  secondaryCta?: Localized<string>;
}

export interface CampaignSeo {
  title: Localized<string>;
  description: Localized<string>;
  /** Social preview image path. Falls back to the site default. */
  ogImage?: string;
}

export interface Campaign {
  /** Internal campaign name — never rendered to visitors. */
  name: string;
  /** URL segment: /campaigns/<slug> and /es/campaigns/<slug>. */
  slug: string;
  status: CampaignStatus;
  /** ISO date (YYYY-MM-DD). Before this, the page 404s. */
  startDate?: string;
  /** ISO date (YYYY-MM-DD), inclusive. After this, the page 404s. */
  endDate?: string;
  /**
   * Attribution value attached to leads submitted from this page and sent to
   * analytics as `campaign`. Defaults to `slug`.
   */
  attribution?: string;
  /** Audience/industry this campaign targets. Rendered as an eyebrow chip. */
  audience: Localized<string>;

  hero: CampaignHero;
  seo: CampaignSeo;

  /** Sections are optional — omit one and it simply does not render. */
  benefits?: {
    heading: Localized<string>;
    body?: Localized<string>;
    items: Localized<CampaignBenefit[]>;
  };
  process?: {
    heading: Localized<string>;
    intro?: Localized<string>;
    steps: Localized<CampaignStep[]>;
    cta?: Localized<string>;
  };
  services?: {
    heading: Localized<string>;
    intro?: Localized<string>;
    items: Localized<CampaignService[]>;
  };
  testimonials?: {
    heading: Localized<string>;
    items: Localized<CampaignTestimonial[]>;
  };
  faq?: {
    heading: Localized<string>;
    intro?: Localized<string>;
    items: Localized<CampaignFaqItem[]>;
  };
  form?: {
    heading: Localized<string>;
    intro?: Localized<string>;
    submitLabel?: Localized<string>;
    /** Shown after a successful submission instead of the default copy. */
    thankYou?: Localized<string>;
  };
}

/** Picks the value for the active locale. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}
