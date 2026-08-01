import type en from "./en";

/**
 * Widens the literal types produced by `as const` back to `string`/`number`,
 * while preserving object keys AND tuple lengths.
 *
 * The payoff: `const es: Dictionary = { … }` fails to compile if a key is
 * missing, misspelled, extra, or if a translated array has a different number
 * of entries than the English one. Translation parity is a build-time
 * guarantee rather than something a reviewer has to eyeball.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly unknown[]
        ? { readonly [K in keyof T]: Widen<T[K]> }
        : T extends object
          ? { -readonly [K in keyof T]: Widen<T[K]> }
          : T;

/** The shape every locale file must satisfy. Derived from the English copy. */
export type Dictionary = Widen<typeof en>;

/** Supported locales. Add a code here and a matching dictionary to extend. */
export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** English is the default and primary language of the site. */
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
