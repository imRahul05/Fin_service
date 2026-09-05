import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        secondary:
          "border-border/80 bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80",
        outline: "border-border/80 text-foreground bg-transparent",
        pill: "border-border/80 bg-card text-foreground font-medium shadow-2xs",
        success: "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
        warning: "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
        info: "border-zinc-200/80 bg-zinc-100 text-zinc-800 dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
