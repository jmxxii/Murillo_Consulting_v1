import { ArrowRight, ClipboardList, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconChip, Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS } from "@/content/site";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trackCtaClick } from "@/lib/analytics";

const ICONS = [FileText, ClipboardList, Lightbulb] as const;

/**
 * Three-step process.
 *
 * Step order is conveyed by an ordered list and a numbered badge, not by the
 * connector line — the line is decorative and hidden from assistive tech.
 */
interface ProcessSectionProps {
  /** Campaign pages pass their own steps; the homepage uses the dictionary. */
  steps?: ReadonlyArray<{ title: string; body: string }>;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  ctaLabel?: string;
  ctaHref?: string;
  id?: string;
}

const ProcessSection = ({
  steps,
  eyebrow,
  heading,
  intro,
  ctaLabel,
  ctaHref,
  id = SECTION_IDS.process,
}: ProcessSectionProps) => {
  const { t, path } = useLanguage();
  const base = path("/");
  const headingId = `${id}-heading`;

  const resolvedSteps = steps ?? t.process.steps;
  const resolvedCtaHref =
    ctaHref ?? `${base === "/" ? "" : base}#${SECTION_IDS.contact}`;

  return (
    <Section id={id} labelledBy={headingId}>
      <SectionHeading
        eyebrow={eyebrow ?? t.process.eyebrow}
        heading={heading ?? t.process.heading}
        intro={intro ?? t.process.intro}
        headingId={headingId}
      />

      <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
        {/* Decorative connector between the three step markers. */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />

        {resolvedSteps.map((step, index) => {
          const Icon = ICONS[index] ?? FileText;
          return (
            <li key={step.title} className="relative flex flex-col">
              <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-0">
                <IconChip color="green" size="lg" className="relative bg-secondary text-secondary-foreground ring-8 ring-background">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </IconChip>
                <p className="text-sm font-semibold uppercase tracking-widest text-accent-subtle-foreground md:mt-5">
                  {t.process.stepLabel} {index + 1}
                </p>
              </div>

              <h3 className="mt-3 font-display text-lg font-bold text-primary md:text-xl">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground md:text-base">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 flex justify-center">
        <Button variant="cta" size="xl" asChild>
          <a
            href={resolvedCtaHref}
            onClick={() => trackCtaClick("process", "primary")}
          >
            {ctaLabel ?? t.process.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </Section>
  );
};

export default ProcessSection;
