import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Brand button scale.
 *
 * Contrast notes — every filled variant clears WCAG AA (4.5:1) with its own
 * foreground:
 *   default (navy/white) ......... 12.7:1
 *   secondary (green/white) ......  6.6:1
 *   cta (accent-strong/white) ....  5.0:1
 *
 * There is deliberately NO variant that fills with the raw `--accent` orange
 * and puts text on it: #ED722F only reaches 3.0:1 against white. Use `cta`,
 * which is the darker accessible orange, for any orange call to action.
 *
 * `onDark*` variants are for the navy sections and inherit the dark-surface
 * focus offset from the `.on-dark` class on their section wrapper.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm",
        cta: "bg-accent-strong text-accent-strong-foreground hover:bg-accent-strong-hover active:bg-accent-strong-active shadow-sm font-semibold",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background text-foreground hover:bg-surface hover:border-primary/40 active:bg-muted",
        ghost: "text-foreground hover:bg-surface active:bg-muted",
        link: "text-accent-strong underline-offset-4 hover:underline hover:text-accent-strong-hover",
        onDark:
          "bg-background text-primary hover:bg-surface active:bg-muted font-semibold shadow-sm",
        onDarkOutline:
          "border-2 border-nav-foreground/40 text-nav-foreground hover:bg-nav-foreground/10 hover:border-nav-foreground/70 active:bg-nav-foreground/15 font-semibold",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-10 rounded-md px-4",
        lg: "h-12 rounded-md px-7 text-base",
        xl: "h-14 rounded-md px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
