import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // MD3 Filled Button (high emphasis)
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:shadow-md-2 hover:bg-primary/95",
        // MD3 Filled Tonal Button (medium-high emphasis)
        secondary:
          "bg-secondary-container text-secondary-onContainer hover:bg-secondary-container/80 shadow-none",
        // MD3 Tertiary / Accent Button
        tertiary:
          "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 shadow-sm",
        // MD3 Outlined Button (medium emphasis)
        outline:
          "border border-outline/40 bg-transparent text-foreground hover:bg-surface-container hover:border-outline",
        // MD3 Ghost / Text Button (low emphasis)
        ghost:
          "text-foreground hover:bg-surface-container hover:text-primary",
        // MD3 Destructive
        destructive:
          "bg-error text-white hover:bg-error/90 shadow-sm",
        // MD3 Elevated Button
        elevated:
          "bg-surface-container-high text-primary shadow-md-1 hover:shadow-md-2 hover:bg-surface-container-highest",
      },
      size: {
        sm: "h-9 px-3.5 text-xs rounded-full gap-1.5",
        md: "h-11 px-5 text-sm rounded-full gap-2",
        lg: "h-12 px-6 text-base rounded-full gap-2.5",
        icon: "h-10 w-10 rounded-full p-0 flex items-center justify-center",
        "icon-sm": "h-8 w-8 rounded-full p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
