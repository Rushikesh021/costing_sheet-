"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENCIES } from "@/lib/costing-calculator";
import { CurrencyCode } from "@/lib/types";
import { FABRIC_PRESETS } from "@/lib/presets";
import {
  Sun,
  Moon,
  Layers,
  Printer,
  Calculator,
  FolderOpen,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";

interface CostingHeaderProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onLoadPreset: (presetId: string) => void;
  onOpenSavedQuotes: () => void;
  onOpenYarnMaster: () => void;
  onOpenCompare: () => void;
  onOpenPrintModal: () => void;
  savedCount: number;
}

export function CostingHeader({
  currentCurrency,
  onCurrencyChange,
  onLoadPreset,
  onOpenSavedQuotes,
  onOpenYarnMaster,
  onOpenCompare,
  onOpenPrintModal,
  savedCount,
}: CostingHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface/90 border-b border-outline-variant/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md-2 shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                Greige Costing System
              </h1>
              <Badge variant="default" className="text-[10px] hidden sm:inline-flex">
                Textile Weaving Pro
              </Badge>
            </div>
            <p className="text-xs text-foreground/60 hidden sm:block">
              Fabric Engineering & Mill Quotation Engine
            </p>
          </div>
        </div>

        {/* Quick Presets Dropdown */}
        <div className="hidden lg:flex items-center gap-2 bg-surface-container/60 p-1 rounded-2xl border border-outline-variant/30">
          <span className="text-xs text-foreground/70 px-2 flex items-center gap-1 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Preset:
          </span>
          <select
            aria-label="Fabric Presets"
            onChange={(e) => {
              if (e.target.value) onLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="text-xs bg-surface text-foreground font-medium rounded-xl border border-outline-variant/40 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[200px] truncate"
          >
            <option value="" disabled>
              Load Preset Fabric...
            </option>
            {FABRIC_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant/40">
            {CURRENCIES.slice(0, 3).map((c) => (
              <button
                key={c.code}
                onClick={() => onCurrencyChange(c.code as CurrencyCode)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
                  currentCurrency === c.code
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:text-foreground"
                }`}
                title={c.name}
              >
                {c.code}
              </button>
            ))}
            <select
              aria-label="Currency"
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="text-xs bg-transparent text-foreground/80 font-medium px-1.5 focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-surface text-foreground">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Yarn Converter Master Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenYarnMaster}
            className="hidden md:inline-flex"
            title="Yarn Count & Rate Converter"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Yarn Tools</span>
          </Button>

          {/* Compare Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCompare}
            className="hidden md:inline-flex"
            title="Compare Fabric Qualities"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Compare</span>
          </Button>

          {/* Saved Costings Drawer */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSavedQuotes}
            className="relative"
            title="Saved Costing Sheets"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Button>

          {/* Print / Export Quotation */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenPrintModal}
            title="Print / Export Costing Sheet"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quotation</span>
          </Button>

          {/* Dark / Light Mode Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full bg-surface-container flex items-center justify-center text-foreground hover:bg-surface-container-high transition-colors border border-outline-variant/40"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
