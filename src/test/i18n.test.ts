import { describe, expect, it } from "vitest";
import en from "@/i18n/en";
import es from "@/i18n/es";
import {
  DEFAULT_LOCALE,
  interpolate,
  localeFromPathname,
  localePath,
  LOCALES,
  stripLocale,
  switchLocalePath,
} from "@/i18n";

/**
 * Walks two dictionaries in parallel and reports every leaf where the
 * structure differs or a string is missing/blank.
 *
 * TypeScript already guarantees key and tuple-length parity (es.ts is typed
 * as `Dictionary`), so this catches the thing types cannot: an empty string,
 * a copy-pasted untranslated value, or a placeholder that was dropped.
 */
function compare(
  a: unknown,
  b: unknown,
  path: string,
  problems: string[],
  identical: string[],
): void {
  if (typeof a === "string") {
    if (typeof b !== "string") {
      problems.push(`${path}: type mismatch`);
      return;
    }
    if (a.trim() === "") problems.push(`${path}: English is empty`);
    if (b.trim() === "") problems.push(`${path}: Spanish is empty`);

    // Placeholders must survive translation or interpolation silently breaks.
    const tokens = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort().join(",");
    if (tokens(a) !== tokens(b)) {
      problems.push(`${path}: placeholder mismatch ("${tokens(a)}" vs "${tokens(b)}")`);
    }
    if (a === b) identical.push(path);
    return;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      problems.push(`${path}: array length mismatch`);
      return;
    }
    a.forEach((item, i) => compare(item, b[i], `${path}[${i}]`, problems, identical));
    return;
  }

  if (a && typeof a === "object") {
    const aKeys = Object.keys(a as object).sort();
    const bKeys = Object.keys((b ?? {}) as object).sort();
    expect(bKeys, `${path}: key sets differ`).toEqual(aKeys);
    for (const key of aKeys) {
      compare(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        path ? `${path}.${key}` : key,
        problems,
        identical,
      );
    }
  }
}

describe("translation dictionaries", () => {
  it("has English as the default locale", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(LOCALES[0]).toBe("en");
  });

  it("keeps English and Spanish structurally identical with no blank strings", () => {
    const problems: string[] = [];
    const identical: string[] = [];
    compare(en, es, "", problems, identical);
    expect(problems).toEqual([]);
  });

  it("actually translates the customer-facing copy", () => {
    const problems: string[] = [];
    const identical: string[] = [];
    compare(en, es, "", problems, identical);

    // A handful of strings are legitimately identical across languages —
    // proper nouns and locale metadata. Everything else must differ.
    const allowedIdentical = [
      "meta.localeName",
      "meta.htmlLang",
      "meta.ogLocale",
      "common.companyName",
      "common.companyShortName",
      "about.contactName",
      "about.contactRole",
      "nav.services", // "Services" / "Servicios" differ; guard stays for safety
    ];

    const unexpected = identical.filter((path) => !allowedIdentical.includes(path));
    expect(unexpected, "untranslated strings").toEqual([]);
  });

  it("declares the correct html lang per locale", () => {
    expect(en.meta.htmlLang).toBe("en");
    expect(es.meta.htmlLang).toBe("es");
  });

  it("never promises guaranteed savings", () => {
    const forbidden = /\b(guaranteed savings|we guarantee|garantizamos ahorros|ahorros garantizados)\b/i;
    const walk = (value: unknown, path: string): string[] => {
      if (typeof value === "string") {
        // "No. We do not guarantee savings." is an allowed negation.
        const negated = /\b(do not guarantee|not guaranteed|no garantizamos|no están garantizados)\b/i;
        return forbidden.test(value) && !negated.test(value) ? [path] : [];
      }
      if (Array.isArray(value)) return value.flatMap((v, i) => walk(v, `${path}[${i}]`));
      if (value && typeof value === "object") {
        return Object.entries(value).flatMap(([k, v]) => walk(v, `${path}.${k}`));
      }
      return [];
    };
    expect(walk(en, "en").concat(walk(es, "es"))).toEqual([]);
  });
});

describe("locale routing helpers", () => {
  it("puts English at the root and Spanish under /es", () => {
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("es", "/")).toBe("/es");
    expect(localePath("en", "/campaigns/x")).toBe("/campaigns/x");
    expect(localePath("es", "/campaigns/x")).toBe("/es/campaigns/x");
  });

  it("reads the locale back out of a pathname", () => {
    expect(localeFromPathname("/")).toBe("en");
    expect(localeFromPathname("/campaigns/x")).toBe("en");
    expect(localeFromPathname("/es")).toBe("es");
    expect(localeFromPathname("/es/campaigns/x")).toBe("es");
    expect(localeFromPathname("/de")).toBe("en");
  });

  it("strips the locale prefix", () => {
    expect(stripLocale("/es/campaigns/x")).toBe("/campaigns/x");
    expect(stripLocale("/campaigns/x")).toBe("/campaigns/x");
    expect(stripLocale("/es")).toBe("/");
    expect(stripLocale("/")).toBe("/");
  });

  it("switches locale while preserving the route", () => {
    expect(switchLocalePath("/campaigns/x", "es")).toBe("/es/campaigns/x");
    expect(switchLocalePath("/es/campaigns/x", "en")).toBe("/campaigns/x");
    expect(switchLocalePath("/", "es")).toBe("/es");
    expect(switchLocalePath("/es", "en")).toBe("/");
  });
});

describe("interpolate", () => {
  it("replaces placeholders", () => {
    expect(interpolate("up to {maxSize} per file", { maxSize: "10 MB" })).toBe(
      "up to 10 MB per file",
    );
  });

  it("leaves unknown placeholders untouched", () => {
    expect(interpolate("{a} and {b}", { a: "1" })).toBe("1 and {b}");
  });
});
