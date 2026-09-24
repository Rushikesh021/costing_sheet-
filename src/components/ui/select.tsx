import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, children, helperText, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-foreground/80 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            className={cn(
              "w-full h-11 appearance-none rounded-xl bg-surface-container/60 border border-outline/30 px-3.5 pr-10 text-sm text-foreground transition-all duration-150 focus:outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              className
            )}
            ref={ref}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-surface text-foreground py-1"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-3.5 h-4 w-4 text-foreground/50 pointer-events-none" />
        </div>
        {helperText && <p className="text-[11px] text-foreground/60">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
