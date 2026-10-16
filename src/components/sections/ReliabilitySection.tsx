import { PlugZap, ShieldCheck, UserCheck } from "lucide-react";
import { ContentCard, IconChip, Section, SectionHeading } from "@/components/common/Section";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Service-reliability reassurance.
 *
 * The copy deliberately separates the *utility* (delivery, infrastructure,
 * outages) from the *supplier / rate option* being evaluated. Do not collapse
 * these into "your provider stays the same" — that word is ambiguous and the
 * distinction is the whole point of this section.
 */

const ICONS = [ShieldCheck, PlugZap, UserCheck] as const;

const ReliabilitySection = () => {
  const t = useT();
  const headingId = "reliability-heading";

  return (
    <Section tone="surface" labelledBy={headingId}>
      <SectionHeading
        eyebrow={t.reliability.eyebrow}
        heading={t.reliability.heading}
        headingId={headingId}
      />

      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border-l-4 border-secondary bg-secondary-subtle p-6 md:p-8">
          <p className="text-base leading-relaxed text-secondary-subtle-foreground md:text-lg">
            {t.reliability.body}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-3 md:gap-6">
        {t.reliability.points.map((point, index) => {
          const Icon = ICONS[index] ?? ShieldCheck;
          return (
            <ContentCard key={point.title}>
              <IconChip color="navy">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </IconChip>
              <h3 className="mt-4 font-display text-base font-semibold text-primary md:text-lg">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </ContentCard>
          );
        })}
      </div>
    </Section>
  );
};

export default ReliabilitySection;
