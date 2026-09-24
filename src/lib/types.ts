export type WeaveType =
  | "Plain (1/1)"
  | "Twill (2/1)"
  | "Twill (3/1)"
  | "Twill (2/2)"
  | "Satin (4/1)"
  | "Sateen (1/4)"
  | "Dobby"
  | "Jacquard"
  | "Oxford"
  | "Canvas"
  | "Ripstop";

export type LoomType =
  | "Airjet"
  | "Rapier"
  | "Projectile (Sulzer)"
  | "Waterjet"
  | "Shuttleless Auto"
  | "Powerloom";

export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP" | "PKR" | "BDT";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // e.g. 1 USD = 83.5 INR, 0.92 EUR
}

export interface FabricSpecs {
  qualityName: string;
  buyerName: string;
  warpCount: number; // Ne (e.g. 40)
  warpPly: number; // 1 for single, 2 for 2-ply
  warpBlend: string; // e.g. "100% Combed Cotton", "PC 65/35"
  weftCount: number; // Ne (e.g. 40)
  weftPly: number;
  weftBlend: string;
  epi: number; // Ends per Inch (e.g. 133)
  ppi: number; // Picks per Inch (e.g. 72)
  reedSpace: number; // Inches (e.g. 67)
  greigeWidth: number; // Inches (e.g. 63)
  finishedWidth: number; // Inches (e.g. 58)
  warpCrimp: number; // % (e.g. 6.5)
  weftCrimp: number; // % (e.g. 4.0)
  selvedgeEnds: number; // Total selvedge ends (e.g. 48)
  weaveType: WeaveType;
}

export interface YarnRates {
  warpRatePerKg: number; // In selected currency per kg
  weftRatePerKg: number; // In selected currency per kg
  warpWastagePercent: number; // % (e.g. 2.0%)
  weftWastagePercent: number; // % (e.g. 3.0%)
  sizingChemicalCostPerKg: number; // Cost of size mixture per kg of warp yarn
  sizingWastagePercent: number; // % (e.g. 1.0%)
}

export interface WeavingCharges {
  loomType: LoomType;
  loomRpm: number; // e.g. 750 RPM for Airjet, 450 for Rapier
  loomEfficiency: number; // % e.g. 88%
  chargeMethod: "perPick" | "perMeter";
  ratePerPick: number; // e.g. 0.18 or 0.22 per pick/inch per meter
  chargePerMeter: number; // direct conversion cost per meter
  powerCostPerMeter: number;
  laborCostPerMeter: number;
  maintenanceCostPerMeter: number;
  fixedOverheadsPerMeter: number;
  inspectionMendingPerMeter: number;
  foldingPackingPerMeter: number;
}

export interface Commercials {
  profitMarginPercent: number; // % e.g. 12%
  orderQuantityMeters: number; // e.g. 25,000 meters
  currency: CurrencyCode;
  paymentTerms: string; // e.g. "LC at sight", "30 Days Net"
  deliveryWeeks: number;
  targetPricePerMeter?: number; // Optional buyer benchmark
}

export interface CostingCalculations {
  // Fabric Construction & Weights
  totalEnds: number;
  warpWeightGramsPerMeter: number; // grams per linear meter
  weftWeightGramsPerMeter: number;
  selvedgeWeightGramsPerMeter: number;
  totalGLM: number; // Grams per Linear Meter
  totalGSM: number; // Grams per Square Meter
  ouncesPerSqYard: number; // oz/yd²
  greigeCoverFactor: number;

  // Material Costs per Linear Meter
  warpYarnCostPerMeter: number;
  weftYarnCostPerMeter: number;
  totalRawYarnCostPerMeter: number;
  sizingCostPerMeter: number;
  totalMaterialCostPerMeter: number;

  // Weaving & Conversion Cost per Linear Meter
  directWeavingCostPerMeter: number;
  overheadsCostPerMeter: number;
  inspectionPackingCostPerMeter: number;
  totalConversionCostPerMeter: number;

  // Totals & Profitability
  exMillCostPerMeter: number;
  profitPerMeter: number;
  netSellingPricePerMeter: number;
  netSellingPricePerYard: number;
  profitMarginActualPercent: number;

  // Total Order Financials
  totalOrderValue: number;
  totalOrderCost: number;
  totalOrderProfit: number;
  totalWarpYarnRequiredKg: number;
  totalWeftYarnRequiredKg: number;
  totalFabricWeightKg: number;

  // Loom Production Metrics
  metersPerLoomPerDay: number;
  loomsRequiredForLeadTime: number;
  daysToCompleteOrderOn10Looms: number;
}

export interface SavedCostingSheet {
  id: string;
  title: string;
  referenceNumber: string;
  date: string;
  status: "Draft" | "Reviewed" | "Quoted" | "Confirmed";
  specs: FabricSpecs;
  yarnRates: YarnRates;
  weavingCharges: WeavingCharges;
  commercials: Commercials;
  results: CostingCalculations;
  notes?: string;
}
