"use client";

import * as React from "react";
import { FabricSpecs, WeaveType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid, Sparkles, SlidersHorizontal } from "lucide-react";

interface FabricSpecsFormProps {
  specs: FabricSpecs;
  onChange: (updated: Partial<FabricSpecs>) => void;
  calculatedEnds: number;
  coverFactor: number;
}

const WEAVE_TYPES: WeaveType[] = [
  "Plain (1/1)",
  "Twill (2/1)",
  "Twill (3/1)",
  "Twill (2/2)",
  "Satin (4/1)",
  "Sateen (1/4)",
  "Dobby",
  "Jacquard",
  "Oxford",
  "Canvas",
  "Ripstop",
];

export function FabricSpecsForm({
  specs,
  onChange,
  calculatedEnds,
  coverFactor,
}: FabricSpecsFormProps) {
  return (
    <Card variant="filled" className="space-y-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>
            <Grid className="h-5 w-5 text-primary" />
            Fabric Construction & Specifications
          </CardTitle>
          <CardDescription>
            Enter yarn count, ends/picks per inch, widths, crimp and weave pattern.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-mono">
            Ends: {calculatedEnds.toLocaleString()}
          </Badge>
          <Badge variant="tertiary" className="text-xs font-mono">
            Cover Factor: {coverFactor.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quality Name & Buyer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quality Name / Construction Code"
            placeholder="e.g. Cotton Poplin 40x40 133x72"
            value={specs.qualityName}
            onChange={(e) => onChange({ qualityName: e.target.value })}
          />
          <Input
            label="Buyer / Customer Name"
            placeholder="e.g. Marks & Spencer, Zara, Retail Client"
            value={specs.buyerName}
            onChange={(e) => onChange({ buyerName: e.target.value })}
          />
        </div>

        {/* Warp Specifications Block */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Warp Yarn (Lengthwise)
            </h4>
            <span className="text-[11px] text-foreground/60">
              EPI: {specs.epi} | Count: {specs.warpCount}s {specs.warpPly > 1 ? `/${specs.warpPly}` : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Warp Count (Ne)"
              type="number"
              step="any"
              min="1"
              value={specs.warpCount || ""}
              onChange={(e) => onChange({ warpCount: parseFloat(e.target.value) || 0 })}
              suffix="Ne"
            />
            <Select
              label="Warp Ply"
              value={specs.warpPly}
              onChange={(e) => onChange({ warpPly: parseInt(e.target.value) || 1 })}
              options={[
                { label: "1 (Single)", value: 1 },
                { label: "2 (Double)", value: 2 },
                { label: "3 (Triple)", value: 3 },
              ]}
            />
            <Input
              label="Warp Ends / Inch (EPI)"
              type="number"
              step="any"
              min="1"
              value={specs.epi || ""}
              onChange={(e) => onChange({ epi: parseFloat(e.target.value) || 0 })}
              suffix="EPI"
            />
            <Input
              label="Warp Crimp (%)"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={specs.warpCrimp || ""}
              onChange={(e) => onChange({ warpCrimp: parseFloat(e.target.value) || 0 })}
              suffix="%"
              helperText="Take-up shrinkage in weaving"
            />
          </div>

          <Input
            label="Warp Yarn Composition / Blend"
            placeholder="e.g. 100% Combed Compact Cotton, Giza 86"
            value={specs.warpBlend}
            onChange={(e) => onChange({ warpBlend: e.target.value })}
          />
        </div>

        {/* Weft Specifications Block */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Weft Yarn (Widthwise)
            </h4>
            <span className="text-[11px] text-foreground/60">
              PPI: {specs.ppi} | Count: {specs.weftCount}s {specs.weftPly > 1 ? `/${specs.weftPly}` : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Weft Count (Ne)"
              type="number"
              step="any"
              min="1"
              value={specs.weftCount || ""}
              onChange={(e) => onChange({ weftCount: parseFloat(e.target.value) || 0 })}
              suffix="Ne"
            />
            <Select
              label="Weft Ply"
              value={specs.weftPly}
              onChange={(e) => onChange({ weftPly: parseInt(e.target.value) || 1 })}
              options={[
                { label: "1 (Single)", value: 1 },
                { label: "2 (Double)", value: 2 },
                { label: "3 (Triple)", value: 3 },
              ]}
            />
            <Input
              label="Picks / Inch (PPI)"
              type="number"
              step="any"
              min="1"
              value={specs.ppi || ""}
              onChange={(e) => onChange({ ppi: parseFloat(e.target.value) || 0 })}
              suffix="PPI"
            />
            <Input
              label="Weft Crimp (%)"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={specs.weftCrimp || ""}
              onChange={(e) => onChange({ weftCrimp: parseFloat(e.target.value) || 0 })}
              suffix="%"
              helperText="Widthwise contraction"
            />
          </div>

          <Input
            label="Weft Yarn Composition / Blend"
            placeholder="e.g. 100% Carded Ring Spun Cotton, Modal Blend"
            value={specs.weftBlend}
            onChange={(e) => onChange({ weftBlend: e.target.value })}
          />
        </div>

        {/* Fabric Dimensions & Weave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Reed Space (Loom Width)"
            type="number"
            step="0.5"
            value={specs.reedSpace || ""}
            onChange={(e) => onChange({ reedSpace: parseFloat(e.target.value) || 0 })}
            suffix="in"
          />
          <Input
            label="Greige Width (Off-Loom)"
            type="number"
            step="0.5"
            value={specs.greigeWidth || ""}
            onChange={(e) => onChange({ greigeWidth: parseFloat(e.target.value) || 0 })}
            suffix="in"
          />
          <Input
            label="Finished Width (Expected)"
            type="number"
            step="0.5"
            value={specs.finishedWidth || ""}
            onChange={(e) => onChange({ finishedWidth: parseFloat(e.target.value) || 0 })}
            suffix="in"
          />
          <Input
            label="Selvedge Ends (Both sides)"
            type="number"
            step="1"
            value={specs.selvedgeEnds || ""}
            onChange={(e) => onChange({ selvedgeEnds: parseInt(e.target.value) || 0 })}
            suffix="ends"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <Select
            label="Weave Structure / Pattern"
            value={specs.weaveType}
            onChange={(e) => onChange({ weaveType: e.target.value as WeaveType })}
            options={WEAVE_TYPES.map((w) => ({ label: w, value: w }))}
          />
          <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between text-xs text-foreground/80 border border-outline-variant/30">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Greige Density Factor
            </span>
            <span className="font-semibold text-primary">
              {specs.epi} x {specs.ppi} ({specs.epi + specs.ppi} Thread Count)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
