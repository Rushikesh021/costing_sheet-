import { WarpYarnItem, WeftYarnItem } from "./ichalkaranji-calculator";

export interface ParsedConstruction {
  rawText: string;
  width: number; // in inches (e.g. 67, 58, 63)
  reedSpace: number; // in inches
  warpCount: number; // numeric Ne
  warpPly: number;
  warpCountDisplay: string; // e.g. "40s", "2/40s", "40+2/40"
  warpType: string;

  weftCount: number; // numeric Ne
  weftPly: number;
  weftCountDisplay: string; // e.g. "30s", "40s Lycra"
  weftType: string;

  epi: number; // Ends Per Inch / Reed
  ppi: number; // Picks Per Inch / Pick

  weaveType: string;

  // Smart Detection Attributes
  isMultiYarn: boolean;
  isLycra: boolean;
  isButta: boolean;
  isSeersucker: boolean;
  isLinoDobby: boolean;
  isDoubleCloth: boolean;
  isSlub: boolean;
  isPC: boolean;
  isCompoundWarp: boolean;
  isBci: boolean;

  // Mode and Badges
  detectedMode: "simple" | "multi";
  modeLabel: string;
  badgeText: string;
  badgeVariant: "primary" | "secondary" | "tertiary" | "outline" | "success";

  // Pre-configured yarn rows for the Multi-Yarn Tables
  suggestedWarpYarns: WarpYarnItem[];
  suggestedWeftYarns: WeftYarnItem[];

  quantity: number | null; // in meters
  colorGreige: string;

  confidence: {
    width: boolean;
    counts: boolean;
    density: boolean;
    weave: boolean;
  };
}

/**
 * Smart Textile Construction Parser & Mode Detector
 * Matches real Ichalkaranji market inquiry styles:
 * - Normal plain/twill/satin -> Simple Mode
 * - Contains "+2", "butta", "40+2", "60+2", "SR Butta" -> Multi-Yarn Butta Mode
 * - Contains "seer", "sucker", "seersucker" -> Multi-Yarn Seer Mode
 * - Contains "lino", "dobby" -> Multi-Yarn Lino/Dobby Mode
 * - Contains "lycra", "spandex" -> Lycra Stretch Mode
 * - Contains "slub" -> Slub Yarn Mode
 * - Contains "P/C", "poly", "polyester" -> Blended P/C Mode
 */
