export type CertificationType = "none" | "bci" | "organic" | "gots" | "custom";

export interface RateInputs {
  warpYarnRate: number; // ₹/kg
  weftYarnRate: number; // ₹/kg
  jobRate: number; // paise/pick (e.g. 25) or ₹/meter
  jobRateType: "paisePerPick" | "perMeter"; // default paisePerPick
  sizingRate: number; // ₹/kg of warp yarn (e.g. 24)
  wastagePercent: number; // default 5%
  overheadPercent: number; // default 3%
  marginPercent: number; // default 3%
  bciExtra: number; // optional certification extra ₹/kg
  certificationType?: CertificationType; // "none" | "bci" | "organic" | "gots" | "custom"
  specialWeaveType?: string; // "Plain", "Dobby", "Butta / Jacquard", "Seersucker", "Drop Box", "Airjet"
}

export interface WarpYarnItem {
  id: string;
  name: string; // e.g. "Warp-1 (Ground)", "Warp-2 (Butta / Seer)"
  count: number; // English Cotton Count Ne (e.g. 40, 60, 20)
  ply: number; // 1 or 2
  repeatEnds: number; // ends per repeat or relative ratio (e.g. 1, 3, 24)
  ends?: number; // direct number of ends (optional override)
  endsMode?: "repeat" | "direct"; // whether user entered repeat ratio or direct ends
  rate: number; // ₹/kg
  extraPercent: number; // Extra % (for Lino/Seer/Butta take-up or floating thread, e.g. 20%)
  sizingRate?: number; // optional custom sizing rate per warp
}

export interface WeftYarnItem {
  id: string;
  name: string; // e.g. "Weft-1 (Base)", "Weft-2 (Butta / Lycra)"
  count: number; // English Cotton Count Ne (e.g. 30, 40, 20)
  ply: number; // 1 or 2
  repeatPicks: number; // picks per repeat or relative ratio (e.g. 1)
  ppi?: number; // direct PPI for this weft (optional override)
  picksMode?: "repeat" | "direct"; // whether user entered repeat ratio or direct PPI
  rate: number; // ₹/kg
  isLycra?: boolean;
  extraPercent?: number; // extra % crimp
}

export interface ConstructionInputs {
  width: number; // in inches (e.g. 67)
  epi: number; // Ends Per Inch / Reed (e.g. 132)
  ppi: number; // Picks Per Inch / Pick (e.g. 64)
  warpCount: number; // English Cotton Count Ne (e.g. 40)
  warpPly: number; // 1 for single, 2 for double
  weftCount: number; // English Cotton Count Ne (e.g. 30)
  weftPly: number; // 1 for single, 2 for double
  weaveType?: string; // e.g. "3/1 Twill", "Plain", "Seersucker", "Butta"
  isLycra?: boolean;
  isBci?: boolean;

  // Multi-yarn configuration (when in Multi-Yarn Mode)
  isMultiYarn?: boolean;
  warpYarns?: WarpYarnItem[];
  weftYarns?: WeftYarnItem[];
  seerExtraPercent?: number; // Global Extra % (Lino/Seer/Butta)
}

export interface WarpBreakdownItem {
  id: string;
  name: string;
  countDisplay: string;
  ends: number;
  weightGrams: number;
  rateApplied: number;
  effectiveCount: number;
  extraPercent: number;
  totalGala: number;
  cost: number;
  sizingCost: number;
}

export interface WeftBreakdownItem {
  id: string;
  name: string;
  countDisplay: string;
  picks: number;
  weightGrams: number;
  rateApplied: number;
  effectiveCount: number;
  extraPercent: number;
  totalGala: number;
  cost: number;
}

export interface GreigeCostResult {
  isMultiYarn: boolean;

