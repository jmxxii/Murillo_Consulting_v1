import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { SECTION_IDS, siteConfig, telHref } from "@/content/site";
import { useLanguage } from "@/i18n/LanguageProvider";
import { track } from "@/lib/analytics";

const Footer = () => {
  const { t, path } = useLanguage();
  const base = path("/");
  const anchor = (id: string) => `${base === "/" ? "" : base}#${id}`;

  const navItems = [
    { label: t.nav.howItWorks, href: anchor(SECTION_IDS.process) },
    { label: t.nav.services, href: anchor(SECTION_IDS.services) },
    { label: t.nav.about, href: anchor(SECTION_IDS.about) },
    { label: t.nav.faq, href: anchor(SECTION_IDS.faq) },
    { label: t.nav.contact, href: anchor(SECTION_IDS.contact) },
  ];

  return (
    <footer className="on-dark bg-nav">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo variant="reversed" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-nav-muted-foreground">
              {t.footer.tagline}
            </p>
          </div>

          <nav aria-label={t.footer.navHeading} className="md:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-nav-foreground">
              {t.footer.navHeading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-sm text-sm text-nav-muted-foreground transition-colors hover:text-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-nav-foreground">
              {t.footer.contactHeading}
            </h2>
            <ul className="mt-4 space-y-3">
              {siteConfig.email && (
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    onClick={() => track({ name: "email_click", placement: "footer" })}
                    className="inline-flex items-center gap-2.5 rounded-sm text-sm text-nav-muted-foreground transition-colors hover:text-accent"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="break-all">{siteConfig.email}</span>
                  </a>
                </li>
              )}
              {siteConfig.phone && (
                <li>
                  <a
                    href={telHref(siteConfig.phone)}
                    onClick={() => track({ name: "phone_click", placement: "footer" })}
                    className="inline-flex items-center gap-2.5 rounded-sm text-sm text-nav-muted-foreground transition-colors hover:text-accent"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{siteConfig.phone}</span>
                  </a>
                </li>
              )}
            </ul>

            <h2 className="mt-7 text-xs font-semibold uppercase tracking-widest text-nav-foreground">
              {t.footer.languageHeading}
            </h2>
            <LanguageSwitcher className="mt-3 w-fit" />
          </div>
        </div>

        <div className="mt-12 border-t border-nav-border pt-6">
          <h2 className="sr-only">{t.footer.legalHeading}</h2>
          <p className="max-w-3xl text-xs leading-relaxed text-nav-muted-foreground/80">
            {t.footer.disclaimer}
          </p>
          <p className="mt-4 text-xs text-nav-muted-foreground/80">
            &copy; {new Date().getFullYear()} {t.common.companyName}. {t.footer.rights}{" "}
            <Link to={path("/privacy")} className="rounded-sm underline underline-offset-2 hover:text-nav-foreground">
              {t.footer.privacyLink}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
