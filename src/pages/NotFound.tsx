import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * 404.
 *
 * Deliberately does not log the attempted path — that used to go to
 * `console.error`, which puts visitor-supplied URLs in the console for
 * anyone to read.
 */
const NotFound = () => {
  const { t, locale, path } = useLanguage();

  useDocumentMeta({
    title: t.seo.notFoundTitle,
    description: t.seo.notFoundDescription,
    path: "/",
    locale,
    noindex: true,
  });

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-surface px-5 py-20">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-6xl font-bold text-primary/25">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-primary md:text-3xl">
          {t.notFound.heading}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {t.notFound.body}
        </p>
        <Button variant="cta" size="lg" className="mt-7" asChild>
          <Link to={path("/")}>{t.notFound.cta}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
