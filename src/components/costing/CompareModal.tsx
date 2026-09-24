"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FABRIC_PRESETS } from "@/lib/presets";
import { FabricSpecs, YarnRates, WeavingCharges, Commercials, CurrencyCode } from "@/lib/types";
import { calculateGreigeCosting, formatCurrency } from "@/lib/costing-calculator";
import { ArrowRightLeft, Check, Layers } from "lucide-react";

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  activeSpecs: FabricSpecs;
  activeYarnRates: YarnRates;
  activeWeaving: WeavingCharges;
  activeCommercials: Commercials;
  currency: CurrencyCode;
}

export function CompareModal({
  open,
  onClose,
  activeSpecs,
  activeYarnRates,
  activeWeaving,
  activeCommercials,
  currency,
}: CompareModalProps) {
  const [selectedPresetId1, setSelectedPresetId1] = React.useState<string>("poplin-40-40");
  const [selectedPresetId2, setSelectedPresetId2] = React.useState<string>("twill-20-16");

  const currentResult = calculateGreigeCosting(
    activeSpecs,
    activeYarnRates,
    activeWeaving,
    activeCommercials
  );

  const preset1 = FABRIC_PRESETS.find((p) => p.id === selectedPresetId1) || FABRIC_PRESETS[0];
  const result1 = calculateGreigeCosting(
    preset1.specs,
    preset1.yarnRates,
    preset1.weavingCharges,
    preset1.commercials
  );

  const preset2 = FABRIC_PRESETS.find((p) => p.id === selectedPresetId2) || FABRIC_PRESETS[2];
  const result2 = calculateGreigeCosting(
    preset2.specs,
    preset2.yarnRates,
    preset2.weavingCharges,
    preset2.commercials
  );

  const columns = [
    {
      title: "Current Active Quality",
      name: activeSpecs.qualityName || "Custom Construction",
      specs: activeSpecs,
      results: currentResult,
      isCurrent: true,
    },
    {
      title: "Quality A",
      name: preset1.name,
      specs: preset1.specs,
      results: result1,
      isCurrent: false,
      selector: (
        <select
          value={selectedPresetId1}
          onChange={(e) => setSelectedPresetId1(e.target.value)}
          className="text-xs bg-surface border border-outline-variant/40 rounded-lg p-1 text-foreground"
        >
          {FABRIC_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      title: "Quality B",
      name: preset2.name,
      specs: preset2.specs,
      results: result2,
      isCurrent: false,
      selector: (
        <select
          value={selectedPresetId2}
          onChange={(e) => setSelectedPresetId2(e.target.value)}
          className="text-xs bg-surface border border-outline-variant/40 rounded-lg p-1 text-foreground"
        >
          {FABRIC_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Fabric Construction & Cost Comparison"
      description="Compare specifications, weights, yarn consumption, and profitability across multiple fabric qualities side-by-side."
      maxWidth="4xl"
    >
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/40">
              <th className="p-3 text-foreground/60 font-semibold w-1/4">Parameter</th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`p-3 w-1/4 ${
                    col.isCurrent ? "bg-primary/10 rounded-t-2xl font-bold" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-foreground/60 uppercase tracking-wide">
                      {col.title}
                    </span>
                    <span className="text-sm font-bold text-foreground truncate">
                      {col.name}
                    </span>
                    {col.selector && <div className="mt-1">{col.selector}</div>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {/* Construction */}
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Warp Count x Weft Count</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5 font-semibold" : ""}`}>
                  {c.specs.warpCount}s x {c.specs.weftCount}s
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Density (EPI x PPI)</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5 font-semibold" : ""}`}>
                  {c.specs.epi} x {c.specs.ppi} ({c.specs.epi + c.specs.ppi} TC)
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Greige Width</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5" : ""}`}>
                  {c.specs.greigeWidth}&quot; ({c.specs.reedSpace}&quot; Reed)
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Weave Type</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5" : ""}`}>
                  <Badge variant="outline" className="text-[10px]">
                    {c.specs.weaveType}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Weights */}
            <tr className="hover:bg-surface-container/40 bg-surface-container-low/40">
              <td className="p-3 font-bold text-foreground">Greige GSM / oz/yd²</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/10 font-bold text-primary" : "font-semibold"}`}>
                  {c.results.totalGSM.toFixed(1)} GSM ({c.results.ouncesPerSqYard.toFixed(2)} oz)
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">GLM (Linear Weight)</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5" : ""}`}>
                  {c.results.totalGLM.toFixed(1)} g/m
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Cover Factor</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5" : ""}`}>
                  {c.results.greigeCoverFactor.toFixed(1)}
                </td>
              ))}
            </tr>

            {/* Financials */}
            <tr className="hover:bg-surface-container/40 bg-surface-container-low/40">
              <td className="p-3 font-bold text-foreground">Material Cost / m</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/10 font-bold" : "font-semibold"}`}>
                  {formatCurrency(c.results.totalMaterialCostPerMeter, currency, 3)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Conversion & Overheads / m</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5" : ""}`}>
                  {formatCurrency(c.results.totalConversionCostPerMeter, currency, 3)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-bold text-foreground">Ex-Mill Cost / m</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5 font-bold" : "font-semibold"}`}>
                  {formatCurrency(c.results.exMillCostPerMeter, currency, 3)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40 bg-primary/15">
              <td className="p-3 font-extrabold text-foreground">Selling Price / Meter</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/20 font-extrabold text-primary text-sm" : "font-bold text-sm"}`}>
                  {formatCurrency(c.results.netSellingPricePerMeter, currency, 3)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Selling Price / Yard</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5 font-semibold" : ""}`}>
                  {formatCurrency(c.results.netSellingPricePerYard, currency, 3)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-surface-container/40">
              <td className="p-3 font-medium text-foreground/80">Loom Output / 24hr</td>
              {columns.map((c, i) => (
                <td key={i} className={`p-3 ${c.isCurrent ? "bg-primary/5" : ""}`}>
                  ~{c.results.metersPerLoomPerDay.toFixed(0)} meters
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}
