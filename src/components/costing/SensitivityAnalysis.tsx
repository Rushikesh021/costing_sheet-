"use client";

import * as React from "react";
import { FabricSpecs, YarnRates, WeavingCharges, Commercials, CurrencyCode } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateGreigeCosting, formatCurrency } from "@/lib/costing-calculator";
import { TrendingDown, TrendingUp, Sliders, AlertTriangle } from "lucide-react";

interface SensitivityAnalysisProps {
  specs: FabricSpecs;
  yarnRates: YarnRates;
  weaving: WeavingCharges;
  commercials: Commercials;
  currency: CurrencyCode;
}

export function SensitivityAnalysis({
  specs,
  yarnRates,
  weaving,
  commercials,
  currency,
}: SensitivityAnalysisProps) {
  const [yarnPriceDeltaPercent, setYarnPriceDeltaPercent] = React.useState<number>(0);

  // Baseline
  const baseline = calculateGreigeCosting(specs, yarnRates, weaving, commercials);

  // Scenario with adjusted yarn rates
  const adjustedRates: YarnRates = {
    ...yarnRates,
    warpRatePerKg: yarnRates.warpRatePerKg * (1 + yarnPriceDeltaPercent / 100),
    weftRatePerKg: yarnRates.weftRatePerKg * (1 + yarnPriceDeltaPercent / 100),
  };
  const scenario = calculateGreigeCosting(specs, adjustedRates, weaving, commercials);

  // Price impact
  const costDiffPerM = scenario.exMillCostPerMeter - baseline.exMillCostPerMeter;
  const orderCostDiff = costDiffPerM * commercials.orderQuantityMeters;

  // Fixed selling price scenario: if selling price is already locked with the buyer
  const lockedProfitPerM = baseline.netSellingPricePerMeter - scenario.exMillCostPerMeter;
  const lockedOrderProfit = lockedProfitPerM * commercials.orderQuantityMeters;
  const lockedMarginPercent =
    baseline.netSellingPricePerMeter > 0
      ? (lockedProfitPerM / baseline.netSellingPricePerMeter) * 100
      : 0;

  const steps = [-20, -10, -5, 0, 5, 10, 15, 20];

  return (
    <Card variant="filled" className="space-y-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            <Sliders className="h-5 w-5 text-primary" />
            Yarn Market Sensitivity & "What-If" Analysis
          </CardTitle>
          <CardDescription>
            Simulate volatile cotton/yarn price shocks and protect mill profit margins on contracted orders.
          </CardDescription>
        </div>
        <Badge
          variant={
            yarnPriceDeltaPercent > 0
              ? "error"
              : yarnPriceDeltaPercent < 0
              ? "success"
              : "neutral"
          }
          className="text-xs font-mono"
        >
          Yarn Rate: {yarnPriceDeltaPercent > 0 ? `+${yarnPriceDeltaPercent}%` : `${yarnPriceDeltaPercent}%`}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Interactive Slider */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">
              Adjust Yarn Price Fluctuation:
            </span>
            <div className="flex gap-1.5">
              {steps.map((st) => (
                <button
                  key={st}
                  onClick={() => setYarnPriceDeltaPercent(st)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                    yarnPriceDeltaPercent === st
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-surface-container text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {st > 0 ? `+${st}%` : `${st}%`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-foreground/60 w-10 text-right">-25%</span>
            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={yarnPriceDeltaPercent}
              onChange={(e) => setYarnPriceDeltaPercent(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <span className="text-xs text-foreground/60 w-10">+25%</span>
          </div>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
            <span className="text-[11px] font-medium text-foreground/70 block">
              Adjusted Ex-Mill Cost / m
            </span>
            <div className="text-xl font-bold text-foreground mt-1">
              {formatCurrency(scenario.exMillCostPerMeter, currency, 3)}
            </div>
            <span
              className={`text-xs font-semibold flex items-center gap-1 mt-1 ${
                costDiffPerM > 0
                  ? "text-error"
                  : costDiffPerM < 0
                  ? "text-success"
                  : "text-foreground/60"
              }`}
            >
              {costDiffPerM > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {costDiffPerM > 0 ? "+" : ""}
              {formatCurrency(costDiffPerM, currency, 3)} /m
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
            <span className="text-[11px] font-medium text-foreground/70 block">
              If Price is Locked with Buyer
            </span>
            <div className="text-xl font-bold text-foreground mt-1">
              {lockedMarginPercent.toFixed(1)}% margin
            </div>
            <span className="text-xs text-foreground/70 mt-1 block">
              Remaining Profit: {formatCurrency(lockedProfitPerM, currency, 3)} /m
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
            <span className="text-[11px] font-medium text-foreground/70 block">
              Order Profit Variance ({commercials.orderQuantityMeters.toLocaleString()} m)
            </span>
            <div
              className={`text-xl font-bold mt-1 ${
                orderCostDiff > 0 ? "text-error" : orderCostDiff < 0 ? "text-success" : "text-foreground"
              }`}
            >
              {orderCostDiff > 0 ? "-" : "+"}
              {formatCurrency(Math.abs(orderCostDiff), currency, 0)}
            </div>
            <span className="text-xs text-foreground/70 mt-1 block">
              Net Total Profit: {formatCurrency(lockedOrderProfit, currency, 0)}
            </span>
          </div>
        </div>

        {lockedMarginPercent < 5 && (
          <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/30 flex items-center gap-3 text-xs">
            <AlertTriangle className="h-5 w-5 text-error shrink-0" />
            <span>
              <strong>High Margin Risk!</strong> At +{yarnPriceDeltaPercent}% yarn rate, your net margin drops to{" "}
              <strong>{lockedMarginPercent.toFixed(1)}%</strong>. Consider hedging yarn contracts or inserting a raw material escalation clause.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
