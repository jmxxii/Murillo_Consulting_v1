import { useEffect } from "react";
import { siteConfig } from "@/content/site";
import { dictionaries, localePath, LOCALES, type Locale } from "@/i18n";

export interface DocumentMeta {
  title: string;
  description: string;
  /** Locale-independent path, e.g. "/" or "/campaigns/restaurants". */
  path: string;
  locale: Locale;
  /** Absolute or root-relative image path. Defaults to the site OG image. */
  image?: string;
  /** Set on campaign pages that should not be indexed (draft/expired). */
  noindex?: boolean;
  /** Optional JSON-LD graph appended as a single script tag. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const MANAGED_ATTR = "data-managed-meta";

function absolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(MANAGED_ATTR, "");
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

function upsertLink(rel: string, href: string, extra: Record<string, string> = {}): void {
  const selectorParts = [`link[rel="${rel}"]`];
  if (extra.hreflang) selectorParts.push(`[hreflang="${extra.hreflang}"]`);
  let el = document.head.querySelector<HTMLLinkElement>(selectorParts.join(""));
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.setAttribute(MANAGED_ATTR, "");
    document.head.appendChild(el);
  }
  el.href = href;
  for (const [key, value] of Object.entries(extra)) el.setAttribute(key, value);
}

/**
 * Applies per-route document metadata.
 *
 * This is a client-side SPA, so these tags are written after hydration.
 * Google renders JavaScript and will pick them up; crawlers that do not
 * (some social scrapers) fall back to the static tags in index.html.
 * Prerendering is the recommended follow-up — see docs/seo-notes.md.
 */
export function useDocumentMeta(meta: DocumentMeta): void {
  const { title, description, path, locale, image, noindex, structuredData } = meta;

  useEffect(() => {
    document.title = title;

    const canonical = absolute(localePath(locale, path));
    const ogImage = absolute(image ?? siteConfig.ogImage);

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    });

    upsertLink("canonical", canonical);

    // hreflang for every locale plus x-default pointing at English.
    for (const code of LOCALES) {
      upsertLink("alternate", absolute(localePath(code, path)), {
        hreflang: dictionaries[code].meta.htmlLang,
      });
    }
    upsertLink("alternate", absolute(localePath("en", path)), { hreflang: "x-default" });

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: siteConfig.legalName,
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: dictionaries[locale].meta.ogLocale,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: ogImage });
  }, [title, description, path, locale, image, noindex]);

  useEffect(() => {
    const id = "structured-data";
    document.getElementById(id)?.remove();
    if (!structuredData) return;

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => script.remove();
  }, [structuredData]);
}
