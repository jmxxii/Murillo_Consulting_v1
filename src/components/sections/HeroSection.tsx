import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/content/site";
import { useLanguage } from "@/i18n/LanguageProvider";
import { trackCtaClick } from "@/lib/analytics";
import heroImage from "@/assets/hero-energy.jpg";

/**
 * Hero.
 *
 * The background photo is decorative — the message is carried entirely by
 * the text — so it is marked `alt=""` and hidden from assistive tech. A navy
 * gradient sits over it to guarantee the headline clears AA regardless of
 * what part of the photo lands behind it.
 */
const HeroSection = () => {
  const { t, path } = useLanguage();
  const base = path("/");
  const anchor = (id: string) => `${base === "/" ? "" : base}#${id}`;

  return (
    <section className="on-dark relative isolate overflow-hidden bg-nav">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {/* Two layers: a flat wash for contrast, plus a directional gradient
            so the left column (where the copy sits) stays darkest. */}
        <div className="absolute inset-0 bg-nav/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-nav via-nav/85 to-nav/60" />
      </div>

      <div className="container py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="eyebrow-on-dark">{t.hero.eyebrow}</p>

          <h1 className="mt-4 font-display text-3xl font-bold leading-[1.12] tracking-tight text-nav-foreground sm:text-4xl md:text-5xl lg:text-[3.4rem]">
            {t.hero.headline}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-nav-muted-foreground md:text-lg">
            {t.hero.supporting}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button variant="cta" size="xl" className="w-full sm:w-auto" asChild>
              <a
                href={anchor(SECTION_IDS.contact)}
                onClick={() => trackCtaClick("hero", "primary")}
              >
                {t.hero.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button variant="onDarkOutline" size="xl" className="w-full sm:w-auto" asChild>
              <a
                href={anchor(SECTION_IDS.process)}
                onClick={() => trackCtaClick("hero", "secondary")}
              >
                {t.hero.secondaryCta}
              </a>
            </Button>
          </div>

          <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-7 sm:gap-y-3">
            {t.hero.highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm font-medium text-nav-foreground/90"
              >
                <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
