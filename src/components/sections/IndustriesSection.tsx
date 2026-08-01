import {
  Briefcase,
  Building,
  Building2,
  KeyRound,
  Store,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";
import { IconChip, Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS } from "@/content/site";
import { useT } from "@/i18n/LanguageProvider";

/**
 * Businesses served.
 *
 * Deliberately general — the main site must not read as restaurant-specific.
 * Industry-targeted messaging belongs on campaign pages instead.
 */
const ICONS = [
  UtensilsCrossed,
  Store,
  Building2,
  Warehouse,
  Briefcase,
  KeyRound,
  Building,
] as const;

interface IndustriesSectionProps {
  items?: readonly string[];
  eyebrow?: string;
  heading?: string;
  intro?: string;
  note?: string;
  id?: string;
}

const IndustriesSection = ({
  items,
  eyebrow,
  heading,
  intro,
  note,
  id = SECTION_IDS.industries,
}: IndustriesSectionProps) => {
  const t = useT();
  const headingId = `${id}-heading`;
  const resolved = items ?? t.industries.items;

  return (
    <Section id={id} tone="surface" labelledBy={headingId}>
      <SectionHeading
        eyebrow={eyebrow ?? t.industries.eyebrow}
        heading={heading ?? t.industries.heading}
        intro={intro ?? t.industries.intro}
        headingId={headingId}
      />

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resolved.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <li
              key={item}
              className="flex items-center gap-3.5 rounded-lg border border-border bg-card p-4"
            >
              <IconChip color="navy">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </IconChip>
              <span className="text-sm font-medium leading-snug text-foreground">
                {item}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {note ?? t.industries.note}
      </p>
    </Section>
  );
};

export default IndustriesSection;
