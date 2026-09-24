"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FabricSpecs, YarnRates, WeavingCharges, Commercials, CostingCalculations, CurrencyCode } from "@/lib/types";
import { formatCurrency } from "@/lib/costing-calculator";
import { Printer, Download, CheckCircle, Building2 } from "lucide-react";

interface PrintQuoteModalProps {
  open: boolean;
  onClose: () => void;
  specs: FabricSpecs;
  yarnRates: YarnRates;
  weaving: WeavingCharges;
  commercials: Commercials;
  results: CostingCalculations;
  currency: CurrencyCode;
}

export function PrintQuoteModal({
  open,
  onClose,
  specs,
  yarnRates,
  weaving,
  commercials,
  results,
  currency,
}: PrintQuoteModalProps) {
  const quoteRef = `GQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Greige Fabric Quotation Sheet"
      description="Official mill technical specification and commercial quotation sheet ready for buyer export or printing."
      maxWidth="4xl"
    >
      <div className="space-y-6 pt-2">
        {/* Print / Action Bar */}
        <div className="flex items-center justify-between no-print bg-surface-container p-3 rounded-2xl border border-outline-variant/40">
          <span className="text-xs text-foreground/80 flex items-center gap-1.5 font-medium">
            <CheckCircle className="h-4 w-4 text-success" /> Production & Quality Assurance
            Approved
          </span>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Printable Document Canvas */}
        <div
          id="printable-quote"
          className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-xs font-sans leading-relaxed"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                GT
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  Apex Textile Mills Ltd.
                </h1>
                <p className="text-[11px] text-slate-600">
                  Weaving Division • ISO 9001:2015 & OEKO-TEX Standard 100 Certified
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 rounded text-xs tracking-wider uppercase">
                Official Greige Quotation
              </span>
              <p className="text-[11px] text-slate-700 mt-1 font-semibold">Ref: {quoteRef}</p>
              <p className="text-[11px] text-slate-500">Date: {today}</p>
            </div>
          </div>

          {/* Inquiry & Customer Details */}
          <div className="grid grid-cols-2 gap-6 my-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Buyer / Customer:
              </span>
              <p className="text-sm font-bold text-slate-900">
                {specs.buyerName || "Global Sourcing Partner"}
              </p>
              <p className="text-[11px] text-slate-600">Inquiry Fabric Sourcing Division</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Order Terms:
              </span>
              <p className="text-xs font-bold text-slate-900">
                Quantity: {commercials.orderQuantityMeters.toLocaleString()} Linear Meters
              </p>
              <p className="text-[11px] text-slate-600">Payment: {commercials.paymentTerms}</p>
            </div>
          </div>

          {/* Technical Fabric Specifications Table */}
          <div className="my-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              1. Technical Fabric Construction
            </h2>
            <table className="w-full text-left border-collapse border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <td className="p-2 font-bold w-1/4">Fabric Quality Name</td>
                  <td colSpan={3} className="p-2 font-bold text-slate-900">
                    {specs.qualityName}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-semibold bg-slate-50">Warp Yarn Spec</td>
                  <td className="p-2">
                    {specs.warpCount}s {specs.warpPly > 1 ? `/${specs.warpPly}` : "Single"} (
                    {specs.warpBlend})
                  </td>
                  <td className="p-2 font-semibold bg-slate-50">Weft Yarn Spec</td>
                  <td className="p-2">
                    {specs.weftCount}s {specs.weftPly > 1 ? `/${specs.weftPly}` : "Single"} (
                    {specs.weftBlend})
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-semibold bg-slate-50">Ends x Picks (EPI x PPI)</td>
                  <td className="p-2 font-mono font-bold">
                    {specs.epi} x {specs.ppi} ({specs.epi + specs.ppi} TC)
                  </td>
                  <td className="p-2 font-semibold bg-slate-50">Weave Structure</td>
                  <td className="p-2">{specs.weaveType}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-semibold bg-slate-50">Reed Space / Width</td>
                  <td className="p-2">{specs.reedSpace}&quot; Reed Space</td>
                  <td className="p-2 font-semibold bg-slate-50">Greige Width</td>
                  <td className="p-2 font-bold">{specs.greigeWidth}&quot; Off-Loom</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold bg-slate-50">Finished Width (Expected)</td>
                  <td className="p-2">{specs.finishedWidth}&quot;</td>
                  <td className="p-2 font-semibold bg-slate-50">Total Ends</td>
                  <td className="p-2 font-mono">{results.totalEnds.toLocaleString()} ends</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Physical Weights */}
          <div className="my-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              2. Weight & Density Specifications
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Greige GSM</span>
                <span className="text-sm font-bold text-slate-900">
                  {results.totalGSM.toFixed(1)} g/m²
                </span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Linear Weight (GLM)</span>
                <span className="text-sm font-bold text-slate-900">
                  {results.totalGLM.toFixed(1)} g/m
                </span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Ounces / Sq Yard</span>
                <span className="text-sm font-bold text-slate-900">
                  {results.ouncesPerSqYard.toFixed(2)} oz/yd²
                </span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Cover Factor</span>
                <span className="text-sm font-bold text-slate-900">
                  {results.greigeCoverFactor.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Commercial & Price Breakdown */}
          <div className="my-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              3. Commercial Price Schedule
            </h2>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-[11px]">
                  <th className="p-2">Cost Component</th>
                  <th className="p-2">Basis</th>
                  <th className="p-2 text-right">Cost / Meter ({currency})</th>
                  <th className="p-2 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium">Raw Warp Yarn (incl. wastage)</td>
                  <td className="p-2 text-slate-600 font-mono">
                    {results.warpWeightGramsPerMeter.toFixed(1)}g @ {currency}{" "}
                    {yarnRates.warpRatePerKg}/kg
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {formatCurrency(results.warpYarnCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right text-slate-600">
                    {(
                      (results.warpYarnCostPerMeter / results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Raw Weft Yarn (incl. wastage)</td>
                  <td className="p-2 text-slate-600 font-mono">
                    {results.weftWeightGramsPerMeter.toFixed(1)}g @ {currency}{" "}
                    {yarnRates.weftRatePerKg}/kg
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {formatCurrency(results.weftYarnCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right text-slate-600">
                    {(
                      (results.weftYarnCostPerMeter / results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Sizing Chemicals & Formulations</td>
                  <td className="p-2 text-slate-600">Warp beam preparation</td>
                  <td className="p-2 text-right font-mono">
                    {formatCurrency(results.sizingCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right text-slate-600">
                    {(
                      (results.sizingCostPerMeter / results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Direct Weaving Conversion Charge</td>
                  <td className="p-2 text-slate-600">
                    {weaving.loomType} ({weaving.loomRpm} RPM)
                  </td>
                  <td className="p-2 text-right font-mono">
                    {formatCurrency(results.directWeavingCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right text-slate-600">
                    {(
                      (results.directWeavingCostPerMeter / results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Power, Wages & Overheads</td>
                  <td className="p-2 text-slate-600">Mill factory burden</td>
                  <td className="p-2 text-right font-mono">
                    {formatCurrency(results.overheadsCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right text-slate-600">
                    {(
                      (results.overheadsCostPerMeter / results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">4-Point Inspection, Rolling & Packing</td>
                  <td className="p-2 text-slate-600">Export standard packaging</td>
                  <td className="p-2 text-right font-mono">
                    {formatCurrency(results.inspectionPackingCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right text-slate-600">
                    {(
                      (results.inspectionPackingCostPerMeter /
                        results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2">Total Ex-Mill Cost</td>
                  <td className="p-2">Factory Gate</td>
                  <td className="p-2 text-right font-mono">
                    {formatCurrency(results.exMillCostPerMeter, currency, 3)}
                  </td>
                  <td className="p-2 text-right">
                    {(
                      (results.exMillCostPerMeter / results.netSellingPricePerMeter) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white font-black text-sm">
                  <td className="p-2.5">NET QUOTED SELLING PRICE</td>
                  <td className="p-2.5 text-xs font-normal text-slate-300">
                    Per Meter (Ex-Mill)
                  </td>
                  <td className="p-2.5 text-right font-mono text-base">
                    {formatCurrency(results.netSellingPricePerMeter, currency, 3)} /m
                  </td>
                  <td className="p-2.5 text-right text-xs">
                    {formatCurrency(results.netSellingPricePerYard, currency, 3)} /yd
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms & Signatures */}
          <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 gap-6 text-[10px] text-slate-600">
            <div>
              <span className="font-bold text-slate-900 block mb-1">Standard Mill Terms:</span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Price validity: 7 business days from quotation date due to yarn volatility.</li>
                <li>Delivery: {commercials.deliveryWeeks} weeks from confirmed LC / advance.</li>
                <li>Quantity tolerance: +/- 5% on total woven meters.</li>
                <li>Inspection: 4-Point ASTM D5430 standard grading.</li>
              </ul>
            </div>
            <div className="flex flex-col justify-end items-end space-y-8">
              <div className="w-48 border-b border-slate-400 text-center pb-1 font-bold text-slate-900">
                Authorized Textile Mill Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
