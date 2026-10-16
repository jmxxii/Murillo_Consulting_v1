import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS } from "@/content/site";
import { useT } from "@/i18n/LanguageProvider";

interface FaqSectionProps {
  items?: ReadonlyArray<{ question: string; answer: string }>;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  id?: string;
}

const FaqSection = ({
  items,
  eyebrow,
  heading,
  intro,
  id = SECTION_IDS.faq,
}: FaqSectionProps) => {
  const t = useT();
  const headingId = `${id}-heading`;
  const resolved = items ?? t.faq.items;

  return (
    <Section id={id} labelledBy={headingId}>
      <SectionHeading
        eyebrow={eyebrow ?? t.faq.eyebrow}
        heading={heading ?? t.faq.heading}
        intro={intro ?? t.faq.intro}
        headingId={headingId}
      />

      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {resolved.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index}`}
              className="border-border"
            >
              <AccordionTrigger className="py-5 text-left font-display text-base font-semibold text-primary hover:text-accent-strong hover:no-underline md:text-lg [&[data-state=open]>svg]:text-accent-strong">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};

export default FaqSection;
