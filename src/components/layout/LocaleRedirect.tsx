import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { DEFAULT_LOCALE, localePath, readStoredLocale } from "@/i18n";

interface LocaleRedirectProps {
  children: ReactNode;
}

/**
 * Honours a remembered language preference — but only on the bare root.
 *
 * English is the default: a first-time visitor at `/` always gets English.
 * Once someone has *actively* switched to Spanish (which is the only thing
 * that writes the stored preference), returning to `/` sends them to `/es`.
 *
 * Scoped to `/` on purpose. Any deeper URL is treated as an explicit request
 * for that language, so a link someone shares always opens in the language
 * it points at.
 */
const LocaleRedirect = ({ children }: LocaleRedirectProps) => {
  const stored = readStoredLocale();

  if (stored && stored !== DEFAULT_LOCALE) {
    return <Navigate to={localePath(stored, "/")} replace />;
  }

  return <>{children}</>;
};

export default LocaleRedirect;
