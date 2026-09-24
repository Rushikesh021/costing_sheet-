import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary-container text-primary-onContainer border border-primary/20",
        secondary:
          "bg-secondary-container text-secondary-onContainer border border-secondary/20",
        tertiary:
          "bg-tertiary-container text-tertiary-onContainer border border-tertiary/20",
        outline:
          "border border-outline/40 text-foreground bg-surface-container/40",
        success:
          "bg-success-container text-success-onContainer border border-success/30",
        error:
          "bg-error-container text-error-onContainer border border-error/30",
        neutral:
          "bg-surface-container-high text-foreground/80 border border-outline-variant/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
