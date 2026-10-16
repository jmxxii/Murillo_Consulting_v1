import { CalendarDays, Clock, Mail, Phone } from "lucide-react";
import LeadForm from "@/components/lead/LeadForm";
import { Section, SectionHeading } from "@/components/common/Section";
import { SECTION_IDS, siteConfig, telHref } from "@/content/site";
import { useT } from "@/i18n/LanguageProvider";
import { track } from "@/lib/analytics";

interface ContactSectionProps {
  /** Campaign slug, attached to the lead so submissions can be attributed. */
  campaign?: string;
  heading?: string;
  intro?: string;
  successMessage?: string;
  submitLabel?: string;
  id?: string;
}

const ContactSection = ({
  campaign,
  heading,
  intro,
  successMessage,
  submitLabel,
  id = SECTION_IDS.contact,
}: ContactSectionProps) => {
  const t = useT();
  const headingId = `${id}-heading`;

  return (
    <Section id={id} tone="surface" labelledBy={headingId}>
      <SectionHeading
        eyebrow={t.contact.eyebrow}
        heading={heading ?? t.contact.heading}
        intro={intro ?? t.contact.intro}
        headingId={headingId}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 xl:col-span-8">
          <LeadForm
            campaign={campaign}
            successMessage={successMessage}
            submitLabel={submitLabel}
          />
        </div>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="rounded-lg border border-border bg-card p-6 shadow-card md:p-7">
            <h3 className="font-display text-lg font-bold text-primary">
              {t.contact.directHeading}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.contact.directBody}
            </p>

            <ul className="mt-5 space-y-4">
              {siteConfig.email && (
                <li className="flex items-start gap-3">
                  <Mail
                    className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.about.emailLabel}
                    </p>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      onClick={() => track({ name: "email_click", placement: "contact" })}
                      className="break-all rounded-sm text-sm font-medium text-accent-strong hover:underline"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </li>
              )}

              {siteConfig.phone && (
                <li className="flex items-start gap-3">
                  <Phone
                    className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.about.phoneLabel}
                    </p>
                    <a
                      href={telHref(siteConfig.phone)}
                      onClick={() => track({ name: "phone_click", placement: "contact" })}
                      className="rounded-sm text-sm font-medium text-accent-strong hover:underline"
                    >
                      {siteConfig.phone}
                    </a>
                  </div>
                </li>
              )}

              {siteConfig.schedulingUrl && (
                <li className="flex items-start gap-3">
                  <CalendarDays
                    className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t.about.scheduleLabel}
                    </p>
                    <a
                      href={siteConfig.schedulingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track({ name: "schedule_click", placement: "contact" })}
                      className="rounded-sm text-sm font-medium text-accent-strong hover:underline"
                    >
                      {t.about.scheduleCta}
                    </a>
                  </div>
                </li>
              )}
            </ul>

            <div className="mt-6 flex items-start gap-3 rounded-md bg-secondary-subtle p-4">
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-secondary-subtle-foreground">
                {t.contact.responseNote}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
};

export default ContactSection;
