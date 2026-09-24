import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  suffix?: string | React.ReactNode;
  prefix?: string | React.ReactNode;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, suffix, prefix, helperText, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-foreground/80 tracking-wide flex items-center justify-between"
          >
            <span>{label}</span>
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 text-sm text-foreground/50 pointer-events-none select-none">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full h-11 rounded-xl bg-surface-container/60 border border-outline/30 px-3.5 text-sm text-foreground placeholder:text-foreground/40 transition-all duration-150 focus:outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
              prefix && "pl-8",
              suffix && "pr-12",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-xs font-semibold text-foreground/60 pointer-events-none select-none bg-surface-container px-1.5 py-0.5 rounded-md">
              {suffix}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-foreground/60">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
