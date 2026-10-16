import { Link } from "react-router-dom";
import { siteConfig } from "@/content/site";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/**
 * Murillo Consulting logo lockup.
 *
 * Renders a pre-colored PNG so the artwork is never recolored or distorted —
 * only scaled by height. Pick the variant that matches the background:
 *   "reversed" (white wordmark) for navy surfaces
 *   "color"    for light surfaces
 *
 * Lockups:
 *   "horizontal" — emblem beside the wordmark (header, footer)
 *   "stacked"    — emblem above the wordmark; falls back to horizontal until
 *                  the asset is supplied (siteConfig.logo.stacked)
 *   "symbol"     — emblem only
 *
 * Intrinsic width/height come from the real asset dimensions so the browser
 * reserves the right box and the header does not shift while loading.
 */

type Lockup = "horizontal" | "stacked" | "symbol";

interface LogoProps {
  variant?: "color" | "reversed";
  lockup?: Lockup;
  /** Wrap in a link to the localized homepage. Off for footer/static use. */
  asLink?: boolean;
  className?: string;
  /** `eager` for the header logo (it is above the fold), `lazy` elsewhere. */
  loading?: "eager" | "lazy";
}

/** Intrinsic pixel dimensions of each asset, for aspect-ratio reservation. */
const DIMENSIONS: Record<Lockup, { width: number; height: number }> = {
  horizontal: { width: 1327, height: 470 },
  stacked: { width: 1024, height: 1024 },
  symbol: { width: 512, height: 512 },
};

const SIZE_CLASSES: Record<Lockup, string> = {
  horizontal: "h-8 sm:h-9 md:h-10",
  stacked: "h-16 sm:h-20",
  symbol: "h-9",
};

function resolveSource(lockup: Lockup, reversed: boolean): {
  src: string;
  lockup: Lockup;
} {
  const { logo } = siteConfig;

  if (lockup === "symbol") {
    return { src: reversed ? logo.symbolReversed : logo.symbol, lockup };
  }

  if (lockup === "stacked") {
    const stacked = reversed ? logo.stackedReversed : logo.stacked;
    // Fall back to the horizontal lockup rather than rendering a broken image.
    if (stacked) return { src: stacked, lockup };
    return {
      src: reversed ? logo.reversed : logo.color,
      lockup: "horizontal",
    };
  }

  return { src: reversed ? logo.reversed : logo.color, lockup: "horizontal" };
}

const Logo = ({
  variant = "reversed",
  lockup = "horizontal",
  asLink = true,
  className,
  loading = "lazy",
}: LogoProps) => {
  const { t, path } = useLanguage();
  const reversed = variant === "reversed";
  const { src, lockup: resolved } = resolveSource(lockup, reversed);
  const { width, height } = DIMENSIONS[resolved];

  const image = (
    <img
      src={src}
      alt={asLink ? t.common.companyShortName : ""}
      aria-hidden={asLink ? undefined : true}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      draggable={false}
      className={cn("w-auto select-none", SIZE_CLASSES[resolved], className)}
    />
  );

  if (!asLink) return image;

  return (
    <Link
      to={path("/")}
      className="inline-flex shrink-0 items-center rounded-sm"
      aria-label={`${t.common.companyShortName} — ${t.nav.home}`}
    >
      {image}
    </Link>
  );
};

export default Logo;
