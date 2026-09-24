"use client";

import * as React from "react";
import { YarnRates, CurrencyCode } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/costing-calculator";
import { Coins, CircleDollarSign, FlaskConical, TrendingUp } from "lucide-react";

interface YarnRatesFormProps {
  yarnRates: YarnRates;
  onChange: (updated: Partial<YarnRates>) => void;
  currency: CurrencyCode;
  warpCostPerM: number;
  weftCostPerM: number;
  sizingCostPerM: number;
  totalYarnKg: number;
}

export function YarnRatesForm({
  yarnRates,
  onChange,
  currency,
  warpCostPerM,
  weftCostPerM,
  sizingCostPerM,
  totalYarnKg,
}: YarnRatesFormProps) {
  const totalMaterialM = warpCostPerM + weftCostPerM + sizingCostPerM;

  return (
    <Card variant="filled" className="space-y-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            <Coins className="h-5 w-5 text-primary" />
            Raw Material & Yarn Rates
          </CardTitle>
          <CardDescription>
            Specify procurement yarn rates per kg, spinning/weaving wastage %, and sizing chemicals.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-mono">
            Yarn Cost: {formatCurrency(totalMaterialM, currency)}/m
          </Badge>
          <Badge variant="neutral" className="text-xs font-mono hidden sm:inline-flex">
            Order Yarn: {totalYarnKg.toFixed(0)} kg
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Yarn Rates per kg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4" /> Warp Yarn Rate
              </span>
              <span className="text-xs font-semibold text-foreground/80">
                {formatCurrency(warpCostPerM, currency)} / meter
              </span>
            </div>
            <Input
              label={`Warp Price per kg (${currency})`}
              type="number"
              step="0.05"
              min="0"
              value={yarnRates.warpRatePerKg || ""}
              onChange={(e) =>
                onChange({ warpRatePerKg: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
              suffix="/kg"
            />
            <Input
              label="Warp Wastage / Hard Waste (%)"
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={yarnRates.warpWastagePercent || ""}
              onChange={(e) =>
                onChange({ warpWastagePercent: parseFloat(e.target.value) || 0 })
              }
              suffix="%"
              helperText="Typical warping, sizing and drawing-in waste (2.0% - 3.5%)"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4" /> Weft Yarn Rate
              </span>
              <span className="text-xs font-semibold text-foreground/80">
                {formatCurrency(weftCostPerM, currency)} / meter
              </span>
            </div>
            <Input
              label={`Weft Price per kg (${currency})`}
              type="number"
              step="0.05"
              min="0"
              value={yarnRates.weftRatePerKg || ""}
              onChange={(e) =>
                onChange({ weftRatePerKg: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
              suffix="/kg"
            />
            <Input
              label="Weft Wastage (%)"
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={yarnRates.weftWastagePercent || ""}
              onChange={(e) =>
                onChange({ weftWastagePercent: parseFloat(e.target.value) || 0 })
              }
              suffix="%"
              helperText="Package winding and loom weft fringe waste (2.5% - 4.0%)"
            />
          </div>
        </div>

        {/* Sizing & Chemicals */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
              <FlaskConical className="h-4 w-4" /> Warping & Sizing Chemicals
            </span>
            <span className="text-xs font-semibold text-foreground/80">
              {formatCurrency(sizingCostPerM, currency)} / meter
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Sizing Chemical / Recipe Cost (${currency}/kg Warp)`}
              type="number"
              step="0.01"
              min="0"
              value={yarnRates.sizingChemicalCostPerKg || ""}
              onChange={(e) =>
                onChange({ sizingChemicalCostPerKg: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
              suffix="/kg"
              helperText="Starch, PVA, Acrylic binders, wax per kg of warp yarn"
            />
            <Input
              label="Sizing Wastage (%)"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={yarnRates.sizingWastagePercent || ""}
              onChange={(e) =>
                onChange({ sizingWastagePercent: parseFloat(e.target.value) || 0 })
              }
              suffix="%"
              helperText="Size paste and beam runout waste"
            />
          </div>
        </div>

        {/* Summary Card for Yarn Cost contribution */}
        <div className="p-3.5 rounded-xl bg-surface-container flex flex-wrap items-center justify-between gap-3 border border-outline-variant/30 text-xs">
          <div className="flex items-center gap-2 text-foreground/80">
            <TrendingUp className="h-4 w-4 text-primary shrink-0" />
            <span>
              Material represents{" "}
              <strong>
                {totalMaterialM > 0
                  ? (
                      ((warpCostPerM + weftCostPerM) / (totalMaterialM || 1)) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </strong>{" "}
              pure yarn and{" "}
              <strong>
                {totalMaterialM > 0
                  ? ((sizingCostPerM / (totalMaterialM || 1)) * 100).toFixed(1)
                  : "0"}
                %
              </strong>{" "}
              sizing chemical formulation.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
