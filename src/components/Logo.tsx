/**
 * Murillo Consulting — Logo
 *
 * Renders the official brand lockup from a pre-colored SVG asset — the correct
 * variant is chosen per background, so the artwork is never recolored, stretched,
 * or distorted (only scaled by height, width auto).
 *
 * Drop the official transparent PNGs at these paths (see public/assets/logo/).
 * Export at ~3x display size for retina crispness (horizontal ≈ 720×160+):
 *   mc-logo-horizontal.png           — color wordmark, for light backgrounds
 *   mc-logo-horizontal-reversed.png  — white wordmark, for navy backgrounds (nav/footer)
 *   mc-symbol.png / mc-symbol-reversed.png — icon-only marks (compact use)
 *
 * variant="nav"     — reversed (white) lockup for dark/navy surfaces
 * variant="default" — color lockup for light surfaces
 */

interface LogoProps {
  /** "nav" = reversed lockup for navy backgrounds; "default" = color lockup for light backgrounds */
  variant?: "nav" | "default";
  /** render the icon-only symbol instead of the full horizontal lockup */
  symbol?: boolean;
  className?: string;
}

const Logo = ({ variant = "nav", symbol = false, className = "" }: LogoProps) => {
  const reversed = variant === "nav";
  const base = symbol ? "mc-symbol" : "mc-logo-horizontal";
  const src = `/assets/logo/${base}${reversed ? "-reversed" : ""}.png`;

  return (
    <a
      href="#"
      className={`inline-flex items-center shrink-0 ${className}`}
      aria-label="Murillo Consulting — Home"
    >
      <img
        src={src}
        alt="Murillo Consulting"
        className={`w-auto select-none ${symbol ? "h-9" : "h-8 sm:h-9 md:h-10"}`}
        draggable={false}
      />
    </a>
  );
};

export default Logo;
