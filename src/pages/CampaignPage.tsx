import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard, IconChip, Section, SectionHeading } from "@/components/common/Section";
import ProcessSection from "@/components/sections/ProcessSection";
import ServicesSection from "@/components/sections/ServicesSection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import NotFound from "@/pages/NotFound";
import { getCampaign, isCampaignVisible, pick } from "@/content/campaigns";
import { SECTION_IDS } from "@/content/site";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLanguage } from "@/i18n/LanguageProvider";
import { track, trackCtaClick } from "@/lib/analytics";
import { organizationSchema } from "@/lib/structuredData";

/**
 * Reusable campaign template.
 *
 * Renders any object satisfying `Campaign`. Sections are conditional, so a
 * campaign that omits `benefits` or `faq` simply skips them — there is no
 * per-campaign component to write or maintain.
 */
const CampaignPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale, path } = useLanguage();
  const campaign = getCampaign(slug);

  const visible =
    campaign !== undefined &&
    isCampaignVisible(campaign, { isDev: import.meta.env.DEV });

  const attribution = campaign?.attribution ?? campaign?.slug;

  useEffect(() => {
    if (visible && attribution) {
      track({ name: "campaign_view", campaign: attribution });
    }
  }, [visible, attribution]);

  useDocumentMeta({
    title: visible && campaign ? pick(campaign.seo.title, locale) : t.seo.notFoundTitle,
    description:
      visible && campaign
        ? pick(campaign.seo.description, locale)
        : t.seo.notFoundDescription,
    path: campaign ? `/campaigns/${campaign.slug}` : "/",
    locale,
    image: campaign?.seo.ogImage,
    // Draft previews must never be indexed, even though they render in dev.
    noindex: !visible || campaign?.status === "draft",
    structuredData: visible ? organizationSchema(locale, t) : undefined,
  });

  if (!campaign || !visible) {
    return <NotFound />;
  }

  const base = path("/");
  const contactHref = `#${SECTION_IDS.contact}`;
  const processHref = `#${SECTION_IDS.process}`;

  return (
    <>
      {/* Hero */}
      <section className="on-dark relative isolate overflow-hidden bg-nav">
        {campaign.hero.image && (
          <div className="absolute inset-0 -z-10">
            <img
              src={campaign.hero.image}
              alt={
                campaign.hero.imageAlt ? pick(campaign.hero.imageAlt, locale) : ""
              }
              aria-hidden={campaign.hero.imageAlt ? undefined : true}
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-nav/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-nav via-nav/85 to-nav/60" />
          </div>
        )}

        <div className="container py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-accent/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              {pick(campaign.audience, locale)}
            </span>

            <p className="eyebrow-on-dark mt-5">{pick(campaign.hero.eyebrow, locale)}</p>

            <h1 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-tight text-nav-foreground sm:text-4xl md:text-5xl">
              {pick(campaign.hero.headline, locale)}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-nav-muted-foreground md:text-lg">
              {pick(campaign.hero.supporting, locale)}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button variant="cta" size="xl" className="w-full sm:w-auto" asChild>
                <a
                  href={contactHref}
                  onClick={() => trackCtaClick(`campaign:${campaign.slug}`, "primary")}
                >
                  {pick(campaign.hero.primaryCta, locale)}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              {campaign.hero.secondaryCta && (
                <Button
                  variant="onDarkOutline"
                  size="xl"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a
                    href={processHref}
                    onClick={() => trackCtaClick(`campaign:${campaign.slug}`, "secondary")}
                  >
                    {pick(campaign.hero.secondaryCta, locale)}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {import.meta.env.DEV && campaign.status === "draft" && (
        <div className="bg-warning-subtle py-2.5 text-center text-xs font-semibold text-warning">
          Draft campaign — visible in development only, and never indexed.
        </div>
      )}

      {campaign.benefits && (
        <Section tone="surface" labelledBy="campaign-benefits-heading">
          <SectionHeading
            heading={pick(campaign.benefits.heading, locale)}
            intro={
              campaign.benefits.body ? pick(campaign.benefits.body, locale) : undefined
            }
            headingId="campaign-benefits-heading"
          />
          <ul className="grid gap-5 sm:grid-cols-2 md:gap-6">
            {pick(campaign.benefits.items, locale).map((benefit) => (
              <li key={benefit.title} className="flex">
                <ContentCard className="flex w-full gap-4">
                  <IconChip color="green">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </IconChip>
                  <div>
                    <h3 className="font-display text-base font-semibold text-primary md:text-lg">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {benefit.body}
                    </p>
                  </div>
                </ContentCard>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {campaign.process && (
        <ProcessSection
          steps={pick(campaign.process.steps, locale)}
          heading={pick(campaign.process.heading, locale)}
          intro={
            campaign.process.intro ? pick(campaign.process.intro, locale) : undefined
          }
          ctaLabel={campaign.process.cta ? pick(campaign.process.cta, locale) : undefined}
          ctaHref={contactHref}
        />
      )}

      {campaign.services && (
        <ServicesSection
          items={pick(campaign.services.items, locale)}
          heading={pick(campaign.services.heading, locale)}
          intro={
            campaign.services.intro ? pick(campaign.services.intro, locale) : undefined
          }
        />
      )}

      {campaign.testimonials && (
        <Section labelledBy="campaign-testimonials-heading">
          <SectionHeading
            heading={pick(campaign.testimonials.heading, locale)}
            headingId="campaign-testimonials-heading"
          />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pick(campaign.testimonials.items, locale).map((item) => (
              <li key={item.attribution} className="flex">
                <ContentCard className="flex w-full flex-col">
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                    {item.quote}
                  </blockquote>
                  <footer className="mt-5 border-t border-border pt-4">
                    <p className="text-sm font-semibold text-primary">
                      {item.attribution}
                    </p>
                    {item.context && (
                      <p className="text-xs text-muted-foreground">{item.context}</p>
                    )}
                  </footer>
                </ContentCard>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {campaign.faq && (
        <FaqSection
          items={pick(campaign.faq.items, locale)}
          heading={pick(campaign.faq.heading, locale)}
          intro={campaign.faq.intro ? pick(campaign.faq.intro, locale) : undefined}
        />
      )}

      <ContactSection
        campaign={attribution}
        heading={campaign.form ? pick(campaign.form.heading, locale) : undefined}
        intro={
          campaign.form?.intro ? pick(campaign.form.intro, locale) : undefined
        }
        submitLabel={
          campaign.form?.submitLabel
            ? pick(campaign.form.submitLabel, locale)
            : undefined
        }
        successMessage={
          campaign.form?.thankYou ? pick(campaign.form.thankYou, locale) : undefined
        }
      />

      <div className="bg-surface pb-14 text-center">
        <a
          href={base}
          className="rounded-sm text-sm font-medium text-accent-strong hover:underline"
        >
          {t.common.backToHome}
        </a>
      </div>
    </>
  );
};

export default CampaignPage;
