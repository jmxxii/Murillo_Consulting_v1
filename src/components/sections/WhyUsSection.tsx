import { Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS } from "@/content/site";
import { useT } from "@/i18n/LanguageProvider";

interface WhyUsSectionProps {
  benefits?: ReadonlyArray<{ title: string; body: string }>;
  eyebrow?: string;
  heading?: string;
  body?: string;
  id?: string;
}

const WhyUsSection = ({
  benefits,
  eyebrow,
  heading,
  body,
  id = SECTION_IDS.whyUs,
}: WhyUsSectionProps) => {
  const t = useT();
  const headingId = `${id}-heading`;
  const resolved = benefits ?? t.whyUs.benefits;

  return (
    <Section id={id} labelledBy={headingId}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow={eyebrow ?? t.whyUs.eyebrow}
            heading={heading ?? t.whyUs.heading}
            intro={body ?? t.whyUs.body}
            headingId={headingId}
            align="left"
            className="mb-0"
          />
        </div>

        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-7">
          {resolved.map((benefit) => (
            <li key={benefit.title} className="flex gap-3.5">
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-primary">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {benefit.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
};

export default WhyUsSection;
