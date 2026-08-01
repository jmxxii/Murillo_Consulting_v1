import { CalendarDays, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS, siteConfig, telHref } from "@/content/site";
import { useT } from "@/i18n/LanguageProvider";
import { track } from "@/lib/analytics";

/**
 * About Larry Murillo.
 *
 * Contact rows render only for values confirmed in `siteConfig` — a missing
 * phone number shows nothing rather than a fake placeholder. If no portrait
 * has been supplied we fall back to the brand symbol rather than a stock
 * photo of someone who is not Larry.
 */
const AboutSection = () => {
  const t = useT();
  const headingId = "about-heading";
  const { photo, name } = siteConfig.contactPerson;

  return (
    <Section id={SECTION_IDS.about} labelledBy={headingId}>
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-4">
          <div className="mx-auto aspect-square w-48 overflow-hidden rounded-2xl border border-border bg-surface md:w-full">
            {photo ? (
              <img
                src={photo}
                alt={t.about.portraitAlt}
                width={512}
                height={512}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-8">
                <img
                  src={siteConfig.logo.symbol}
                  alt=""
                  aria-hidden="true"
                  width={512}
                  height={512}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-8">
          <SectionHeading
            eyebrow={t.about.eyebrow}
            heading={t.about.heading}
            intro={t.about.body}
            headingId={headingId}
            align="left"
            className="mb-6"
          />

          <p className="font-display text-base font-semibold text-primary">{name}</p>
          <p className="text-sm text-muted-foreground">{t.about.contactRole}</p>

          <ul className="mt-5 flex flex-col gap-2.5">
            {siteConfig.email && (
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  onClick={() => track({ name: "email_click", placement: "about" })}
                  className="inline-flex items-center gap-2.5 rounded-sm text-sm font-medium text-accent-strong transition-colors hover:text-accent-strong-hover hover:underline"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{t.about.emailLabel}: </span>
                  <span className="break-all">{siteConfig.email}</span>
                </a>
              </li>
            )}
            {siteConfig.phone && (
              <li>
                <a
                  href={telHref(siteConfig.phone)}
                  onClick={() => track({ name: "phone_click", placement: "about" })}
                  className="inline-flex items-center gap-2.5 rounded-sm text-sm font-medium text-accent-strong transition-colors hover:text-accent-strong-hover hover:underline"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{t.about.phoneLabel}: </span>
                  <span>{siteConfig.phone}</span>
                </a>
              </li>
            )}
          </ul>

          {siteConfig.schedulingUrl && (
            <Button variant="outline" size="default" className="mt-6" asChild>
              <a
                href={siteConfig.schedulingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track({ name: "schedule_click", placement: "about" })}
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {t.about.scheduleCta}
              </a>
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
};

export default AboutSection;
