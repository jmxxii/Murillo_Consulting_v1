import { siteConfig } from "@/content/site";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLanguage } from "@/i18n/LanguageProvider";

/** Privacy policy. All wording lives in `t.privacy` so both languages stay in step. */
const Privacy = () => {
  const { t, locale } = useLanguage();
  const p = t.privacy;

  useDocumentMeta({
    title: t.seo.privacyTitle,
    description: t.seo.privacyDescription,
    path: "/privacy",
    locale,
  });

  return (
    <div className="bg-surface px-5 py-16 md:py-20">
      <article className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 shadow-card md:p-10">
        <h1 className="font-display text-3xl font-bold text-primary md:text-4xl">{p.heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{p.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-foreground">{p.intro}</p>

        {p.sections.map((section) => (
          <section key={section.heading} className="mt-9">
            <h2 className="font-display text-xl font-semibold text-primary">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {siteConfig.email && (
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-3 inline-block rounded-sm font-semibold text-accent-strong hover:underline"
          >
            {siteConfig.email}
          </a>
        )}
      </article>
    </div>
  );
};

export default Privacy;
