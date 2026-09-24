"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowRightLeft } from "lucide-react";

interface YarnMasterModalProps {
  open: boolean;
  onClose: () => void;
}

export function YarnMasterModal({ open, onClose }: YarnMasterModalProps) {
  const [neCount, setNeCount] = React.useState<number>(40);
  const [denier, setDenier] = React.useState<number>(132.88);
  const [tex, setTex] = React.useState<number>(14.76);
  const [nm, setNm] = React.useState<number>(67.74);

  const [priceKg, setPriceKg] = React.useState<number>(4.0);
  const [priceLb, setPriceLb] = React.useState<number>(1.814);

  const handleNeChange = (val: number) => {
    setNeCount(val);
    if (val > 0) {
      setDenier(parseFloat((5315 / val).toFixed(2)));
      setTex(parseFloat((590.541 / val).toFixed(2)));
      setNm(parseFloat((val * 1.69336).toFixed(2)));
    }
  };

  const handleDenierChange = (val: number) => {
    setDenier(val);
    if (val > 0) {
      const calculatedNe = parseFloat((5315 / val).toFixed(2));
      setNeCount(calculatedNe);
      setTex(parseFloat((val / 9).toFixed(2)));
      setNm(parseFloat((9000 / val).toFixed(2)));
    }
  };

  const handlePriceKgChange = (val: number) => {
    setPriceKg(val);
    setPriceLb(parseFloat((val / 2.20462).toFixed(3)));
  };

  const handlePriceLbChange = (val: number) => {
    setPriceLb(val);
    setPriceKg(parseFloat((val * 2.20462).toFixed(3)));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Textile Yarn Count & Unit Converter"
      description="Standard international yarn linear density conversions and price/kg to price/lb calculators."
      maxWidth="2xl"
    >
      <div className="space-y-6 pt-2">
        {/* Count Conversions */}
        <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Calculator className="h-4 w-4" /> Direct & Indirect Yarn Count Systems
            </h4>
            <Badge variant="default" className="text-xs">
              ASTM D1907 / ISO 2060
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="English Cotton (Ne)"
              type="number"
              step="any"
              min="1"
              value={neCount || ""}
              onChange={(e) => handleNeChange(parseFloat(e.target.value) || 0)}
              suffix="Ne"
              helperText="Spun Cotton/PC"
            />
            <Input
              label="Denier (Td)"
              type="number"
              step="any"
              min="1"
              value={denier || ""}
              onChange={(e) => handleDenierChange(parseFloat(e.target.value) || 0)}
              suffix="den"
              helperText="Filament / Poly"
            />
            <Input
              label="Tex (Tt)"
              type="number"
              step="any"
              min="0.1"
              value={tex || ""}
              onChange={(e) => {
                const t = parseFloat(e.target.value) || 0;
                setTex(t);
                if (t > 0) handleNeChange(parseFloat((590.541 / t).toFixed(2)));
              }}
              suffix="tex"
              helperText="ISO Standard"
            />
            <Input
              label="Metric Count (Nm)"
              type="number"
              step="any"
              min="1"
              value={nm || ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value) || 0;
                setNm(n);
                if (n > 0) handleNeChange(parseFloat((n / 1.69336).toFixed(2)));
              }}
              suffix="Nm"
              helperText="Worsted / Wool"
            />
          </div>
        </div>

        {/* Price Converter */}
        <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <ArrowRightLeft className="h-4 w-4" /> Yarn Price Converter (Kg vs Lb)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price per Kilogram ($/kg)"
              type="number"
              step="0.01"
              min="0"
              value={priceKg || ""}
              onChange={(e) => handlePriceKgChange(parseFloat(e.target.value) || 0)}
              prefix="$"
              suffix="/kg"
            />
            <Input
              label="Price per Pound ($/lb)"
              type="number"
              step="0.01"
              min="0"
              value={priceLb || ""}
              onChange={(e) => handlePriceLbChange(parseFloat(e.target.value) || 0)}
              prefix="$"
              suffix="/lb"
              helperText="1 kg = 2.20462 lbs"
            />
          </div>
        </div>

        {/* Common Reference Counts in Weaving */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-foreground/80">
            Quick Reference Industry Weaving Counts:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {[10, 16, 20, 30, 40, 60, 80].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleNeChange(c)}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  neCount === c
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                    : "bg-surface-container-low hover:bg-surface-container border-outline-variant/40 text-foreground"
                }`}
              >
                <div className="font-bold">{c}s Ne</div>
                <div className="text-[10px] opacity-80">{(5315 / c).toFixed(0)} den</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
