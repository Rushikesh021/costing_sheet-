"use client";

import * as React from "react";
import { CostingCalculations, CurrencyCode } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/costing-calculator";
import {
  TrendingUp,
  Scale,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface CostSummaryCardsProps {
  results: CostingCalculations;
  currency: CurrencyCode;
}

export function CostSummaryCards({ results, currency }: CostSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Main Hero Card: Selling Price */}
      <Card
        variant="elevated"
        className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-surface-container to-surface-container-high border-primary/30 p-5 flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Quoted Selling Price
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {formatCurrency(results.netSellingPricePerMeter, currency, 3)}
              <span className="text-xs font-medium text-foreground/60 ml-1">/meter</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs">
          <span className="text-foreground/70">Per Yard:</span>
          <span className="font-bold text-foreground">
            {formatCurrency(results.netSellingPricePerYard, currency, 3)} /yd
          </span>
        </div>
      </Card>

      {/* 2. Fabric Weight & Structure Card (GSM & GLM) */}
      <Card variant="filled" className="p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> Greige Fabric Weight
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {results.totalGSM.toFixed(1)}
              <span className="text-xs font-medium text-foreground/60 ml-1">GSM</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-secondary-container text-secondary-onContainer flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/30 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-foreground/60 block text-[10px]">GLM:</span>
            <span className="font-semibold text-foreground">{results.totalGLM.toFixed(1)} g/m</span>
          </div>
          <div className="text-right">
            <span className="text-foreground/60 block text-[10px]">oz/yd²:</span>
            <span className="font-semibold text-foreground">{results.ouncesPerSqYard.toFixed(2)} oz</span>
          </div>
        </div>
      </Card>

      {/* 3. Cost & Profit Breakdown Card */}
      <Card variant="filled" className="p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Ex-Mill Cost & Profit
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {formatCurrency(results.exMillCostPerMeter, currency, 3)}
              <span className="text-xs font-medium text-foreground/60 ml-1">cost/m</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-tertiary-container text-tertiary-onContainer flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs">
          <span className="text-foreground/70">
            Profit ({results.profitMarginActualPercent.toFixed(1)}%):
          </span>
          <Badge variant="success" className="text-xs">
            +{formatCurrency(results.profitPerMeter, currency, 3)}
          </Badge>
        </div>
      </Card>

      {/* 4. Total Order Volume & Revenue */}
      <Card variant="filled" className="p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Total Order Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {formatCurrency(results.totalOrderValue, currency, 0)}
            </div>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-surface-container-highest text-foreground flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs">
          <span className="text-foreground/70">Net Order Profit:</span>
          <span className="font-bold text-success">
            {formatCurrency(results.totalOrderProfit, currency, 0)}
          </span>
        </div>
      </Card>
    </div>
  );
}
