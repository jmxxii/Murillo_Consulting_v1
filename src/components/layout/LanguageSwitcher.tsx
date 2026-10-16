import { Check, Globe } from "lucide-react";
import { dictionaries, LOCALES } from "@/i18n";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** "compact" is the pill form; "list" is the stacked mobile form. */
  variant?: "compact" | "list";
  /** Surface it sits on. The header is light, the footer is navy. */
  tone?: "light" | "dark";
  onSwitch?: () => void;
  className?: string;
}

/**
 * Language selector.
 *
 * Implemented as a radio group rather than a menu: with only two options a
 * segmented control is one tab-stop plus arrow keys, which is faster for
 * keyboard and screen-reader users than opening a dropdown. The active
 * language is conveyed by `aria-checked` and a check icon, not by color
 * alone.
 */
const LanguageSwitcher = ({
  variant = "compact",
  tone = "dark",
  onSwitch,
  className,
}: LanguageSwitcherProps) => {
  const { locale, setLocale, t } = useLanguage();
  const light = tone === "light";

  const handleSelect = (next: (typeof LOCALES)[number]) => {
    setLocale(next);
    onSwitch?.();
  };

  const styles = light
    ? {
        wrapper: "border-border bg-surface",
        globe: "text-muted-foreground",
        active: "bg-primary text-primary-foreground shadow-sm",
        idle: "text-muted-foreground hover:text-primary",
        listActive: "bg-primary-subtle text-primary",
        listIdle: "text-muted-foreground hover:bg-surface hover:text-primary",
        check: "text-accent-strong",
      }
    : {
        wrapper: "border-nav-border bg-nav-foreground/5",
        globe: "text-nav-muted-foreground",
        active: "bg-nav-foreground text-nav shadow-sm",
        idle: "text-nav-muted-foreground hover:text-nav-foreground",
        listActive: "bg-nav-foreground/10 text-nav-foreground",
        listIdle: "text-nav-muted-foreground hover:bg-nav-foreground/5 hover:text-nav-foreground",
        check: "text-accent",
      };

  if (variant === "list") {
    return (
      <div
        role="radiogroup"
        aria-label={t.nav.languageSwitcherAria}
        className={cn("flex flex-col gap-1", className)}
      >
        {LOCALES.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              lang={dictionaries[code].meta.htmlLang}
              onClick={() => handleSelect(code)}
              className={cn(
                "flex min-h-[44px] items-center justify-between rounded-md px-4 py-3 text-[15px] font-medium transition-colors",
                active ? styles.listActive : styles.listIdle,
              )}
            >
              <span>{dictionaries[code].meta.localeNativeName}</span>
              {active && (
                <Check className={cn("h-4 w-4", styles.check)} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={t.nav.languageSwitcherAria}
      className={cn(
        "flex items-center gap-0.5 rounded-full border p-0.5",
        styles.wrapper,
        className,
      )}
    >
      <Globe
        className={cn("ml-2 mr-0.5 h-3.5 w-3.5 shrink-0", styles.globe)}
        aria-hidden="true"
      />
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            lang={dictionaries[code].meta.htmlLang}
            onClick={() => handleSelect(code)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? styles.active : styles.idle,
            )}
          >
            {dictionaries[code].meta.localeNativeName}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