  // Physical weights
  totalEnds: number;
  reedSpace: number;
  warpWeightGrams: number; // g/meter
  weftWeightGrams: number; // g/meter
  totalGLM: number; // g/meter
  totalGSM: number; // g/m²
  ouncesPerSqYard: number; // oz/yd²
  tareWeightPer100MetersKg: number; // kg per 100 meters

  // Itemized Cost Breakdown (₹ / meter)
  warpCost: number;
  weftCost: number;
  sizingCost: number;
  jobCost: number;
  subtotalDirectCost: number; // Warp + Weft + Sizing + Job
  overhead: number; // Overhead % on direct cost
  totalCost: number; // Direct + Overhead
  margin: number; // Margin % on total cost
  suggestedSellingPrice: number; // Total Cost + Margin
  suggestedSellingPricePerYard: number;

  // Certification Extra details
  certificationExtraPerMeter: number;

  // Itemized yarn breakdown for Multi-Yarn Mode
  warpBreakdown?: WarpBreakdownItem[];
  weftBreakdown?: WeftBreakdownItem[];
}

/**
 * Standard Ichalkaranji Greige Costing Formula Engine
 * Fully supports:
 * - Simple Mode (Single Warp + Single Weft)
 * - Multi-Yarn Mode (Butta, Seer Sucker, +2 Compound, Double Cloth, 2-Ply, Lino)
 * - Individual count, ends, extra % (take-up), and rates per yarn
 * - Sizing on total warp weight
 * - Organic/GOTS/BCI premium
 * - Special weave conversion rates
 */
