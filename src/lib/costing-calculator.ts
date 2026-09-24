import { FabricSpecs, YarnRates, WeavingCharges, Commercials, CostingCalculations } from "./types";

/**
 * Industry Standard Textile Greige Fabric Costing Engine
 * Uses ASTM / ISO textile count conversion constants (0.590541 g/m for 1 Ne)
 */
export function calculateGreigeCosting(
  specs: FabricSpecs,
  yarnRates: YarnRates,
  weaving: WeavingCharges,
  commercials: Commercials
): CostingCalculations {
  // 1. Total Ends calculation
  const bodyEnds = Math.round(specs.epi * specs.greigeWidth);
  const totalEnds = bodyEnds + (specs.selvedgeEnds || 0);

  // Effective Yarn Counts (considering ply)
  const effectiveWarpCount = specs.warpCount / (specs.warpPly || 1);
  const effectiveWeftCount = specs.weftCount / (specs.weftPly || 1);

  // 2. Warp Weight in grams per linear meter
  // Formula: (Total Ends * (1 + Warp Crimp / 100) * 0.590541) / Effective Warp Count
  const warpCrimpFactor = 1 + (specs.warpCrimp || 0) / 100;
  const warpWeightGramsPerMeter =
    effectiveWarpCount > 0
      ? (totalEnds * warpCrimpFactor * 0.590541) / effectiveWarpCount
      : 0;

  // 3. Selvedge Ends separate weight (approx included in totalEnds or calculated)
  const selvedgeWeightGramsPerMeter =
    effectiveWarpCount > 0 && specs.selvedgeEnds
      ? (specs.selvedgeEnds * warpCrimpFactor * 0.590541) / effectiveWarpCount
      : 0;

  // 4. Weft Weight in grams per linear meter
  // Length of weft per linear meter = PPI * Reed Space (in) * (1 + Weft Crimp / 100)
  // Weft Weight (g/m) = (PPI * Reed Space * (1 + Weft Crimp / 100) * 0.590541) / Effective Weft Count
  const weftCrimpFactor = 1 + (specs.weftCrimp || 0) / 100;
  const weftWeightGramsPerMeter =
    effectiveWeftCount > 0
      ? (specs.ppi * specs.reedSpace * weftCrimpFactor * 0.590541) / effectiveWeftCount
      : 0;

  // 5. Total Fabric Weights
  const totalGLM = warpWeightGramsPerMeter + weftWeightGramsPerMeter;
  const widthInMeters = (specs.greigeWidth * 2.54) / 100;
  const totalGSM = widthInMeters > 0 ? totalGLM / widthInMeters : 0;
  const ouncesPerSqYard = totalGSM * 0.0294935; // standard conversion: GSM / 33.906

  // 6. Peirce Cover Factor
  const k1 = effectiveWarpCount > 0 ? specs.epi / Math.sqrt(effectiveWarpCount) : 0;
  const k2 = effectiveWeftCount > 0 ? specs.ppi / Math.sqrt(effectiveWeftCount) : 0;
  const greigeCoverFactor = k1 + k2 - (k1 * k2) / 28;

  // 7. Material Costs (per linear meter)
  const warpWastageMultiplier = 1 + (yarnRates.warpWastagePercent || 0) / 100;
  const weftWastageMultiplier = 1 + (yarnRates.weftWastagePercent || 0) / 100;
  const sizingWastageMultiplier = 1 + (yarnRates.sizingWastagePercent || 0) / 100;

  const warpConsumptionKgPerMeter = (warpWeightGramsPerMeter / 1000) * warpWastageMultiplier;
  const weftConsumptionKgPerMeter = (weftWeightGramsPerMeter / 1000) * weftWastageMultiplier;

  const warpYarnCostPerMeter = warpConsumptionKgPerMeter * yarnRates.warpRatePerKg;
  const weftYarnCostPerMeter = weftConsumptionKgPerMeter * yarnRates.weftRatePerKg;
  const totalRawYarnCostPerMeter = warpYarnCostPerMeter + weftYarnCostPerMeter;

  const sizingCostPerMeter =
    (warpWeightGramsPerMeter / 1000) *
    yarnRates.sizingChemicalCostPerKg *
    sizingWastageMultiplier;

  const totalMaterialCostPerMeter = totalRawYarnCostPerMeter + sizingCostPerMeter;

  // 8. Weaving Conversion Cost (per linear meter)
  let directWeavingCostPerMeter = 0;
  if (weaving.chargeMethod === "perPick") {
    directWeavingCostPerMeter = specs.ppi * weaving.ratePerPick;
  } else {
    directWeavingCostPerMeter = weaving.chargePerMeter;
  }

  const overheadsCostPerMeter =
    (weaving.powerCostPerMeter || 0) +
    (weaving.laborCostPerMeter || 0) +
    (weaving.maintenanceCostPerMeter || 0) +
    (weaving.fixedOverheadsPerMeter || 0);

  const inspectionPackingCostPerMeter =
    (weaving.inspectionMendingPerMeter || 0) + (weaving.foldingPackingPerMeter || 0);

  const totalConversionCostPerMeter =
    directWeavingCostPerMeter + overheadsCostPerMeter + inspectionPackingCostPerMeter;

  // 9. Total Ex-Mill Cost & Profitability
  const exMillCostPerMeter = totalMaterialCostPerMeter + totalConversionCostPerMeter;

  let netSellingPricePerMeter = 0;
  let profitPerMeter = 0;

  if (commercials.profitMarginPercent >= 100) {
    netSellingPricePerMeter = exMillCostPerMeter * 2;
    profitPerMeter = netSellingPricePerMeter - exMillCostPerMeter;
  } else {
    netSellingPricePerMeter =
      exMillCostPerMeter / (1 - (commercials.profitMarginPercent || 0) / 100);
    profitPerMeter = netSellingPricePerMeter - exMillCostPerMeter;
  }

  const netSellingPricePerYard = netSellingPricePerMeter * 0.9144;
  const profitMarginActualPercent =
    netSellingPricePerMeter > 0 ? (profitPerMeter / netSellingPricePerMeter) * 100 : 0;

  // 10. Total Order Financials
  const qty = commercials.orderQuantityMeters || 1000;
  const totalOrderValue = netSellingPricePerMeter * qty;
  const totalOrderCost = exMillCostPerMeter * qty;
  const totalOrderProfit = profitPerMeter * qty;

  const totalWarpYarnRequiredKg = warpConsumptionKgPerMeter * qty;
  const totalWeftYarnRequiredKg = weftConsumptionKgPerMeter * qty;
  const totalFabricWeightKg = (totalGLM / 1000) * qty;

  // 11. Loom Production Metrics
  // Daily picks at 24 hours: RPM * Efficiency% * 60 min * 24 hrs
  const effectivePicksPerDay =
    weaving.loomRpm * (weaving.loomEfficiency / 100) * 60 * 24;
  const picksPerMeter = specs.ppi * 39.3701;
  const metersPerLoomPerDay =
    picksPerMeter > 0 ? effectivePicksPerDay / picksPerMeter : 0;

  const daysToCompleteOrderOn10Looms =
    metersPerLoomPerDay > 0 ? qty / (metersPerLoomPerDay * 10) : 0;

  const leadTimeDays = (commercials.deliveryWeeks || 4) * 7;
  const loomsRequiredForLeadTime =
    leadTimeDays > 0 && metersPerLoomPerDay > 0
      ? Math.ceil(qty / (metersPerLoomPerDay * leadTimeDays))
      : 1;

  return {
    totalEnds,
    warpWeightGramsPerMeter,
    weftWeightGramsPerMeter,
    selvedgeWeightGramsPerMeter,
    totalGLM,
    totalGSM,
    ouncesPerSqYard,
    greigeCoverFactor,

    warpYarnCostPerMeter,
    weftYarnCostPerMeter,
    totalRawYarnCostPerMeter,
    sizingCostPerMeter,
    totalMaterialCostPerMeter,

    directWeavingCostPerMeter,
    overheadsCostPerMeter,
    inspectionPackingCostPerMeter,
    totalConversionCostPerMeter,

    exMillCostPerMeter,
    profitPerMeter,
    netSellingPricePerMeter,
    netSellingPricePerYard,
    profitMarginActualPercent,

    totalOrderValue,
    totalOrderCost,
    totalOrderProfit,
    totalWarpYarnRequiredKg,
    totalWeftYarnRequiredKg,
    totalFabricWeightKg,

    metersPerLoomPerDay,
    loomsRequiredForLeadTime,
    daysToCompleteOrderOn10Looms,
  };
}

/**
 * Currency support and conversion rates
 */
export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", rateToUSD: 1.0 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateToUSD: 83.5 },
  { code: "EUR", symbol: "€", name: "Euro", rateToUSD: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rateToUSD: 0.78 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", rateToUSD: 278.0 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", rateToUSD: 119.5 },
] as const;

export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  decimals: number = 3
): string {
  const curr = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  return `${curr.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams.toFixed(1)} g`;
}
