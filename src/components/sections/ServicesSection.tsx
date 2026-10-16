import { Leaf, LineChart, Users } from "lucide-react";
import { ContentCard, IconChip, Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS } from "@/content/site";
import { useT } from "@/i18n/LanguageProvider";

const ICONS = [LineChart, Users, Leaf] as const;

interface ServicesSectionProps {
  items?: ReadonlyArray<{ title: string; body: string }>;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  id?: string;
}

const ServicesSection = ({
  items,
  eyebrow,
  heading,
  intro,
  id = SECTION_IDS.services,
}: ServicesSectionProps) => {
  const t = useT();
  const headingId = `${id}-heading`;
  const resolved = items ?? t.services.items;

  return (
    <Section id={id} tone="surface" labelledBy={headingId}>
      <SectionHeading
        eyebrow={eyebrow ?? t.services.eyebrow}
        heading={heading ?? t.services.heading}
        intro={intro ?? t.services.intro}
        headingId={headingId}
      />

      <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
        {resolved.map((service, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <li key={service.title} className="flex">
              <ContentCard className="flex w-full flex-col transition-shadow hover:shadow-card-hover">
                <IconChip color="green" size="lg">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </IconChip>
                <h3 className="mt-5 font-display text-lg font-bold text-primary md:text-xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {service.body}
                </p>
              </ContentCard>
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

export default ServicesSection;
