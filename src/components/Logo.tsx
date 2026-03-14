/**
 * Murillo Consulting — Logo Component
 *
 * Mark concept: Geometric M letterform with two ascending peaks (upward momentum /
 * energy sector), a grounding baseline (stability / infrastructure), and a small
 * accent node at the M valley (energy connection point). Clean, minimal, consulting-grade.
 *
 * variant="nav"     — white strokes for use on dark/primary nav backgrounds
 * variant="default" — navy strokes for use on light backgrounds
 */

interface LogoProps {
  /** "nav" renders white for dark nav backgrounds; "default" renders navy for light backgrounds */
  variant?: "nav" | "default";
  className?: string;
}

const Logo = ({ variant = "nav", className = "" }: LogoProps) => {
  const onDark = variant === "nav";

  const stroke = onDark ? "#ffffff" : "hsl(215, 60%, 18%)";
  const accentFill = onDark ? "rgba(255,255,255,0.50)" : "hsl(200, 70%, 45%)";
  const nameColor = onDark ? "text-primary-foreground" : "text-foreground";
  const llcColor = onDark ? "text-primary-foreground/45" : "text-muted-foreground";

  return (
    <a
      href="#"
      className={`flex items-center gap-3 group ${className}`}
      aria-label="Murillo Consulting — Home"
    >
      {/* ── Symbol mark ── */}
      <svg
        viewBox="0 0 40 36"
        height="34"
        width="38"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* M letterform — two angular ascending peaks */}
        <path
          d="M3 32 L13 7 L20 20 L27 7 L37 32"
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Baseline — grounds the mark, references infrastructure */}
        <line
          x1="3" y1="32" x2="37" y2="32"
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Accent node at the M valley — energy connection point */}
        <circle cx="20" cy="20" r="2.8" fill={accentFill} />
      </svg>

      {/* ── Wordmark ── */}
      <div className="leading-none select-none">
        <span
          className={`font-display font-bold text-[17px] tracking-tight block ${nameColor}`}
        >
          Murillo Consulting
        </span>
        <span
          className={`font-sans text-[9.5px] font-semibold tracking-[0.18em] uppercase block mt-[3px] ${llcColor}`}
        >
          LLC
        </span>
      </div>
    </a>
  );
};

export default Logo;
