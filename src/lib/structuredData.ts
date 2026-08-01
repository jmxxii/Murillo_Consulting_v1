import { siteConfig } from "@/content/site";
import { localePath, type Dictionary, type Locale } from "@/i18n";

/**
 * JSON-LD builders.
 *
 * Every field is sourced from `siteConfig` or the translation dictionaries.
 * Unconfirmed values (phone, service area, address) are omitted entirely —
 * publishing a guess in structured data is worse than publishing nothing,
 * because search engines surface it as fact.
 */

function absolute(path: string): string {
  return `${siteConfig.siteUrl.replace(/\/$/, "")}${path}`;
}

export function organizationSchema(locale: Locale, t: Dictionary): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@type": "Organization",
    "@id": `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.shortName,
    url: absolute(localePath(locale, "/")),
    logo: absolute(siteConfig.logo.color),
    description: t.seo.homeDescription,
    employee: {
      "@type": "Person",
      name: siteConfig.contactPerson.name,
    },
  };

  if (siteConfig.email || siteConfig.phone) {
    const contactPoint: Record<string, unknown> = {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["en", "es"],
    };
    if (siteConfig.email) contactPoint.email = siteConfig.email;
    if (siteConfig.phone) contactPoint.telephone = siteConfig.phone;
    schema.contactPoint = contactPoint;
  }

  if (siteConfig.areaServed.length > 0) {
    schema.areaServed = siteConfig.areaServed;
  }

  return schema;
}

export function websiteSchema(locale: Locale, t: Dictionary): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.siteUrl}/#website`,
    url: absolute(localePath(locale, "/")),
    name: siteConfig.legalName,
    description: t.seo.homeDescription,
    inLanguage: t.meta.htmlLang,
    publisher: { "@id": `${siteConfig.siteUrl}/#organization` },
  };
}

export function faqSchema(t: Dictionary): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: t.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function servicesSchema(t: Dictionary): Record<string, unknown> {
  return {
    "@type": "Service",
    serviceType: t.services.heading,
    provider: { "@id": `${siteConfig.siteUrl}/#organization` },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t.services.heading,
      itemListElement: t.services.items.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.title,
          description: item.body,
        },
      })),
    },
  };
}

/** Assembles the homepage graph. */
export function homeGraph(locale: Locale, t: Dictionary): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(locale, t),
      websiteSchema(locale, t),
      servicesSchema(t),
      faqSchema(t),
    ],
  };
}