export function calculateGreigeCost(
  construction: ConstructionInputs,
  rates: RateInputs
): GreigeCostResult {
  const {
    width = 63,
    epi = 132,
    ppi = 64,
    warpCount = 40,
    warpPly = 1,
    weftCount = 30,
    weftPly = 1,
    weaveType = "Plain",
    isLycra = false,
    isMultiYarn = false,
    warpYarns,
    weftYarns,
  } = construction;

  const {
    warpYarnRate = 280,
    weftYarnRate = 260,
    jobRate = 25, // 25 paise per pick
    jobRateType = "paisePerPick",
    sizingRate = 24, // ₹24 / kg warp
    wastagePercent = 5, // default 5%
    overheadPercent = 3, // default 3%
    marginPercent = 3, // default 3%
    bciExtra = 0, // certification extra ₹/kg (BCI / Organic / GOTS)
  } = rates;

  // 1. Total Ends calculation (Standard Ichalkaranji formula)
  // Total Ends = (EPI * Greige Width) + Selvedge Ends (standard 48 ends)
  const selvedgeEnds = 48;
  const bodyEnds = Math.round(epi * width);
  const totalEnds = bodyEnds + selvedgeEnds;

  // Reed Space: Greige Width + Gala contraction (approx 5.5% or 3.5"-4")
  const reedSpace = Math.round(width * 1.055);

  // Base Warp Gala % based on weave
  let baseWarpGala = 6.5;
  const weaveLower = weaveType.toLowerCase();
  if (weaveLower.includes("twill")) baseWarpGala = 8.0;
  else if (weaveLower.includes("satin")) baseWarpGala = 7.5;
  else if (weaveLower.includes("seer")) baseWarpGala = 7.0;
  else if (weaveLower.includes("butta")) baseWarpGala = 7.0;

  if (isLycra) baseWarpGala += 1.5;

  const baseWeftGala = isLycra ? 5.5 : 4.0;
  const wastageMultiplier = 1 + (wastagePercent || 0) / 100;

  let warpWeightGrams = 0;
  let warpCost = 0;
  let warpBreakdown: WarpBreakdownItem[] | undefined = undefined;

  let weftWeightGrams = 0;
  let weftCost = 0;
  let weftBreakdown: WeftBreakdownItem[] | undefined = undefined;

  // -------------------------------------------------------------
  // MULTI-YARN MODE WARP CALCULATION
  // -------------------------------------------------------------
  if (isMultiYarn && warpYarns && warpYarns.length > 0) {
    const totalRepeatEnds = warpYarns.reduce(
      (sum, y) => sum + Math.max(0.01, y.repeatEnds || 1),
      0
    );

    warpBreakdown = warpYarns.map((yarn, idx) => {
      // Calculate ends for this warp
      let ends = 0;
      if (yarn.endsMode === "direct" && yarn.ends && yarn.ends > 0) {
        ends = yarn.ends;
      } else {
        const share = Math.max(0.01, yarn.repeatEnds || 1) / totalRepeatEnds;
        ends = Math.round(totalEnds * share);
      }

      const effCount = Math.max(1, (yarn.count || 40) / (yarn.ply || 1));
      // Extra % (for Lino / Seer / Butta take-up or floating thread)
      const extra = yarn.extraPercent || 0;
      const totalGala = baseWarpGala + extra;
      const galaFactor = 1 + totalGala / 100;

      // Formula: (Ends * (1 + Gala% / 100) * 0.590541) / effCount
      const wtGrams = (ends * galaFactor * 0.590541) / effCount;
      const effectiveRate = (yarn.rate || warpYarnRate) + (bciExtra || 0);
      const cost = (wtGrams / 1000) * effectiveRate * wastageMultiplier;

      // Yarn Sizing
      const yarnSizingRate = yarn.sizingRate !== undefined ? yarn.sizingRate : sizingRate;
      const yarnSizeCost = (wtGrams / 1000) * (yarnSizingRate || 0);

      warpWeightGrams += wtGrams;
      warpCost += cost;

      const plyText = yarn.ply && yarn.ply > 1 ? `${yarn.ply}/` : "";
      return {
        id: yarn.id || `warp-${idx}`,
        name: yarn.name || `Warp-${idx + 1}`,
        countDisplay: `${plyText}${yarn.count}s`,
        ends,
        weightGrams: wtGrams,
        rateApplied: effectiveRate,
        effectiveCount: effCount,
        extraPercent: extra,
        totalGala,
        cost,
        sizingCost: yarnSizeCost,
      };
    });
  } else {
    // SIMPLE MODE: Single Warp
    const effWarpCount = Math.max(1, warpCount / (warpPly || 1));
    const warpGalaFactor = 1 + baseWarpGala / 100;
    warpWeightGrams = (totalEnds * warpGalaFactor * 0.590541) / effWarpCount;
    const effectiveWarpRate = (warpYarnRate || 0) + (bciExtra || 0);
    warpCost = (warpWeightGrams / 1000) * effectiveWarpRate * wastageMultiplier;
  }

  // -------------------------------------------------------------
  // WEFT CALCULATION (Multi-Yarn or Simple)
  // -------------------------------------------------------------
  if (isMultiYarn && weftYarns && weftYarns.length > 0) {
    const totalRepeatPicks = weftYarns.reduce(
      (sum, y) => sum + Math.max(0.01, y.repeatPicks || 1),
      0
    );

    weftBreakdown = weftYarns.map((yarn, idx) => {
      // Calculate picks for this weft
      let picks = 0;
      if (yarn.picksMode === "direct" && yarn.ppi && yarn.ppi > 0) {
        picks = yarn.ppi;
      } else {
        const share = Math.max(0.01, yarn.repeatPicks || 1) / totalRepeatPicks;
        picks = Math.round(ppi * share * 10) / 10;
      }

      const effCount = Math.max(1, (yarn.count || 30) / (yarn.ply || 1));
      const extra = yarn.extraPercent || 0;
      const yarnGala = (yarn.isLycra ? 5.5 : 4.0) + extra;
      const galaFactor = 1 + yarnGala / 100;

      // Formula: (Picks * Reed Space * (1 + Gala% / 100) * 0.590541) / effCount
      const wtGrams = (picks * reedSpace * galaFactor * 0.590541) / effCount;
      const effectiveRate = (yarn.rate || weftYarnRate) + (bciExtra || 0);
      const cost = (wtGrams / 1000) * effectiveRate * wastageMultiplier;

      weftWeightGrams += wtGrams;
      weftCost += cost;

      const plyText = yarn.ply && yarn.ply > 1 ? `${yarn.ply}/` : "";
      const lycraText = yarn.isLycra ? " + Lycra" : "";
      return {
        id: yarn.id || `weft-${idx}`,
        name: yarn.name || `Weft-${idx + 1}`,
        countDisplay: `${plyText}${yarn.count}s${lycraText}`,
        picks,
        weightGrams: wtGrams,
        rateApplied: effectiveRate,
        effectiveCount: effCount,
        extraPercent: extra,
        totalGala: yarnGala,
        cost,
      };
    });
  } else {
    // SIMPLE MODE: Single Weft
    const effWeftCount = Math.max(1, weftCount / (weftPly || 1));
    const weftGalaFactor = 1 + baseWeftGala / 100;
    weftWeightGrams = (ppi * reedSpace * weftGalaFactor * 0.590541) / effWeftCount;
    const effectiveWeftRate = (weftYarnRate || 0) + (bciExtra || 0);
    weftCost = (weftWeightGrams / 1000) * effectiveWeftRate * wastageMultiplier;
  }

  // -------------------------------------------------------------
  // SIZING COST (On Total Warp Weight)
  // Standard Ichalkaranji rule: Sizing is charged on total warp yarn weight
  // -------------------------------------------------------------
  const sizingCost = (warpWeightGrams / 1000) * (sizingRate || 0);

  // -------------------------------------------------------------
  // FABRIC WEIGHTS
  // -------------------------------------------------------------
  const totalGLM = warpWeightGrams + weftWeightGrams;
  const widthInMeters = (width * 2.54) / 100;
  const totalGSM = widthInMeters > 0 ? totalGLM / widthInMeters : 0;
  const ouncesPerSqYard = totalGSM * 0.0294935;
  const tareWeightPer100MetersKg = totalGLM / 10;

  // -------------------------------------------------------------
  // JOB COST (Weaving Conversion)
  // -------------------------------------------------------------
  let jobCost = 0;
  if (jobRateType === "paisePerPick") {
    jobCost = (ppi * (jobRate || 0)) / 100;
  } else {
    jobCost = jobRate || 0;
  }

  // -------------------------------------------------------------
  // DIRECT SUBTOTAL
  // -------------------------------------------------------------
  const subtotalDirectCost = warpCost + weftCost + sizingCost + jobCost;

  // Certification extra per meter contribution
  const certificationExtraPerMeter =
    ((warpWeightGrams + weftWeightGrams) / 1000) * (bciExtra || 0) * wastageMultiplier;

  // Overhead (% on direct cost)
  const overhead = subtotalDirectCost * ((overheadPercent || 0) / 100);

  // Total Cost
  const totalCost = subtotalDirectCost + overhead;

  // Margin (% on total cost)
  const margin = totalCost * ((marginPercent || 0) / 100);

  // Suggested Selling Price
  const suggestedSellingPrice = totalCost + margin;
  const suggestedSellingPricePerYard = suggestedSellingPrice * 0.9144;

  return {
    isMultiYarn: !!isMultiYarn,
    totalEnds,
    reedSpace,
    warpWeightGrams,
    weftWeightGrams,
    totalGLM,
    totalGSM,
    ouncesPerSqYard,
    tareWeightPer100MetersKg,

    warpCost,
    weftCost,
    sizingCost,
    jobCost,
    subtotalDirectCost,
    overhead,
    totalCost,
    margin,
    suggestedSellingPrice,
    suggestedSellingPricePerYard,
    certificationExtraPerMeter,

    warpBreakdown,
    weftBreakdown,
  };
}

export function formatINR(val: number, decimals: number = 2): string {
  return `₹${val.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
