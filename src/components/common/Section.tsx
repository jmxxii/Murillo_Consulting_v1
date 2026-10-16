import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section shell + heading block.
 *
 * These exist because the previous build repeated the same eyebrow/heading/
 * intro markup and the same `bg-secondary/10` icon chip in four components.
 * Sections now declare their surface via a `tone` token instead of each
 * picking its own background classes.
 */

type Tone = "default" | "surface" | "navy";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-background",
  surface: "bg-surface",
  navy: "on-dark bg-nav text-nav-foreground",
};

interface SectionProps {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  /** Associates the section with its heading for screen readers. */
  labelledBy?: string;
}

export function Section({
  id,
  tone = "default",
  className,
  children,
  labelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-20 py-16 md:py-24", TONE_CLASSES[tone], className)}
    >
      <div className="container">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  intro?: string;
  /** Required when the parent Section uses `labelledBy`. */
  headingId?: string;
  align?: "center" | "left";
  tone?: Tone;
  /** `h2` for page sections, `h3` when nested. */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  intro,
  headingId,
  align = "center",
  tone = "default",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  const onNavy = tone === "navy";

  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p className={onNavy ? "eyebrow-on-dark" : "eyebrow"}>{eyebrow}</p>
      )}
      <Tag
        id={headingId}
        className={cn(
          "mt-3 font-display font-bold tracking-tight",
          Tag === "h1"
            ? "text-3xl sm:text-4xl md:text-5xl"
            : "text-2xl sm:text-3xl md:text-4xl",
          onNavy ? "text-nav-foreground" : "text-primary",
        )}
      >
        {heading}
      </Tag>
      {intro && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed md:text-lg",
            onNavy ? "text-nav-muted-foreground" : "text-muted-foreground",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

interface IconChipProps {
  children: ReactNode;
  /** Which brand color carries the chip. */
  color?: "green" | "navy" | "orange";
  size?: "md" | "lg";
  className?: string;
}

/** The rounded icon badge used on every card. Was duplicated 4× before. */
export function IconChip({
  children,
  color = "green",
  size = "md",
  className,
}: IconChipProps) {
  const colors = {
    green: "bg-secondary-subtle text-secondary",
    navy: "bg-primary-subtle text-primary",
    orange: "bg-accent-subtle text-accent-subtle-foreground",
  }[color];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg",
        size === "lg" ? "h-14 w-14" : "h-11 w-11",
        colors,
        className,
      )}
    >
      {children}
    </span>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Neutral content card. Sections compose this rather than restyling boxes. */
export function ContentCard({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-card md:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
