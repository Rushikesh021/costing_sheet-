"use client";

import * as React from "react";
import { WeavingCharges, LoomType, CurrencyCode } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/costing-calculator";
import { Gauge, Factory, Activity } from "lucide-react";

interface WeavingChargesFormProps {
  weaving: WeavingCharges;
  onChange: (updated: Partial<WeavingCharges>) => void;
  currency: CurrencyCode;
  metersPerDay: number;
  totalConversionM: number;
}

const LOOM_TYPES: { type: LoomType; defaultRpm: number; defaultEff: number }[] = [
  { type: "Airjet", defaultRpm: 800, defaultEff: 90 },
  { type: "Rapier", defaultRpm: 520, defaultEff: 88 },
  { type: "Projectile (Sulzer)", defaultRpm: 420, defaultEff: 86 },
  { type: "Waterjet", defaultRpm: 900, defaultEff: 92 },
  { type: "Shuttleless Auto", defaultRpm: 320, defaultEff: 82 },
  { type: "Powerloom", defaultRpm: 180, defaultEff: 75 },
];

export function WeavingChargesForm({
  weaving,
  onChange,
  currency,
  metersPerDay,
  totalConversionM,
}: WeavingChargesFormProps) {
  const handleLoomTypeChange = (loom: LoomType) => {
    const config = LOOM_TYPES.find((l) => l.type === loom);
    onChange({
      loomType: loom,
      loomRpm: config ? config.defaultRpm : weaving.loomRpm,
      loomEfficiency: config ? config.defaultEff : weaving.loomEfficiency,
    });
  };

  return (
    <Card variant="filled" className="space-y-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            <Factory className="h-5 w-5 text-primary" />
            Weaving Machinery & Conversion Charges
          </CardTitle>
          <CardDescription>
            Configure loom machine speed, efficiency, pick conversion rates, and mill operating overheads.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="tertiary" className="text-xs font-mono">
            Conversion: {formatCurrency(totalConversionM, currency)}/m
          </Badge>
          <Badge variant="default" className="text-xs font-mono hidden sm:inline-flex">
            Loom Speed: {metersPerDay.toFixed(1)} m/day
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Loom Specs */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> Loom Machine Parameters
            </h4>
            <span className="text-[11px] text-foreground/60">
              Output: ~{metersPerDay.toFixed(0)} meters / 24 hrs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Loom Type"
              value={weaving.loomType}
              onChange={(e) => handleLoomTypeChange(e.target.value as LoomType)}
              options={LOOM_TYPES.map((l) => ({ label: l.type, value: l.type }))}
            />
            <Input
              label="Loom Speed (RPM)"
              type="number"
              step="10"
              min="100"
              max="1500"
              value={weaving.loomRpm || ""}
              onChange={(e) => onChange({ loomRpm: parseInt(e.target.value) || 0 })}
              suffix="RPM"
            />
            <Input
              label="Loom Efficiency (%)"
              type="number"
              step="1"
              min="10"
              max="99"
              value={weaving.loomEfficiency || ""}
              onChange={(e) =>
                onChange({ loomEfficiency: parseFloat(e.target.value) || 0 })
              }
              suffix="%"
            />
          </div>
        </div>

        {/* Weaving Charge Calculation Method */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Weaving Rate Formulation
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ chargeMethod: "perPick" })}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  weaving.chargeMethod === "perPick"
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "bg-surface-container text-foreground/70 hover:text-foreground"
                }`}
              >
                Per Pick Rate
              </button>
              <button
                type="button"
                onClick={() => onChange({ chargeMethod: "perMeter" })}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  weaving.chargeMethod === "perMeter"
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "bg-surface-container text-foreground/70 hover:text-foreground"
                }`}
              >
                Direct Per Meter
              </button>
            </div>
          </div>

          {weaving.chargeMethod === "perPick" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={`Rate per Pick/inch (${currency})`}
                type="number"
                step="0.0005"
                min="0"
                value={weaving.ratePerPick || ""}
                onChange={(e) =>
                  onChange({ ratePerPick: parseFloat(e.target.value) || 0 })
                }
                prefix={currency}
                helperText="Formula: Rate/Pick * PPI = Direct Weaving Cost"
              />
              <div className="p-3 rounded-xl bg-surface-container flex flex-col justify-center">
                <span className="text-[11px] text-foreground/60 font-medium">
                  Direct Weaving Cost:
                </span>
                <span className="text-base font-bold text-secondary">
                  {formatCurrency((weaving.ratePerPick || 0) * 100, currency, 3)} / 100 picks
                </span>
              </div>
            </div>
          ) : (
            <Input
              label={`Direct Weaving Charge per Meter (${currency})`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.chargePerMeter || ""}
              onChange={(e) =>
                onChange({ chargePerMeter: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
              suffix="/m"
            />
          )}
        </div>

        {/* Operating Overheads Breakdown */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-tertiary">
            Mill Operating Overheads & Finishing / Packing
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input
              label={`Power & Fuel (${currency}/m)`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.powerCostPerMeter || ""}
              onChange={(e) =>
                onChange({ powerCostPerMeter: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
            />
            <Input
              label={`Direct Wages / Labor (${currency}/m)`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.laborCostPerMeter || ""}
              onChange={(e) =>
                onChange({ laborCostPerMeter: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
            />
            <Input
              label={`Maintenance & Spares (${currency}/m)`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.maintenanceCostPerMeter || ""}
              onChange={(e) =>
                onChange({ maintenanceCostPerMeter: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
            />
            <Input
              label={`Fixed Factory Overheads (${currency}/m)`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.fixedOverheadsPerMeter || ""}
              onChange={(e) =>
                onChange({ fixedOverheadsPerMeter: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
            />
            <Input
              label={`Greige Inspection & Mending (${currency}/m)`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.inspectionMendingPerMeter || ""}
              onChange={(e) =>
                onChange({
                  inspectionMendingPerMeter: parseFloat(e.target.value) || 0,
                })
              }
              prefix={currency}
            />
            <Input
              label={`Rolling & Polythene Packing (${currency}/m)`}
              type="number"
              step="0.01"
              min="0"
              value={weaving.foldingPackingPerMeter || ""}
              onChange={(e) =>
                onChange({ foldingPackingPerMeter: parseFloat(e.target.value) || 0 })
              }
              prefix={currency}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
