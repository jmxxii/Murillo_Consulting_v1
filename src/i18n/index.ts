import en from "./en";
import es from "./es";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Dictionary, type Locale } from "./types";

export { DEFAULT_LOCALE, isLocale, LOCALES };
export type { Dictionary, Locale };

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export const STORAGE_KEY = "mc.locale";

/**
 * URL shape: English lives at the root, Spanish under `/es`.
 *
 *   /                      -> en home
 *   /es                    -> es home
 *   /campaigns/:slug       -> en campaign
 *   /es/campaigns/:slug    -> es campaign
 */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** Builds an absolute in-app path for a locale. `path` is locale-independent. */
export function localePath(locale: Locale, path = "/"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${localePrefix(locale)}${normalized}` || "/";
}

/** Reads the locale out of a pathname. Unknown prefixes fall back to English. */
export function localeFromPathname(pathname: string): Locale {
  const [, first] = pathname.split("/");
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/** Strips the locale prefix, returning the locale-independent path. */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    return `/${rest.join("/")}`.replace(/\/$/, "") || "/";
  }
  return pathname.replace(/\/$/, "") || "/";
}

/** Swaps the locale on the current path, preserving the rest of the route. */
export function switchLocalePath(pathname: string, next: Locale): string {
  return localePath(next, stripLocale(pathname));
}

export function readStoredLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    // Private browsing or blocked storage — fall back to the URL.
    return null;
  }
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Persisting a preference is a nicety, never a hard requirement.
  }
}

/**
 * Replaces `{name}` placeholders in a translated string.
 *
 *   interpolate("up to {maxSize}", { maxSize: "10 MB" }) -> "up to 10 MB"
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
