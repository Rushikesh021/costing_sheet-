"use client";

import * as React from "react";
import { CostingCalculations, CurrencyCode } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/costing-calculator";
import { PieChart, Scale } from "lucide-react";

interface CostBreakdownChartProps {
  results: CostingCalculations;
  currency: CurrencyCode;
}

interface CostItem {
  id: string;
  name: string;
  amount: number;
  color: string;
  hoverColor: string;
}

export function CostBreakdownChart({ results, currency }: CostBreakdownChartProps) {
  const [activeItem, setActiveItem] = React.useState<CostItem | null>(null);

  const items: CostItem[] = [
    {
      id: "warp",
      name: "Warp Yarn",
      amount: results.warpYarnCostPerMeter,
      color: "#2563eb", // blue-600
      hoverColor: "#1d4ed8",
    },
    {
      id: "weft",
      name: "Weft Yarn",
      amount: results.weftYarnCostPerMeter,
      color: "#0284c7", // sky-600
      hoverColor: "#0369a1",
    },
    {
      id: "sizing",
      name: "Sizing Formulation",
      amount: results.sizingCostPerMeter,
      color: "#0d9488", // teal-600
      hoverColor: "#0f766e",
    },
    {
      id: "weaving",
      name: "Direct Weaving",
      amount: results.directWeavingCostPerMeter,
      color: "#d97706", // amber-600
      hoverColor: "#b45309",
    },
    {
      id: "overheads",
      name: "Power & Overheads",
      amount: results.overheadsCostPerMeter,
      color: "#8b5cf6", // violet-500
      hoverColor: "#7c3aed",
    },
    {
      id: "inspection",
      name: "Inspection & Packing",
      amount: results.inspectionPackingCostPerMeter,
      color: "#64748b", // slate-500
      hoverColor: "#475569",
    },
    {
      id: "profit",
      name: "Net Profit",
      amount: results.profitPerMeter,
      color: "#16a34a", // green-600
      hoverColor: "#15803d",
    },
  ];

  const total = results.netSellingPricePerMeter || 1;

  // Calculate SVG donut segments
  let cumulativeAngle = 0;
  const radius = 70;
  const strokeWidth = 32;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  // Fabric Weight distribution
  const totalWeight = results.totalGLM || 1;
  const warpWeightPercent = (results.warpWeightGramsPerMeter / totalWeight) * 100;
  const weftWeightPercent = (results.weftWeightGramsPerMeter / totalWeight) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Cost & Revenue Donut Chart */}
      <Card variant="filled" className="lg:col-span-2 space-y-4">
        <CardHeader className="pb-2">
          <CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
            Cost & Profit Structure per Meter
          </CardTitle>
          <CardDescription>
            Interactive breakdown of material, conversion, overheads, and profit.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* SVG Donut */}
            <div className="relative flex flex-col items-center justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-surface-container-high"
                />
                {items.map((item) => {
                  const percentage = item.amount / total;
                  const strokeDasharray = `${circumference * percentage} ${circumference}`;
                  const strokeDashoffset = -circumference * cumulativeAngle;
                  cumulativeAngle += percentage;

                  return (
                    <circle
                      key={item.id}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setActiveItem(item)}
                      onMouseLeave={() => setActiveItem(null)}
                      style={{
                        opacity: activeItem ? (activeItem.id === item.id ? 1 : 0.4) : 0.95,
                        strokeWidth:
                          activeItem && activeItem.id === item.id ? strokeWidth + 4 : strokeWidth,
                      }}
                    />
                  );
                })}
              </svg>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-bold text-foreground/60 tracking-wider">
                  {activeItem ? activeItem.name : "Selling Price"}
                </span>
                <span className="text-sm font-extrabold text-foreground">
                  {activeItem
                    ? formatCurrency(activeItem.amount, currency, 3)
                    : formatCurrency(results.netSellingPricePerMeter, currency, 3)}
                </span>
                <span className="text-[11px] font-semibold text-primary">
                  {activeItem
                    ? `${((activeItem.amount / total) * 100).toFixed(1)}%`
                    : "100%"}
                </span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2 text-xs">
              {items.map((item) => {
                const pct = ((item.amount / total) * 100).toFixed(1);
                const isHovered = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setActiveItem(item)}
                    onMouseLeave={() => setActiveItem(null)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      isHovered
                        ? "bg-surface-container-highest shadow-sm font-semibold"
                        : "hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground/90">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-foreground">
                        {formatCurrency(item.amount, currency, 3)}
                      </span>
                      <span className="text-[11px] text-foreground/60 w-10 text-right font-medium">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Fabric Weight Ratio (Warp vs Weft) */}
      <Card variant="filled" className="space-y-4 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle>
            <Scale className="h-5 w-5 text-secondary" />
            Yarn Weight Ratio
          </CardTitle>
          <CardDescription>
            Linear density distribution in 1 linear meter of woven greige.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-primary">
                Warp: {results.warpWeightGramsPerMeter.toFixed(1)} g/m ({warpWeightPercent.toFixed(1)}%)
              </span>
              <span className="font-medium text-sky-600">
                Weft: {results.weftWeightGramsPerMeter.toFixed(1)} g/m ({weftWeightPercent.toFixed(1)}%)
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="h-4 w-full rounded-full bg-surface-container-highest overflow-hidden flex shadow-inner">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${warpWeightPercent}%` }}
                title={`Warp: ${warpWeightPercent.toFixed(1)}%`}
              />
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${weftWeightPercent}%` }}
                title={`Weft: ${weftWeightPercent.toFixed(1)}%`}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground/70">Total Linear Weight (GLM):</span>
              <span className="font-bold text-foreground">{results.totalGLM.toFixed(1)} g/m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/70">Square Meter Weight (GSM):</span>
              <span className="font-bold text-foreground">{results.totalGSM.toFixed(1)} GSM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/70">Square Yard Weight:</span>
              <span className="font-bold text-foreground">{results.ouncesPerSqYard.toFixed(2)} oz/yd²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/70">Greige Cover Factor:</span>
              <span className="font-bold text-primary">{results.greigeCoverFactor.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