export function parseConstructionText(input: string): ParsedConstruction {
  const text = input.trim();

  // 1. Detect Keywords
  const hasPlus2 = /(?:\+2|\b\d+\+2)/i.test(text);
  const hasSeersucker = /\b(seer|sucker|seersucker)\b/i.test(text);
  const hasButta =
    hasPlus2 ||
    /\b(butta|boota|bota|sr\s*butta|extra\s*warp|extra\s*weft)\b/i.test(text);
  const hasLinoDobby = /\b(lino|leno|dobby)\b/i.test(text);
  const hasDouble = /\b(double|gauze|double\s*cloth)\b/i.test(text);
  const hasMulti = /\b(multi|compound)\b/i.test(text);
  const hasTwoPly = /\b2\/40\b|\b2\/60\b|\b2\/\d{1,3}\b/i.test(text);
  const hasSlub = /\b(slub)\b/i.test(text);
  const hasPC = /\b(p\/c|poly|polyester|pv|p\/v)\b/i.test(text);
  const isLycra = /\b(lycra|spandex|elastane)\b/i.test(text) || /\b\d+d\b/i.test(text);
  const isBci = /bci|better\s*cotton|organic|gots/i.test(text);

  const isMultiYarn =
    hasButta ||
    hasSeersucker ||
    hasLinoDobby ||
    hasDouble ||
    hasMulti ||
    hasTwoPly;

  // 2. Detect Weave Type
  let weaveType = "Plain (1/1)";
  if (hasSeersucker) {
    weaveType = "Seersucker";
  } else if (hasButta) {
    weaveType = "Butta / Extra Warp";
  } else if (hasLinoDobby) {
    weaveType = "Lino / Dobby";
  } else if (/3\/1\s*twill|3\/1/i.test(text)) {
    weaveType = "3/1 Twill";
  } else if (/2\/1\s*twill|2\/1|drill/i.test(text)) {
    weaveType = "2/1 Twill";
  } else if (/2\/2\s*twill|2\/2/i.test(text)) {
    weaveType = "2/2 Twill";
  } else if (/twill/i.test(text)) {
    weaveType = "Twill";
  } else if (/double\s*gauze/i.test(text)) {
    weaveType = "Double Gauze";
  } else if (/satin|sateen/i.test(text)) {
    weaveType = "Satin (4/1)";
  }

  // 3. Detect Width
  let width = 63; // standard default
  let widthFound = false;

  const widthQuoteMatch = text.match(/(\d{2,3}(?:\.\d+)?)\s*(?:\"|''|inch(?:es)?|in\b)/i);
  if (widthQuoteMatch) {
    width = parseFloat(widthQuoteMatch[1]);
    widthFound = true;
  } else {
    const commonWidths = [120, 114, 110, 108, 96, 72, 68, 67, 66, 63, 60, 58, 56, 54, 50, 48, 44];
    for (const w of commonWidths) {
      if (new RegExp(`\\b${w}\\b`, "i").test(text)) {
        width = w;
        widthFound = true;
        break;
      }
    }
  }

  // 4. Detect Quantity
  let quantity: number | null = null;
  const qtyMatch = text.match(/(\d[\d,\.]*)\s*(?:mtrs?|mts?|meters?|m\b)/i);
  if (qtyMatch) {
    const rawQty = qtyMatch[1].replace(/,/g, "");
    const parsed = parseFloat(rawQty);
    if (!isNaN(parsed) && parsed > 50) {
      quantity = parsed;
    }
  }

  // 5. Detect AxB patterns (Counts & Density)
  // Supports patterns like: 60+2/60 x 60, 60+2 x 60, 45 P/C x 45 P/C, 40s slub x 40s, 40x30, 132*64
  const pairRegex =
    /(?:^|[\s\/,])(\d{1,3}(?:\/\d+)?(?:\+\d+(?:\/\d+)?)?)\s*(?:s|p\/c|poly|slub|cotton)?\s*(?:[xX\*]|\/)\s*(\d{1,3}(?:\/\d+)?(?:\s*\+\s*\d+d)?)(?=[\s\/,"]|$)/gi;
  const allPairs = Array.from(text.matchAll(pairRegex));

  let warpCount = 40;
  let warpPly = 1;
  let warpCountDisplay = "40s";
  let weftCount = 40;
  let weftPly = 1;
  let weftCountDisplay = "40s";
  let countsFound = false;

  let epi = 132;
  let ppi = 72;
  let densityFound = false;

  if (allPairs.length >= 2) {
    const p1 = allPairs[0];
    const rawWarp = p1[1].trim();
    const rawWeft = p1[2].trim();

    if (rawWarp.includes("2/")) {
      warpPly = 2;
      warpCount = parseFloat(rawWarp.replace(/2\//, "")) || 40;
    } else {
      warpCount = parseFloat(rawWarp.replace(/\D/g, "")) || 40;
    }
    warpCountDisplay = `${rawWarp}s`;

    if (rawWeft.includes("2/")) {
      weftPly = 2;
      weftCount = parseFloat(rawWeft.replace(/2\//, "")) || 40;
    } else {
      weftCount = parseFloat(rawWeft.match(/(\d+)/)?.[1] || "40");
    }
    weftCountDisplay = `${rawWeft}s`;
    countsFound = true;

    const p2 = allPairs[1];
    epi = parseInt(p2[1].replace(/\D/g, ""), 10) || 132;
    ppi = parseInt(p2[2].replace(/\D/g, ""), 10) || 72;
    densityFound = true;
  } else if (allPairs.length === 1) {
    const p = allPairs[0];
    const v1 = parseInt(p[1].replace(/\D/g, ""), 10);
    const v2 = parseInt(p[2].replace(/\D/g, ""), 10);

    if (v1 > 70 || (v1 >= 50 && v2 >= 40 && !text.includes("s"))) {
      epi = v1;
      ppi = v2;
      densityFound = true;
    } else {
      warpCount = v1;
      weftCount = v2;
      warpCountDisplay = `${v1}s`;
      weftCountDisplay = `${v2}s`;
      countsFound = true;
    }
  } else {
    const singleCounts = text.match(/\b(\d{1,2})s\b/gi);
    if (singleCounts && singleCounts.length >= 2) {
      warpCount = parseInt(singleCounts[0], 10);
      weftCount = parseInt(singleCounts[1], 10);
      warpCountDisplay = `${warpCount}s`;
      weftCountDisplay = `${weftCount}s`;
      countsFound = true;
    }
  }

  // Check if explicit extra count is given (e.g. "(20s extra)", "20s butta")
  const extraCountMatch =
    text.match(/(\d{1,3})\s*(?:s|count)?\s*(?:extra|figuring|butta|accent)/i) ||
    text.match(/(?:extra|figuring|butta|accent)\s*(\d{1,3})\s*(?:s|count)?/i);
  let explicitExtraCount: number | null = null;
  if (extraCountMatch) {
    explicitExtraCount = parseInt(extraCountMatch[1], 10);
  }

  // Refine weft count display if Lycra
  if (isLycra && !weftCountDisplay.toLowerCase().includes("lycra")) {
    weftCountDisplay += " + Lycra";
  }

  // Reed Space & Total Ends calculation
  const reedSpace = Math.round(width * 1.055);
  const selvedgeEnds = 48;
  const totalEnds = Math.round(epi * width) + selvedgeEnds;

  // Derive Yarn Types
  const cottonType = isBci
    ? "BCI/Organic Cotton"
    : hasPC
    ? "Polyester/Cotton"
    : hasSlub
    ? "Slub Cotton"
    : "100% Cotton";
  const warpType = `${cottonType} Warp`;
  const weftType = isLycra ? `${cottonType} + Lycra` : `${cottonType} Weft`;

  // 6. Mode & Badge Determination (Matching prompt specifications)
  let detectedMode: "simple" | "multi" = isMultiYarn ? "multi" : "simple";
  let modeLabel = "Simple Mode";
  let badgeText = "Simple Mode";
  let badgeVariant: "primary" | "secondary" | "tertiary" | "outline" | "success" = "outline";

  if (hasSeersucker) {
    modeLabel = "Multi-Yarn + Seer Mode";
    badgeText = isLycra ? "Multi-Yarn + Seer Mode (Lycra)" : "Multi-Yarn + Seer Mode";
    badgeVariant = "secondary";
  } else if (hasButta) {
    modeLabel = "Multi-Yarn + Butta Mode";
    badgeText = isLycra ? "Multi-Yarn + Butta Mode (Lycra)" : "Multi-Yarn + Butta Mode";
    badgeVariant = "secondary";
  } else if (hasLinoDobby) {
    modeLabel = "Multi-Yarn + Lino/Dobby Mode";
    badgeText = "Multi-Yarn + Lino/Dobby Mode";
    badgeVariant = "secondary";
  } else if (hasDouble) {
    modeLabel = "Multi-Yarn + Double Cloth Mode";
    badgeText = "Multi-Yarn + Double Cloth Mode";
    badgeVariant = "secondary";
  } else if (hasTwoPly || hasMulti) {
    modeLabel = "Multi-Yarn Mode";
    badgeText = hasTwoPly ? "Multi-Yarn Mode (2-Ply)" : "Multi-Yarn Mode";
    badgeVariant = "secondary";
  } else if (hasSlub) {
    modeLabel = "Slub Yarn Mode";
    badgeText = isLycra ? "Slub Yarn Mode (Lycra)" : "Slub Yarn Mode";
    badgeVariant = "primary";
  } else if (hasPC) {
    modeLabel = "Blended Yarn Mode";
    badgeText = isLycra ? "Blended Yarn Mode (Lycra)" : "Blended Yarn Mode";
    badgeVariant = "primary";
  } else if (isLycra) {
    modeLabel = "Lycra Stretch Mode";
    badgeText = "Lycra Stretch Mode";
    badgeVariant = "primary";
  } else {
    modeLabel = "Simple Mode";
    badgeText = "Simple Mode";
    badgeVariant = "outline";
  }

  // 7. Auto-create suggested rows for Warp & Weft Tables
  const suggestedWarpYarns: WarpYarnItem[] = [];
  const suggestedWeftYarns: WeftYarnItem[] = [];

  if (hasButta) {
    // Butta / +2: 80% Ground Ends + 20% Extra Figuring Ends
    const groundEnds = Math.round(totalEnds * 0.8);
    const buttaEnds = totalEnds - groundEnds;
    const buttaCount = explicitExtraCount || (warpCount >= 40 ? Math.round(warpCount / 2) : 20);
    const extraWarpName = hasPlus2 ? "Warp-2 (+2 / Figuring Extra)" : "Warp-2 (Butta / Figuring)";

    suggestedWarpYarns.push({
      id: "warp-1",
      name: "Warp-1 (Ground)",
      count: warpCount || 40,
      ply: warpPly || 1,
      repeatEnds: 4,
      ends: groundEnds,
      endsMode: "direct",
      rate: 280,
      extraPercent: 0,
    });
    suggestedWarpYarns.push({
      id: "warp-2",
      name: extraWarpName,
      count: buttaCount,
      ply: 1,
      repeatEnds: 1,
      ends: buttaEnds,
      endsMode: "direct",
      rate: 340,
      extraPercent: 15, // 15% Extra for Butta floating / cut-work take-up
    });

    suggestedWeftYarns.push({
      id: "weft-1",
      name: "Weft-1 (Base Ground)",
      count: weftCount || 40,
      ply: weftPly || 1,
      repeatPicks: 1,
      ppi: ppi || 72,
      picksMode: "direct",
      rate: 260,
      isLycra: isLycra,
    });
  } else if (hasSeersucker) {
    // Seersucker: 75% Ground Ends (tight) + 25% Puckered Ends (slack beam with +25% Extra)
    const groundEnds = Math.round(totalEnds * 0.75);
    const seerEnds = totalEnds - groundEnds;

    suggestedWarpYarns.push({
      id: "warp-1",
      name: "Warp-1 (Ground)",
      count: warpCount || 60,
      ply: 1,
      repeatEnds: 3,
      ends: groundEnds,
      endsMode: "direct",
      rate: 280,
      extraPercent: 0,
    });
    suggestedWarpYarns.push({
      id: "warp-2",
      name: "Warp-2 (Seer / Puckered)",
      count: warpCount || 60,
      ply: hasTwoPly ? 2 : 1,
      repeatEnds: 1,
      ends: seerEnds,
      endsMode: "direct",
      rate: 320,
      extraPercent: 25, // 25% Extra for Seersucker slack beam contraction
    });

    suggestedWeftYarns.push({
      id: "weft-1",
      name: "Weft-1 (Base)",
      count: weftCount || 60,
      ply: 1,
      repeatPicks: 1,
      ppi: ppi || 88,
      picksMode: "direct",
      rate: 260,
      isLycra: isLycra,
    });
  } else if (hasLinoDobby) {
    // Lino / Dobby: Ground + Leno/Dobby binder ends
    const groundEnds = Math.round(totalEnds * 0.85);
    const linoEnds = totalEnds - groundEnds;

    suggestedWarpYarns.push({
      id: "warp-1",
      name: "Warp-1 (Ground)",
      count: warpCount || 40,
      ply: warpPly || 1,
      repeatEnds: 6,
      ends: groundEnds,
      endsMode: "direct",
      rate: 280,
      extraPercent: 0,
    });
    suggestedWarpYarns.push({
      id: "warp-2",
      name: "Warp-2 (Lino / Dobby Accent)",
      count: warpCount || 40,
      ply: 2,
      repeatEnds: 1,
      ends: linoEnds,
      endsMode: "direct",
      rate: 310,
      extraPercent: 10, // 10% Extra for Lino crossing/binder
    });

    suggestedWeftYarns.push({
      id: "weft-1",
      name: "Weft-1 (Base)",
      count: weftCount || 40,
      ply: weftPly || 1,
      repeatPicks: 1,
      ppi: ppi || 72,
      picksMode: "direct",
      rate: 260,
      isLycra: isLycra,
    });
  } else if (hasDouble) {
    // Double Cloth: 50% Face + 50% Back
    const halfEnds = Math.round(totalEnds / 2);
    const halfPicks = Math.round(ppi / 2);

    suggestedWarpYarns.push({
      id: "warp-1",
      name: "Warp-1 (Face Warp)",
      count: warpCount || 40,
      ply: 1,
      repeatEnds: 1,
      ends: halfEnds,
      endsMode: "direct",
      rate: 280,
      extraPercent: 0,
    });
    suggestedWarpYarns.push({
      id: "warp-2",
      name: "Warp-2 (Back Warp)",
      count: warpCount || 40,
      ply: 1,
      repeatEnds: 1,
      ends: halfEnds,
      endsMode: "direct",
      rate: 280,
      extraPercent: 2,
    });

    suggestedWeftYarns.push({
      id: "weft-1",
      name: "Weft-1 (Face Weft)",
      count: weftCount || 40,
      ply: 1,
      repeatPicks: 1,
      ppi: halfPicks,
      picksMode: "direct",
      rate: 260,
    });
    suggestedWeftYarns.push({
      id: "weft-2",
      name: "Weft-2 (Back Weft)",
      count: weftCount || 40,
      ply: 1,
      repeatPicks: 1,
      ppi: halfPicks,
      picksMode: "direct",
      rate: 260,
    });
  } else {
    // Normal / Simple Mode: 1 Warp row + 1 Weft row
    suggestedWarpYarns.push({
      id: "warp-1",
      name: hasSlub ? "Warp-1 (Slub Cotton)" : hasPC ? "Warp-1 (P/C Yarn)" : "Warp-1 (Cotton)",
      count: warpCount || 40,
      ply: warpPly || 1,
      repeatEnds: 1,
      ends: totalEnds,
      endsMode: "direct",
      rate: 280,
      extraPercent: hasSlub ? 2 : 0,
    });

    suggestedWeftYarns.push({
      id: "weft-1",
      name: isLycra ? "Weft-1 (Cotton + Lycra)" : hasPC ? "Weft-1 (P/C Yarn)" : "Weft-1 (Cotton)",
      count: weftCount || 40,
      ply: weftPly || 1,
      repeatPicks: 1,
      ppi: ppi || 72,
      picksMode: "direct",
      rate: 260,
      isLycra: isLycra,
    });
  }

  return {
    rawText: text,
    width,
    reedSpace,
    warpCount,
    warpPly,
    warpCountDisplay,
    warpType,
    weftCount,
    weftPly,
    weftCountDisplay,
    weftType,
    epi,
    ppi,
    weaveType,
    isMultiYarn,
    isLycra,
    isButta: hasButta,
    isSeersucker: hasSeersucker,
    isLinoDobby: hasLinoDobby,
    isDoubleCloth: hasDouble,
    isSlub: hasSlub,
    isPC: hasPC,
    isCompoundWarp: hasButta && text.includes("+2"),
    isBci,
    detectedMode,
    modeLabel,
    badgeText,
    badgeVariant,
    suggestedWarpYarns,
    suggestedWeftYarns,
    quantity,
    colorGreige: "Grey (Greige)",
    confidence: {
      width: widthFound,
      counts: countsFound,
      density: densityFound,
      weave: weaveType !== "Plain (1/1)" || /plain/i.test(text),
    },
  };
}
