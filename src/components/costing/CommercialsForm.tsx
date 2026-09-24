"use client";

import * as React from "react";
import { Commercials, CurrencyCode } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/costing-calculator";
import { DollarSign, Briefcase, Calendar, CheckCircle2 } from "lucide-react";

interface CommercialsFormProps {
  commercials: Commercials;
  onChange: (updated: Partial<Commercials>) => void;
  currency: CurrencyCode;
  totalOrderProfit: number;
  totalOrderValue: number;
  loomsRequired: number;
  daysToCompleteOn10Looms: number;
}

export function CommercialsForm({
  commercials,
  onChange,
  currency,
  totalOrderProfit,
  totalOrderValue,
  loomsRequired,
  daysToCompleteOn10Looms,
}: CommercialsFormProps) {
  return (
    <Card variant="filled" className="space-y-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
            Commercial Terms & Order Scheduling
          </CardTitle>
          <CardDescription>
            Target profit margins, order volume, payment terms, and delivery production planning.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs font-mono">
            Net Profit: {formatCurrency(totalOrderProfit, currency, 0)}
          </Badge>
          <Badge variant="default" className="text-xs font-mono hidden sm:inline-flex">
            Order: {formatCurrency(totalOrderValue, currency, 0)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Profit Margin & Volume
            </h4>

            <Input
              label="Order Quantity (Linear Meters)"
              type="number"
              step="1000"
              min="100"
              value={commercials.orderQuantityMeters || ""}
              onChange={(e) =>
                onChange({
                  orderQuantityMeters: parseFloat(e.target.value) || 0,
                })
              }
              suffix="meters"
            />

            <Input
              label="Desired Profit Margin (%)"
              type="number"
              step="0.5"
              min="0"
              max="60"
              value={commercials.profitMarginPercent || ""}
              onChange={(e) =>
                onChange({
                  profitMarginPercent: parseFloat(e.target.value) || 0,
                })
              }
              suffix="%"
              helperText="Markup over Ex-Mill Cost"
            />

            <Input
              label={`Target Buyer Price (${currency}/m) [Optional]`}
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1.85"
              value={commercials.targetPricePerMeter || ""}
              onChange={(e) =>
                onChange({
                  targetPricePerMeter: parseFloat(e.target.value) || undefined,
                })
              }
              prefix={currency}
              suffix="/m"
              helperText="Benchmark price provided by buyer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Payment & Mill Lead Time
            </h4>

            <Input
              label="Payment Terms"
              placeholder="e.g. LC at sight 60 Days, TT 30% advance"
              value={commercials.paymentTerms}
              onChange={(e) => onChange({ paymentTerms: e.target.value })}
            />

            <Input
              label="Delivery Lead Time (Weeks)"
              type="number"
              step="1"
              min="1"
              max="24"
              value={commercials.deliveryWeeks || ""}
              onChange={(e) =>
                onChange({ deliveryWeeks: parseInt(e.target.value) || 1 })
              }
              suffix="weeks"
            />

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 space-y-1 text-xs">
              <div className="flex items-center justify-between text-foreground/80">
                <span>Production on 10 Looms:</span>
                <span className="font-semibold text-primary">
                  {daysToCompleteOn10Looms.toFixed(1)} days
                </span>
              </div>
              <div className="flex items-center justify-between text-foreground/80">
                <span>Looms to ship within {commercials.deliveryWeeks} weeks:</span>
                <span className="font-semibold text-secondary">
                  {loomsRequired} loom{loomsRequired > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Card */}
        <div className="p-4 rounded-2xl bg-success-container/40 border border-success/30 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground">Production Feasibility Confirmed:</span>{" "}
            Order of {commercials.orderQuantityMeters.toLocaleString()} meters can be woven across{" "}
            <strong>{loomsRequired} looms</strong> comfortably within the{" "}
            <strong>{commercials.deliveryWeeks} weeks</strong> commitment period.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
