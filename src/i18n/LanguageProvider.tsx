import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackLanguageChange } from "@/lib/analytics";
import {
  DEFAULT_LOCALE,
  dictionaries,
  interpolate,
  localePath,
  storeLocale,
  switchLocalePath,
  type Dictionary,
  type Locale,
} from "./index";

interface LanguageContextValue {
  locale: Locale;
  /** The active dictionary. Access copy as `t.hero.headline` — fully typed. */
  t: Dictionary;
  /** Navigates to the same route in another language. */
  setLocale: (next: Locale) => void;
  /** Builds a path in the current language, e.g. `path("/campaigns/x")`. */
  path: (to?: string) => string;
  /** Fills `{placeholders}` in a translated string. */
  format: (template: string, values: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  locale: Locale;
  children: ReactNode;
}

/**
 * Owns the active language for a route subtree.
 *
 * The URL is the single source of truth: `/` is English, `/es` is Spanish.
 * The stored preference is only written when the visitor actively switches,
 * so a shared link always renders in the language it points at.
 */
export function LanguageProvider({ locale, children }: LanguageProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the document language in sync for screen readers and search engines.
  useEffect(() => {
    document.documentElement.lang = dictionaries[locale].meta.htmlLang;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      storeLocale(next);
      trackLanguageChange(locale, next);
      navigate(switchLocalePath(location.pathname, next) + location.hash, {
        replace: false,
      });
    },
    [locale, location.hash, location.pathname, navigate],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      path: (to = "/") => localePath(locale, to),
      format: interpolate,
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside a <LanguageProvider>.");
  }
  return context;
}

/** Convenience hook when a component only needs the copy. */
export function useT(): Dictionary {
  return useLanguage().t;
}

export { DEFAULT_LOCALE };
