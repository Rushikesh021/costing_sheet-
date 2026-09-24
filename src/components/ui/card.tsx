import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "filled" | "outlined";
}

export function Card({
  className,
  variant = "filled",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    // MD3 Elevated: surface-container-low with soft shadow
    elevated:
      "bg-surface-container-low shadow-md-1 hover:shadow-md-2 border border-outline-variant/30",
    // MD3 Filled: surface-container without prominent shadow
    filled: "bg-surface-container/60 border border-outline-variant/40",
    // MD3 Outlined: surface with outline border
    outlined: "bg-surface border border-outline/30",
  };

  return (
    <div
      className={cn(
        "rounded-3xl p-5 md:p-6 transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base md:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs md:text-sm text-foreground/70", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-outline-variant/30", className)}
      {...props}
    >
      {children}
    </div>
  );
}
