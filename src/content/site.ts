/**
 * Verified business facts — the single source of truth for anything the site
 * asserts about Murillo Consulting.
 *
 * IMPORTANT: only add a value here if it has been confirmed by the business.
 * Anything unconfirmed stays `null`; the UI hides those entries rather than
 * showing an invented placeholder. Structured data (JSON-LD) is generated
 * from this file for the same reason — we never publish a claim we cannot
 * support.
 */

export interface SiteConfig {
  legalName: string;
  shortName: string;
  /** Production origin, used for canonical URLs, hreflang and og:url. */
  siteUrl: string;
  /** Confirmed in the repository (previous ScheduleSection mailto). */
  email: string | null;
  /** NOT CONFIRMED — business input required. Rendered only when set. */
  phone: string | null;
  /** Microsoft Bookings link confirmed in the repository. */
  schedulingUrl: string | null;
  /** Primary human contact. */
  contactPerson: {
    name: string;
    /** Optional portrait at /assets/team/. Null renders initials instead. */
    photo: string | null;
  };
  /**
   * NOT CONFIRMED — leaving this empty keeps `areaServed` out of the
   * structured data rather than guessing a service territory.
   */
  areaServed: string[];
  social: {
    twitter: string | null;
  };
  /**
   * Logo artwork.
   *
   * `mc-logo-stacked.png` (emblem over wordmark) is the master supplied by
   * the business. Everything else is derived from it, so all lockups share
   * one palette:
   *
   *   mc-logo-horizontal*   emblem + wordmark recomposed at the official
   *                         lockup geometry (emblem 430px, 56px gap,
   *                         wordmark 230px, vertically centred) — the
   *                         proportions of the previous horizontal asset,
   *                         rebuilt from the master's cleaner components
   *   mc-symbol*            the emblem, cropped and resampled
   *   *-reversed            the same shape in flat white, for navy surfaces
   *
   * If the business supplies a native horizontal export (ideally SVG), it
   * should replace these. Do not re-derive the palette from a compressed
   * PNG — see the note in src/index.css.
   */
  logo: {
    color: string;
    reversed: string;
    stacked: string | null;
    stackedReversed: string | null;
    symbol: string;
    symbolReversed: string;
  };
  /** Social preview image. Falls back to the color logo until artwork exists. */
  ogImage: string;
}

export const siteConfig: SiteConfig = {
  legalName: "Murillo Consulting, LLC",
  shortName: "Murillo Consulting",
  siteUrl: "https://murilloconsulting.co",
  email: "contact@murilloconsulting.co",
  phone: null,
  schedulingUrl:
    "https://outlook.office.com/book/EnergyStrategy@murilloconsulting.co/?ismsaljsauthenabled=true",
  contactPerson: {
    name: "Larry Murillo",
    photo: null,
  },
  areaServed: [],
  social: {
    twitter: "@MurilloConsult",
  },
  logo: {
    color: "/assets/logo/mc-logo-horizontal.png",
    reversed: "/assets/logo/mc-logo-horizontal-reversed.png",
    stacked: "/assets/logo/mc-logo-stacked.png",
    stackedReversed: "/assets/logo/mc-logo-stacked-reversed.png",
    symbol: "/assets/logo/mc-symbol.png",
    symbolReversed: "/assets/logo/mc-symbol-reversed.png",
  },
  ogImage: "/assets/logo/mc-logo-horizontal.png",
};

/** Formats a phone number for a `tel:` href. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Homepage section ids. Shared by the nav, the in-page anchors and the
 * campaign template so the two never drift apart.
 */
export const SECTION_IDS = {
  process: "how-it-works",
  services: "services",
  whyUs: "why-us",
  industries: "industries",
  about: "about",
  faq: "faq",
  contact: "contact",
} as const;
