import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import type { Locale } from "@/i18n";

/**
 * Scrolls to the top on route change, but leaves hash navigation alone so
 * in-page anchors keep working.
 */
function useScrollRestoration() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);
}

interface SiteLayoutProps {
  locale: Locale;
}

/**
 * Shared chrome for every public page. One layout per locale route branch,
 * which is what gives the whole subtree its language.
 */
const SiteLayout = ({ locale }: SiteLayoutProps) => {
  useScrollRestoration();

  return (
    <LanguageProvider locale={locale}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default SiteLayout;
