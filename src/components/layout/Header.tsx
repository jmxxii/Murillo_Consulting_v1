import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { SECTION_IDS } from "@/content/site";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trackCtaClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Site header.
 *
 * The bar is white so the full-colour logo can be used as supplied — the
 * brand wordmark is navy (#143A6A) and would sit at 1.45:1 on a navy bar,
 * i.e. invisible. Everything else in the header therefore reads as navy on
 * white, and the navy hero starts immediately beneath it.
 *
 * Nav targets are in-page anchors, so the links are plain `<a href="#…">`.
 * The `href` is prefixed with the localized home path so the anchors still
 * resolve when the visitor is on a campaign route.
 */

interface HeaderProps {
  /**
   * Campaign pages have their own section set; passing `homeHref` keeps the
   * header pointing back at the homepage anchors from anywhere.
   */
  homeHref?: string;
}

const Header = ({ homeHref }: HeaderProps) => {
  const { t, path } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const base = homeHref ?? path("/");
  const anchor = (id: string) => `${base === "/" ? "" : base}#${id}`;

  const navItems = [
    { label: t.nav.howItWorks, href: anchor(SECTION_IDS.process) },
    { label: t.nav.services, href: anchor(SECTION_IDS.services) },
    { label: t.nav.about, href: anchor(SECTION_IDS.about) },
    { label: t.nav.faq, href: anchor(SECTION_IDS.faq) },
    { label: t.nav.contact, href: anchor(SECTION_IDS.contact) },
  ];

  const ctaHref = anchor(SECTION_IDS.contact);

  // Deepen the shadow once the page scrolls so the white bar separates from
  // the content passing under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-background transition-shadow",
        scrolled && "shadow-header",
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
      >
        {t.common.skipToContent}
      </a>

      <div className="container flex items-center justify-between gap-4 py-3">
        <Logo variant="color" loading="eager" />

        <nav aria-label={t.nav.ariaLabel} className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm text-sm font-medium text-foreground transition-colors hover:text-accent-strong"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher tone="light" />
          <Button variant="cta" size="sm" asChild>
            <a href={ctaHref} onClick={() => trackCtaClick("header", "primary")}>
              {t.nav.primaryCta}
            </a>
          </Button>
        </div>

        {/* Mobile / tablet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="-mr-1 flex h-11 w-11 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface lg:hidden"
              aria-label={t.nav.mobileMenuLabel}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            hideDefaultClose
            // The title alone describes this panel; Radix warns unless the
            // absence of a description is declared explicitly.
            aria-describedby={undefined}
            className="flex w-[300px] flex-col border-border bg-background p-0 sm:w-[340px]"
          >
            <SheetTitle className="sr-only">{t.nav.mobileMenuTitle}</SheetTitle>

            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <Logo variant="color" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.closeMenu}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label={t.nav.ariaLabel}
              className="flex flex-1 flex-col overflow-y-auto px-3 py-3"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-md px-4 py-3 text-[15px] font-medium text-foreground transition-colors hover:bg-surface hover:text-accent-strong"
                >
                  {item.label}
                </a>
              ))}

              <div className="mt-4 border-t border-border pt-4">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t.nav.languageLabel}
                </p>
                <LanguageSwitcher
                  variant="list"
                  tone="light"
                  onSwitch={() => setOpen(false)}
                />
              </div>
            </nav>

            <div className="border-t border-border px-5 pb-8 pt-4">
              <Button variant="cta" size="lg" className="w-full" asChild>
                <a
                  href={ctaHref}
                  onClick={() => {
                    trackCtaClick("mobile_menu", "primary");
                    setOpen(false);
                  }}
                >
                  {t.nav.primaryCta}
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
