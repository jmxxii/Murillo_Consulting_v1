import { ArrowRight, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS, siteConfig } from "@/content/site";
import { useLanguage } from "@/i18n/LanguageProvider";
import { track, trackCtaClick } from "@/lib/analytics";

interface BillCtaSectionProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  primaryCta?: string;
  ctaHref?: string;
}

/** Mid-page conversion band. Navy so it reads as a deliberate break. */
const BillCtaSection = ({
  eyebrow,
  heading,
  body,
  primaryCta,
  ctaHref,
}: BillCtaSectionProps) => {
  const { t, path } = useLanguage();
  const base = path("/");
  const resolvedHref =
    ctaHref ?? `${base === "/" ? "" : base}#${SECTION_IDS.contact}`;

  return (
    <section className="on-dark bg-nav py-16 md:py-20">
      <div className="container">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <span
            aria-hidden="true"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent"
          >
            <FileUp className="h-7 w-7" />
          </span>

          <div>
            <p className="eyebrow-on-dark">{eyebrow ?? t.billCta.eyebrow}</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-nav-foreground sm:text-3xl md:text-4xl">
              {heading ?? t.billCta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-nav-muted-foreground md:text-lg">
              {body ?? t.billCta.body}
            </p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Button variant="cta" size="xl" className="w-full sm:w-auto" asChild>
              <a
                href={resolvedHref}
                onClick={() => trackCtaClick("bill_cta", "primary")}
              >
                {primaryCta ?? t.billCta.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>

            {siteConfig.email && (
              <Button variant="onDarkOutline" size="xl" className="w-full sm:w-auto" asChild>
                <a
                  href={`mailto:${siteConfig.email}`}
                  onClick={() => track({ name: "email_click", placement: "bill_cta" })}
                >
                  {t.billCta.secondaryCta}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BillCtaSection;
