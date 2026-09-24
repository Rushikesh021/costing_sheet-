"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
  showClose?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
  showClose = true,
}: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* MD3 Modal Surface */}
      <div
        className={cn(
          "relative w-full rounded-3xl bg-surface-container-high border border-outline-variant/50 p-6 md:p-8 shadow-md-5 z-10 my-auto text-foreground animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col",
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-outline-variant/30 shrink-0">
          <div>
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs md:text-sm text-foreground/70 mt-1">
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-foreground/60 hover:text-foreground hover:bg-surface-container-highest transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 py-4 pr-1">{children}</div>
      </div>
    </div>
  );
}
