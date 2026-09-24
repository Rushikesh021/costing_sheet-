"use client";

import * as React from "react";
import {
  calculateGreigeCost,
  RateInputs,
  ConstructionInputs,
  WarpYarnItem,
  WeftYarnItem,
  GreigeCostResult,
  CertificationType,
  formatINR,
} from "@/lib/ichalkaranji-calculator";
import { parseConstructionText } from "@/lib/construction-parser";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Calculator,
  RotateCcw,
  Sparkles,
  Check,
  Printer,
  Layers,
  Share2,
  CheckCircle2,
  Info,
  TrendingUp,
  Plus,
  Trash2,
  Zap,
  Award,
  SlidersHorizontal,
} from "lucide-react";

// Special Weave Job Rates standard in Ichalkaranji cluster
const WEAVE_JOB_RATES = [
  { label: "Plain Powerloom", rate: 25, desc: "Standard 1/1" },
  { label: "Twill / Satin", rate: 26, desc: "2/1, 3/1, Satin" },
  { label: "Dobby Loom", rate: 28, desc: "Geometric Dobby" },
  { label: "Butta / Jacquard", rate: 32, desc: "Extra Figuring Motifs" },
  { label: "Seersucker (2-Beam)", rate: 30, desc: "Dual Slack Beam" },
  { label: "Drop Box (2x2 Weft)", rate: 34, desc: "Multi-Weft Shuttle" },
  { label: "Airjet (High Speed)", rate: 25, desc: "Continuous RPM" },
];

// Certification options for BCI / Organic / GOTS
const CERTIFICATION_OPTIONS: {
  type: CertificationType;
  label: string;
  defaultExtra: number;
}[] = [
  { type: "none", label: "None (Regular)", defaultExtra: 0 },
  { type: "bci", label: "BCI (+₹8/kg)", defaultExtra: 8 },
  { type: "organic", label: "Organic (+₹18/kg)", defaultExtra: 18 },
  { type: "gots", label: "GOTS (+₹25/kg)", defaultExtra: 25 },
  { type: "custom", label: "Custom Extra", defaultExtra: 10 },
];

// Presets testing all smart detection keywords
const SMART_PRESETS = [
  {
    label: "40x40 108*72 58\" Butta",
    text: '40x40 108*72 58" butta (20s extra)',
    modeName: "Multi-Yarn + Butta",
  },
  {
    label: "SR Butta 60+2 x 60 100*80 63\"",
    text: 'SR Butta 60+2 x 60 100*80 63"',
    modeName: "SR Butta / +2",
  },
  {
    label: "60+2/60 x 60 92*88 Seersucker 63\"",
    text: '60+2/60 x 60 92*88 63" seersucker',
    modeName: "Multi-Yarn + Seer",
  },
  {
    label: "60*60 92*88 63\" Lino Dobby",
    text: '60*60 92*88 63" lino dobby',
    modeName: "Multi-Yarn + Lino/Dobby",
  },
  {
    label: "40x30 Lycra 132*64 Twill 67\"",
    text: '40x30 lycra 132*64 3/1 twill 67"',
    modeName: "Lycra Stretch",
  },
  {
    label: "40s Slub x 40s 100*80 63\"",
    text: '40s slub x 40s 100*80 63"',
    modeName: "Slub Yarn",
  },
  {
    label: "45 P/C x 45 P/C 88*64 63\"",
    text: '45 P/C x 45 P/C 88*64 63"',
    modeName: "Blended P/C",
  },
  {
    label: "40x40 132*72 Poplin 63\"",
    text: '40x40 132*72 63" poplin',
    modeName: "Simple Mode",
  },
];

export default function GreigeCostingDashboard() {
  // 1. Common Parameters State (Always Visible)
  const [commonParams, setCommonParams] = React.useState({
    width: 58,
    epi: 108,
    ppi: 72,
    weaveType: "Butta / Extra Warp",
    wastagePercent: 5, // default 5%
    sizingRate: 24, // ₹24 / kg of total warp yarn
    jobRate: 32, // paise/pick or ₹/m
    jobRateType: "paisePerPick" as "paisePerPick" | "perMeter",
    overheadPercent: 3, // default 3%
    marginPercent: 3, // default 3%
    bciExtra: 0, // certification extra ₹/kg
    certificationType: "none" as CertificationType,
    specialWeaveType: "Butta / Jacquard",
    isLycra: false,
  });

  // Construction Text String
  const [constructionText, setConstructionText] = React.useState<string>(
    '40x40 108*72 58" butta (20s extra)'
  );

  // Active Detection Mode & Badge
  const [detectedBadgeText, setDetectedBadgeText] = React.useState<string>(
    "Multi-Yarn + Butta Mode"
  );
  const [detectedBadgeVariant, setDetectedBadgeVariant] = React.useState<
    "primary" | "secondary" | "tertiary" | "outline" | "success"
  >("secondary");
  const [detectedSummary, setDetectedSummary] = React.useState<string | null>(
    '58" Width • 108 EPI • 72 PPI • 40s Ground + 20s Butta • Extra Warp Figuring'
  );

  // 2. ALWAYS-VISIBLE MULTI-YARN TABLES STATE
  // Warp Yarns Table Rows
  const [warpYarns, setWarpYarns] = React.useState<WarpYarnItem[]>([
    {
      id: "warp-1",
      name: "Warp-1 (Ground)",
      count: 40,
      ply: 1,
      repeatEnds: 4,
      ends: 5050,
      endsMode: "direct",
      rate: 280,
      extraPercent: 0,
    },
    {
      id: "warp-2",
      name: "Warp-2 (Butta / Figuring)",
      count: 20,
      ply: 1,
      repeatEnds: 1,
      ends: 1262,
      endsMode: "direct",
      rate: 340,
      extraPercent: 15,
    },
  ]);

  // Weft Yarns Table Rows
  const [weftYarns, setWeftYarns] = React.useState<WeftYarnItem[]>([
    {
      id: "weft-1",
      name: "Weft-1 (Base Ground)",
      count: 40,
      ply: 1,
      repeatPicks: 1,
      ppi: 72,
      picksMode: "direct",
      rate: 260,
      isLycra: false,
    },
  ]);

  // UI feedback states
  const [copiedWhatsapp, setCopiedWhatsapp] = React.useState(false);
  const [calculatePulse, setCalculatePulse] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);

  // 3. Centralized Calculation Engine
  const calculateCurrentCosting = React.useCallback(() => {
    const isMulti = warpYarns.length > 1 || weftYarns.length > 1;

    const construction: ConstructionInputs = {
      width: commonParams.width,
      epi: commonParams.epi,
      ppi: commonParams.ppi,
      warpCount: warpYarns[0]?.count || 40,
      warpPly: warpYarns[0]?.ply || 1,
      weftCount: weftYarns[0]?.count || 40,
      weftPly: weftYarns[0]?.ply || 1,
      weaveType: commonParams.weaveType,
      isLycra: commonParams.isLycra || weftYarns.some((w) => w.isLycra),
      isMultiYarn: isMulti,
      warpYarns: warpYarns,
      weftYarns: weftYarns,
    };

    const rates: RateInputs = {
      warpYarnRate: warpYarns[0]?.rate || 280,
      weftYarnRate: weftYarns[0]?.rate || 260,
      jobRate: commonParams.jobRate,
      jobRateType: commonParams.jobRateType,
      sizingRate: commonParams.sizingRate,
      wastagePercent: commonParams.wastagePercent,
      overheadPercent: commonParams.overheadPercent,
      marginPercent: commonParams.marginPercent,
      bciExtra: commonParams.bciExtra,
      certificationType: commonParams.certificationType,
      specialWeaveType: commonParams.specialWeaveType,
    };

    return calculateGreigeCost(construction, rates);
  }, [commonParams, warpYarns, weftYarns]);

  // Live Result
  const result = React.useMemo(() => {
    return calculateCurrentCosting();
  }, [calculateCurrentCosting]);

  // 4. SMART PASTE HANDLER: Auto-Detects & Automatically Populates Table Rows
  const handleConstructionTextChange = (rawText: string) => {
    setConstructionText(rawText);

    if (!rawText.trim()) {
      setDetectedSummary(null);
      setDetectedBadgeText("Simple Mode");
      setDetectedBadgeVariant("outline");
      return;
    }

    try {
      const parsed = parseConstructionText(rawText);

      // 1. Update Detection Badge
      setDetectedBadgeText(parsed.badgeText);
      setDetectedBadgeVariant(parsed.badgeVariant);

      // 2. Select Weave Job Rate Preset if detected
      let updatedJobRate = commonParams.jobRate;
      let updatedWeaveType = parsed.weaveType;
      let updatedSpecialWeave = commonParams.specialWeaveType;

      if (parsed.isButta) {
        updatedJobRate = 32;
        updatedSpecialWeave = "Butta / Jacquard";
      } else if (parsed.isSeersucker) {
        updatedJobRate = 30;
        updatedSpecialWeave = "Seersucker (2-Beam)";
      } else if (parsed.isLinoDobby) {
        updatedJobRate = 28;
        updatedSpecialWeave = "Dobby Loom";
      } else if (parsed.weaveType.includes("Twill")) {
        updatedJobRate = 26;
        updatedSpecialWeave = "Twill / Satin";
      }

      // 3. Update Common Parameters
      setCommonParams((prev) => ({
        ...prev,
        width: parsed.width,
        epi: parsed.epi,
        ppi: parsed.ppi,
        weaveType: updatedWeaveType,
        jobRate: updatedJobRate,
        specialWeaveType: updatedSpecialWeave,
        isLycra: parsed.isLycra,
      }));

      // 4. Auto-populate Multi-Yarn Tables
      if (parsed.suggestedWarpYarns && parsed.suggestedWarpYarns.length > 0) {
        setWarpYarns(parsed.suggestedWarpYarns);
      }
      if (parsed.suggestedWeftYarns && parsed.suggestedWeftYarns.length > 0) {
        setWeftYarns(parsed.suggestedWeftYarns);
      }

      // 5. Update Feedback Summary Banner
      const lycraTxt = parsed.isLycra ? " + Lycra" : "";
      const bciTxt = parsed.isBci ? " (BCI/Organic)" : "";
      const summary = `${parsed.width}" Width • ${parsed.epi} EPI • ${parsed.ppi} PPI • ${parsed.warpCountDisplay} Warp • ${parsed.weftCountDisplay}${lycraTxt} • ${parsed.weaveType}${bciTxt}`;
      setDetectedSummary(summary);
    } catch {
      // Keep existing data on parse failure
    }
  };

  // Helper to re-distribute ends across warp rows when total EPI or Width changes
  const handleWidthOrEpiChange = (newWidth: number, newEpi: number) => {
    const totalReedEnds = Math.round(newEpi * newWidth) + 48;
    setCommonParams((prev) => ({ ...prev, width: newWidth, epi: newEpi }));

    // Update warp ends proportionally if in direct mode
    setWarpYarns((prev) => {
      const sumEnds = prev.reduce((acc, y) => acc + (y.ends || 0), 0);
      if (sumEnds <= 0) return prev;
      return prev.map((y) => ({
        ...y,
        ends: Math.round(totalReedEnds * ((y.ends || 1) / sumEnds)),
      }));
    });
  };

  // Common Param Change Handler
  const handleCommonParamChange = (field: keyof typeof commonParams, value: any) => {
    setCommonParams((prev) => ({ ...prev, [field]: value }));
  };

  // Certification Extra Selector Handler
  const handleCertificationSelect = (certType: CertificationType) => {
    const option = CERTIFICATION_OPTIONS.find((c) => c.type === certType);
    const extraVal = option ? option.defaultExtra : 0;
    setCommonParams((prev) => ({
      ...prev,
      certificationType: certType,
      bciExtra: extraVal,
    }));
  };

  // Weave Job Rate Preset Handler
  const handleWeaveJobRateSelect = (item: (typeof WEAVE_JOB_RATES)[0]) => {
    setCommonParams((prev) => ({
      ...prev,
      jobRate: item.rate,
      specialWeaveType: item.label,
    }));
  };

  // Warp Yarns Table Row Actions
  const handleWarpRowChange = (id: string, field: keyof WarpYarnItem, value: any) => {
    setWarpYarns((prev) =>
      prev.map((y) => (y.id === id ? { ...y, [field]: value } : y))
    );
  };

  const handleAddWarpRow = () => {
    const nextIdx = warpYarns.length + 1;
    const newYarn: WarpYarnItem = {
      id: `warp-${Date.now()}`,
      name: `Warp-${nextIdx} (Extra / Butta)`,
      count: 20,
      ply: 1,
      repeatEnds: 1,
      ends: 1000,
      endsMode: "direct",
      rate: 320,
      extraPercent: 15,
    };
    setWarpYarns((prev) => [...prev, newYarn]);
  };

  const handleRemoveWarpRow = (id: string) => {
    if (warpYarns.length <= 1) return;
    setWarpYarns((prev) => prev.filter((y) => y.id !== id));
  };

  // Weft Yarns Table Row Actions
  const handleWeftRowChange = (id: string, field: keyof WeftYarnItem, value: any) => {
    setWeftYarns((prev) =>
      prev.map((y) => (y.id === id ? { ...y, [field]: value } : y))
    );
  };

  const handleAddWeftRow = () => {
    const nextIdx = weftYarns.length + 1;
    const newYarn: WeftYarnItem = {
      id: `weft-${Date.now()}`,
      name: `Weft-${nextIdx} (Extra / Accent)`,
      count: 30,
      ply: 1,
      repeatPicks: 1,
      ppi: 20,
      picksMode: "direct",
      rate: 260,
      isLycra: false,
    };
    setWeftYarns((prev) => [...prev, newYarn]);
  };

  const handleRemoveWeftRow = (id: string) => {
    if (weftYarns.length <= 1) return;
    setWeftYarns((prev) => prev.filter((y) => y.id !== id));
  };

  // Reset to default sample
  const handleReset = () => {
    handleConstructionTextChange('40x40 108*72 58" butta (20s extra)');
  };

  // Calculate Action
  const handleCalculateClick = () => {
    setCalculatePulse(true);
    setTimeout(() => setCalculatePulse(false), 800);

    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy WhatsApp Quotation
  const handleCopyWhatsappQuote = () => {
    let warpDetails = "";
    if (result.warpBreakdown) {
      result.warpBreakdown.forEach((w) => {
        const extraTxt = w.extraPercent > 0 ? ` (+${w.extraPercent}% extra)` : "";
        warpDetails += `\n  • ${w.name} (${w.countDisplay}): ${w.ends} ends${extraTxt} @ ₹${w.rateApplied}/kg = ${formatINR(w.cost)}/m (${w.weightGrams.toFixed(1)}g)`;
      });
    }

    let weftDetails = "";
    if (result.weftBreakdown) {
      result.weftBreakdown.forEach((wf) => {
        weftDetails += `\n  • ${wf.name} (${wf.countDisplay}): ${wf.picks} picks @ ₹${wf.rateApplied}/kg = ${formatINR(wf.cost)}/m (${wf.weightGrams.toFixed(1)}g)`;
      });
    }

    const certText =
      commonParams.bciExtra > 0
        ? `\n*Certification:* ${commonParams.certificationType?.toUpperCase()} (+₹${commonParams.bciExtra}/kg)`
        : "";

    const quoteText = `*GREIGE FABRIC COSTING QUOTATION*
---------------------------------------
*Quality:* ${constructionText || `${commonParams.epi}x${commonParams.ppi} ${commonParams.width}"`}
*Mode:* ${detectedBadgeText}
*Width:* ${commonParams.width}" | *EPI:* ${commonParams.epi} | *PPI:* ${commonParams.ppi}
*Weave:* ${commonParams.weaveType}${certText}
---------------------------------------
*WARP BREAKDOWN (Total Ends: ${result.totalEnds}):*${warpDetails}
*Total Warp Cost:* ${formatINR(result.warpCost)}/m (${result.warpWeightGrams.toFixed(1)} g/m)

*WEFT BREAKDOWN (Total PPI: ${commonParams.ppi}):*${weftDetails}
*Total Weft Cost:* ${formatINR(result.weftCost)}/m (${result.weftWeightGrams.toFixed(1)} g/m)
---------------------------------------
*COST BREAKDOWN (₹ / Meter):*
• Sizing Cost: ${formatINR(result.sizingCost)}/m (on total ${(result.warpWeightGrams / 1000).toFixed(4)}kg warp @ ₹${commonParams.sizingRate}/kg)
• Job Cost: ${formatINR(result.jobCost)}/m (${commonParams.jobRateType === "paisePerPick" ? `${commonParams.ppi} PPI @ ${commonParams.jobRate}p/pick` : `₹${commonParams.jobRate}/m`} [${commonParams.specialWeaveType}])
• Overhead (${commonParams.overheadPercent}%): ${formatINR(result.overhead)}/m
---------------------------------------
*Total Cost:* ${formatINR(result.totalCost)} / m
*Margin (${commonParams.marginPercent}%):* ${formatINR(result.margin)} / m
*SELLING PRICE:* ${formatINR(result.suggestedSellingPrice)} / m (${formatINR(result.suggestedSellingPricePerYard)} / yd)
---------------------------------------
*Fabric Specs:*
• GSM: ${result.totalGSM.toFixed(1)} g/m² (${result.ouncesPerSqYard.toFixed(2)} oz/yd²)
• GLM: ${result.totalGLM.toFixed(1)} g/m | Reed: ${result.reedSpace}"
• Cluster: Ichalkaranji Weaving Standards
---------------------------------------`;

    navigator.clipboard.writeText(quoteText);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Percentage shares for visual distribution
  const totalBreakdown =
    result.warpCost +
    result.weftCost +
    result.sizingCost +
    result.jobCost +
    result.overhead;
  const warpPct = totalBreakdown > 0 ? (result.warpCost / totalBreakdown) * 100 : 0;
  const weftPct = totalBreakdown > 0 ? (result.weftCost / totalBreakdown) * 100 : 0;
  const sizingPct = totalBreakdown > 0 ? (result.sizingCost / totalBreakdown) * 100 : 0;
  const jobPct = totalBreakdown > 0 ? (result.jobCost / totalBreakdown) * 100 : 0;
  const overheadPct = totalBreakdown > 0 ? (result.overhead / totalBreakdown) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground selection:bg-primary/20">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-6 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Greige Cloth Costing
                </h1>
                {/* PROMINENT MODE BADGE AS REQUESTED */}
                <Badge variant={detectedBadgeVariant} className="text-[11px] font-semibold">
                  {detectedBadgeText}
                </Badge>
              </div>
              <p className="text-xs text-foreground/60 hidden xs:block">
                Ichalkaranji Multi-Yarn, Butta, Seersucker &amp; Special Weave System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs gap-1.5"
              title="Reset to default sample"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TOP SMART DETECTION BANNER */}
        <div className="rounded-3xl p-4 sm:p-5 bg-surface-container-low border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{detectedBadgeText}</span>
              </div>

              {commonParams.bciExtra > 0 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <Award className="h-3 w-3" />
                  <span>{commonParams.certificationType.toUpperCase()} (+₹{commonParams.bciExtra}/kg)</span>
                </div>
              )}

              {commonParams.isLycra && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-xs font-semibold border border-cyan-500/30">
                  <Zap className="h-3 w-3" />
                  <span>Lycra Active</span>
                </div>
              )}
            </div>

            <p className="text-xs text-foreground/70">
              Pasting detects and configures all Warp &amp; Weft rows. Edit any value or add rows anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 self-stretch sm:self-auto max-w-full overflow-hidden">
            <span className="text-xs text-foreground/60 shrink-0 font-medium">Quick Test:</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {SMART_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleConstructionTextChange(p.text)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-foreground/80 hover:text-foreground hover:border-primary/50 whitespace-nowrap transition-all shadow-2xs"
                >
                  {p.modeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SMART PASTE SECTION */}
        <Card variant="elevated" className="border border-outline-variant/40 shadow-sm">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/80 tracking-wide flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Paste Construction String</span>
              </label>
              <span className="text-[11px] text-foreground/50">
                Auto-fills Width, EPI, PPI and creates all Warp &amp; Weft rows
              </span>
            </div>

            <Textarea
              rows={2}
              placeholder='Paste raw construction e.g. "40x40 108*72 58\" butta (20s extra)" or "60+2/60 x 60 92*88 63\" seersucker"'
              value={constructionText}
              onChange={(e) => handleConstructionTextChange(e.target.value)}
              className="font-mono text-sm leading-relaxed"
            />

            {detectedSummary && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">
                  <strong>Detected:</strong> {detectedSummary}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. COMMON PARAMETERS (ALWAYS VISIBLE) */}
        <Card variant="elevated" className="border border-outline-variant/40 shadow-sm">
          <CardHeader className="pb-3 border-b border-outline-variant/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <CardTitle className="text-base font-semibold">
                  Common Parameters
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-normal">
                  Always Visible
                </Badge>
              </div>
              <p className="text-xs text-foreground/60">
                Fabric dimensions, conversion rates, sizing charges, and commercial margins
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* Width (inches) */}
              <Input
                label="Width (Greige)"
                type="number"
                suffix="in"
                value={commonParams.width}
                onChange={(e) =>
                  handleWidthOrEpiChange(
                    parseFloat(e.target.value) || 0,
                    commonParams.epi
                  )
                }
                helperText="Greige fabric width"
              />

              {/* Total EPI */}
              <Input
                label="Total EPI"
                type="number"
                suffix="ends/in"
                value={commonParams.epi}
                onChange={(e) =>
                  handleWidthOrEpiChange(
                    commonParams.width,
                    parseInt(e.target.value, 10) || 0
                  )
                }
                helperText={`Total Ends: ${result.totalEnds}`}
              />

              {/* Total PPI */}
              <Input
                label="Total PPI"
                type="number"
                suffix="picks/in"
                value={commonParams.ppi}
                onChange={(e) =>
                  handleCommonParamChange("ppi", parseInt(e.target.value, 10) || 0)
                }
                helperText="Total weft picks density"
              />

              {/* Wastage % */}
              <Input
                label="Wastage %"
                type="number"
                step="0.5"
                suffix="%"
                value={commonParams.wastagePercent}
                onChange={(e) =>
                  handleCommonParamChange(
                    "wastagePercent",
                    parseFloat(e.target.value) || 0
                  )
                }
                helperText="Standard: 5%"
              />

              {/* Sizing Rate (₹/kg) */}
              <Input
                label="Sizing Rate"
                type="number"
                prefix="₹"
                suffix="/ kg total warp"
                value={commonParams.sizingRate}
                onChange={(e) =>
                  handleCommonParamChange(
                    "sizingRate",
                    parseFloat(e.target.value) || 0
                  )
                }
                helperText="Charged on total warp wt"
              />

              {/* Job Rate with paise/pick or ₹/m toggle */}
              <div className="w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground/80 tracking-wide">
                    Job Rate
                  </label>
                  <div className="inline-flex rounded-lg bg-surface-container p-0.5 border border-outline-variant/40 text-[10px]">
                    <button
                      type="button"
                      className={`px-1.5 py-0.5 rounded-md font-medium ${
                        commonParams.jobRateType === "paisePerPick"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70"
                      }`}
                      onClick={() => handleCommonParamChange("jobRateType", "paisePerPick")}
                    >
                      paise/pick
                    </button>
                    <button
                      type="button"
                      className={`px-1.5 py-0.5 rounded-md font-medium ${
                        commonParams.jobRateType === "perMeter"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70"
                      }`}
                      onClick={() => handleCommonParamChange("jobRateType", "perMeter")}
                    >
                      ₹/meter
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm text-foreground/50 pointer-events-none select-none">
                    {commonParams.jobRateType === "paisePerPick" ? "p" : "₹"}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={commonParams.jobRate}
                    onChange={(e) =>
                      handleCommonParamChange("jobRate", parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-11 rounded-xl bg-surface-container/60 border border-outline/30 pl-8 pr-20 text-sm text-foreground focus:outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="absolute right-3 text-[11px] font-semibold text-foreground/60 pointer-events-none select-none bg-surface-container px-1.5 py-0.5 rounded-md">
                    {commonParams.jobRateType === "paisePerPick" ? "p/pick" : "₹/m"}
                  </div>
                </div>
                <p className="text-[11px] text-foreground/60">
                  {commonParams.jobRateType === "paisePerPick"
                    ? `At ${commonParams.ppi} PPI = ₹${((commonParams.ppi * commonParams.jobRate) / 100).toFixed(2)}/m`
                    : "Direct charge per meter"}
                </p>
              </div>

              {/* Overhead % */}
              <Input
                label="Overhead %"
                type="number"
                step="0.5"
                suffix="%"
                value={commonParams.overheadPercent}
                onChange={(e) =>
                  handleCommonParamChange(
                    "overheadPercent",
                    parseFloat(e.target.value) || 0
                  )
                }
                helperText="Standard: 3%"
              />

              {/* Margin % */}
              <Input
                label="Margin %"
                type="number"
                step="0.5"
                suffix="%"
                value={commonParams.marginPercent}
                onChange={(e) =>
                  handleCommonParamChange(
                    "marginPercent",
                    parseFloat(e.target.value) || 0
                  )
                }
                helperText="Profit margin: 3%"
              />

              {/* BCI / Organic Extra (₹/kg) */}
              <div className="w-full flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-medium text-foreground/80 tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-emerald-600" />
                    <span>BCI / Organic Extra (₹/kg)</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {commonParams.bciExtra > 0 ? `+₹${commonParams.bciExtra}/kg` : "Regular"}
                  </span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex items-center flex-1">
                    <span className="absolute left-3 text-sm text-foreground/50 pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={commonParams.bciExtra || ""}
                      placeholder="0"
                      onChange={(e) =>
                        handleCommonParamChange("bciExtra", parseFloat(e.target.value) || 0)
                      }
                      className="w-full h-11 rounded-xl bg-surface-container/60 border border-outline/30 pl-8 pr-12 text-sm text-foreground focus:outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="absolute right-3 text-[11px] font-semibold text-foreground/60 pointer-events-none select-none bg-surface-container px-1.5 py-0.5 rounded-md">
                      / kg
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 items-center">
                    {CERTIFICATION_OPTIONS.map((c) => (
                      <button
                        key={c.type}
                        type="button"
                        onClick={() => handleCertificationSelect(c.type)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                          commonParams.certificationType === c.type
                            ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                            : "bg-surface-container text-foreground/70 hover:text-foreground border-outline-variant/40"
                        }`}
                      >
                        {c.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Weave-Specific Job Rate Preset Buttons */}
            <div className="pt-2 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-foreground/70 font-medium">
                Ichalkaranji Weave Conversion Presets:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {WEAVE_JOB_RATES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleWeaveJobRateSelect(item)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                      commonParams.specialWeaveType === item.label
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high border-outline-variant/40 text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="ml-1 opacity-75 font-semibold">({item.rate}p)</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. THE HEART OF THE SYSTEM: ALWAYS-VISIBLE MULTI-YARN TABLES */}
        <div className="space-y-6">
          {/* 2A. WARP YARNS TABLE */}
          <Card variant="elevated" className="border border-outline-variant/40 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-outline-variant/20 bg-surface-container-low/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <span>Warp Yarns Table</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {warpYarns.length} {warpYarns.length === 1 ? "Row (Simple)" : "Rows (Multi-Warp)"}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-foreground/60">
                      Calculates weight (g/m) and cost (₹/m) for every warp yarn separately
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddWarpRow}
                  className="text-xs gap-1.5 self-start sm:self-auto border-blue-500/40 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-600" />
                  <span>Add Warp Yarn (Warp-{warpYarns.length + 1})</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/40 bg-surface-container-low text-foreground/70 font-semibold">
                      <th className="py-3 px-3 min-w-[160px]">Yarn Name</th>
                      <th className="py-3 px-3 min-w-[110px]">Count (Ne)</th>
                      <th className="py-3 px-3 min-w-[120px]">Number of Ends</th>
                      <th className="py-3 px-3 min-w-[110px]">Extra % (Lino/Seer/Butta)</th>
                      <th className="py-3 px-3 min-w-[110px]">Rate (₹/kg)</th>
                      <th className="py-3 px-3 text-right min-w-[90px]">Weight (g/m)</th>
                      <th className="py-3 px-3 text-right min-w-[100px]">Cost (₹/m)</th>
                      <th className="py-3 px-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {warpYarns.map((yarn, idx) => {
                      const breakdown = result.warpBreakdown?.find((w) => w.id === yarn.id);
                      return (
                        <tr key={yarn.id} className="hover:bg-surface-container/40 transition-colors">
                          {/* Yarn Name */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                              <input
                                type="text"
                                value={yarn.name}
                                onChange={(e) =>
                                  handleWarpRowChange(yarn.id, "name", e.target.value)
                                }
                                placeholder={`Warp-${idx + 1}`}
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              />
                            </div>
                          </td>

                          {/* Count (Ne) & Ply */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={yarn.count}
                                onChange={(e) =>
                                  handleWarpRowChange(
                                    yarn.id,
                                    "count",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-14 text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              />
                              <select
                                value={yarn.ply || 1}
                                onChange={(e) =>
                                  handleWarpRowChange(
                                    yarn.id,
                                    "ply",
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="text-xs bg-surface-container/50 border border-outline-variant/40 rounded-lg px-1.5 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              >
                                <option value={1}>1-ply</option>
                                <option value={2}>2-ply</option>
                              </select>
                            </div>
                          </td>

                          {/* Number of Ends */}
                          <td className="py-2.5 px-3">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                value={yarn.ends !== undefined ? yarn.ends : ""}
                                placeholder="ends"
                                onChange={(e) =>
                                  handleWarpRowChange(
                                    yarn.id,
                                    "ends",
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 pr-10 text-foreground focus:outline-none focus:border-primary"
                              />
                              <span className="absolute right-2 text-[10px] text-foreground/50 pointer-events-none">
                                ends
                              </span>
                            </div>
                          </td>

                          {/* Extra % (for Lino/Seer/Butta) */}
                          <td className="py-2.5 px-3">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                step="1"
                                value={yarn.extraPercent}
                                onChange={(e) =>
                                  handleWarpRowChange(
                                    yarn.id,
                                    "extraPercent",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 pr-6 text-foreground focus:outline-none focus:border-primary"
                              />
                              <span className="absolute right-2 text-[10px] text-foreground/50 pointer-events-none">
                                %
                              </span>
                            </div>
                          </td>

                          {/* Rate (₹/kg) */}
                          <td className="py-2.5 px-3">
                            <div className="relative flex items-center">
                              <span className="absolute left-2 text-xs text-foreground/50 pointer-events-none">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={yarn.rate}
                                onChange={(e) =>
                                  handleWarpRowChange(
                                    yarn.id,
                                    "rate",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg pl-5 pr-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              />
                            </div>
                          </td>

                          {/* Weight (g/m) - Live Calculated */}
                          <td className="py-2.5 px-3 text-right font-bold text-foreground">
                            {breakdown ? `${breakdown.weightGrams.toFixed(2)} g` : "--"}
                          </td>

                          {/* Cost (₹/m) - Live Calculated */}
                          <td className="py-2.5 px-3 text-right font-bold text-blue-600 text-sm">
                            {breakdown ? formatINR(breakdown.cost) : "--"}
                          </td>

                          {/* Remove button */}
                          <td className="py-2.5 px-2 text-center">
                            {warpYarns.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveWarpRow(yarn.id)}
                                className="h-7 w-7 rounded-lg text-foreground/40 hover:text-error hover:bg-error/10 inline-flex items-center justify-center transition-colors"
                                title="Remove this warp row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Warp Summary Footer */}
                  <tfoot>
                    <tr className="bg-surface-container font-semibold border-t-2 border-outline-variant/60">
                      <td className="py-3 px-3 text-foreground" colSpan={2}>
                        Total Warp Yarns Summary
                      </td>
                      <td className="py-3 px-3 text-foreground font-bold">
                        {warpYarns.reduce((sum, y) => sum + (y.ends || 0), 0)} ends
                        <span className="block text-[10px] text-foreground/50 font-normal">
                          (Reed: {result.totalEnds} ends)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground/50" colSpan={2}>
                        Sizing on total warp: {formatINR(result.sizingCost)}/m
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-foreground">
                        {result.warpWeightGrams.toFixed(2)} g/m
                      </td>
                      <td className="py-3 px-3 text-right font-black text-blue-600 text-base">
                        {formatINR(result.warpCost)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 2B. WEFT YARNS TABLE */}
          <Card variant="elevated" className="border border-outline-variant/40 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-outline-variant/20 bg-surface-container-low/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <span>Weft Yarns Table</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {weftYarns.length} {weftYarns.length === 1 ? "Row (Simple)" : "Rows (Multi-Weft)"}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-foreground/60">
                      Calculates weight (g/m) and cost (₹/m) for every weft yarn separately
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddWeftRow}
                  className="text-xs gap-1.5 self-start sm:self-auto border-cyan-500/40 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                >
                  <Plus className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Add Weft Yarn (Weft-{weftYarns.length + 1})</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/40 bg-surface-container-low text-foreground/70 font-semibold">
                      <th className="py-3 px-3 min-w-[160px]">Yarn Name</th>
                      <th className="py-3 px-3 min-w-[110px]">Count (Ne)</th>
                      <th className="py-3 px-3 min-w-[120px]">PPI / Picks</th>
                      <th className="py-3 px-3 min-w-[120px]">Rate (₹/kg)</th>
                      <th className="py-3 px-3 min-w-[100px]">Lycra Spandex</th>
                      <th className="py-3 px-3 text-right min-w-[90px]">Weight (g/m)</th>
                      <th className="py-3 px-3 text-right min-w-[100px]">Cost (₹/m)</th>
                      <th className="py-3 px-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {weftYarns.map((yarn, idx) => {
                      const breakdown = result.weftBreakdown?.find((w) => w.id === yarn.id);
                      return (
                        <tr key={yarn.id} className="hover:bg-surface-container/40 transition-colors">
                          {/* Yarn Name */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
                              <input
                                type="text"
                                value={yarn.name}
                                onChange={(e) =>
                                  handleWeftRowChange(yarn.id, "name", e.target.value)
                                }
                                placeholder={`Weft-${idx + 1}`}
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              />
                            </div>
                          </td>

                          {/* Count (Ne) & Ply */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={yarn.count}
                                onChange={(e) =>
                                  handleWeftRowChange(
                                    yarn.id,
                                    "count",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-14 text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              />
                              <select
                                value={yarn.ply || 1}
                                onChange={(e) =>
                                  handleWeftRowChange(
                                    yarn.id,
                                    "ply",
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="text-xs bg-surface-container/50 border border-outline-variant/40 rounded-lg px-1.5 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              >
                                <option value={1}>1-ply</option>
                                <option value={2}>2-ply</option>
                              </select>
                            </div>
                          </td>

                          {/* PPI / Picks */}
                          <td className="py-2.5 px-3">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                value={yarn.ppi !== undefined ? yarn.ppi : ""}
                                placeholder="picks"
                                onChange={(e) =>
                                  handleWeftRowChange(
                                    yarn.id,
                                    "ppi",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg px-2 py-1.5 pr-10 text-foreground focus:outline-none focus:border-primary"
                              />
                              <span className="absolute right-2 text-[10px] text-foreground/50 pointer-events-none">
                                picks
                              </span>
                            </div>
                          </td>

                          {/* Rate (₹/kg) */}
                          <td className="py-2.5 px-3">
                            <div className="relative flex items-center">
                              <span className="absolute left-2 text-xs text-foreground/50 pointer-events-none">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={yarn.rate}
                                onChange={(e) =>
                                  handleWeftRowChange(
                                    yarn.id,
                                    "rate",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/40 rounded-lg pl-5 pr-2 py-1.5 text-foreground focus:outline-none focus:border-primary"
                              />
                            </div>
                          </td>

                          {/* Lycra checkbox */}
                          <td className="py-2.5 px-3">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                              <input
                                type="checkbox"
                                checked={yarn.isLycra || false}
                                onChange={(e) =>
                                  handleWeftRowChange(yarn.id, "isLycra", e.target.checked)
                                }
                                className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="text-foreground/70 font-medium">Lycra</span>
                            </label>
                          </td>

                          {/* Weight (g/m) - Live Calculated */}
                          <td className="py-2.5 px-3 text-right font-bold text-foreground">
                            {breakdown ? `${breakdown.weightGrams.toFixed(2)} g` : "--"}
                          </td>

                          {/* Cost (₹/m) - Live Calculated */}
                          <td className="py-2.5 px-3 text-right font-bold text-cyan-600 text-sm">
                            {breakdown ? formatINR(breakdown.cost) : "--"}
                          </td>

                          {/* Remove button */}
                          <td className="py-2.5 px-2 text-center">
                            {weftYarns.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveWeftRow(yarn.id)}
                                className="h-7 w-7 rounded-lg text-foreground/40 hover:text-error hover:bg-error/10 inline-flex items-center justify-center transition-colors"
                                title="Remove this weft row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Weft Summary Footer */}
                  <tfoot>
                    <tr className="bg-surface-container font-semibold border-t-2 border-outline-variant/60">
                      <td className="py-3 px-3 text-foreground" colSpan={2}>
                        Total Weft Yarns Summary
                      </td>
                      <td className="py-3 px-3 text-foreground font-bold">
                        {weftYarns.reduce((sum, y) => sum + (y.ppi || 0), 0)} picks/in
                      </td>
                      <td className="py-3 px-3 text-foreground/50" colSpan={2}>
                        Reed Space: {result.reedSpace}&quot;
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-foreground">
                        {result.weftWeightGrams.toFixed(2)} g/m
                      </td>
                      <td className="py-3 px-3 text-right font-black text-cyan-600 text-base">
                        {formatINR(result.weftCost)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. BIG CALCULATE BUTTON & ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCalculateClick}
            className={`w-full sm:w-auto min-w-[280px] h-13 text-base font-semibold shadow-md-2 hover:shadow-md-3 transition-all duration-300 ${
              calculatePulse ? "scale-95 bg-primary/90 ring-4 ring-primary/30" : ""
            }`}
          >
            <Calculator className="h-5 w-5 mr-2" />
            <span>Calculate Costing</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleCopyWhatsappQuote}
            className="w-full sm:w-auto h-13 text-sm font-semibold border-outline-variant gap-2"
          >
            {copiedWhatsapp ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-success">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-primary" />
                <span>Copy for WhatsApp</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrint}
            className="h-13 text-sm font-semibold text-foreground/70 hover:text-foreground hidden md:inline-flex gap-2"
            title="Print or save as PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </div>

        {/* 6. RESULTS & BREAKDOWN SECTION */}
        <div ref={resultRef} className="space-y-4 pt-2">
          {/* Hero Result Banner */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-primary/10 via-surface-container to-surface-container-high border border-primary/20 shadow-md-1">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Selling Price Display */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" className="text-xs uppercase tracking-wide">
                    Suggested Selling Price
                  </Badge>
                  <span className="text-xs text-foreground/60 font-medium">
                    (Total Cost + {commonParams.marginPercent}% Margin)
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-primary">
                    {formatINR(result.suggestedSellingPrice)}
                  </span>
                  <span className="text-base sm:text-lg font-semibold text-foreground/70">
                    / meter
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/60">
                  Equivalent to{" "}
                  <strong className="text-foreground">
                    {formatINR(result.suggestedSellingPricePerYard)} / yard
                  </strong>{" "}
                  • Net Profit Margin:{" "}
                  <strong className="text-success font-semibold">
                    {formatINR(result.margin)} / meter
                  </strong>
                </p>
              </div>

              {/* Total Cost & Direct Subtotal Summary Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="p-3.5 rounded-2xl bg-surface/90 border border-outline-variant/40 shadow-xs">
                  <div className="text-[11px] font-semibold text-foreground/60 uppercase">
                    Total Cost
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {formatINR(result.totalCost)}
                  </div>
                  <div className="text-[10px] text-foreground/50">per meter</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface/90 border border-outline-variant/40 shadow-xs">
                  <div className="text-[11px] font-semibold text-foreground/60 uppercase">
                    Direct Subtotal
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {formatINR(result.subtotalDirectCost)}
                  </div>
                  <div className="text-[10px] text-foreground/50">Warp+Weft+Size+Job</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface/90 border border-outline-variant/40 shadow-xs col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-foreground/60 uppercase">
                    Fabric GSM
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {result.totalGSM.toFixed(1)} <span className="text-xs font-normal text-foreground/60">g/m²</span>
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    {result.ouncesPerSqYard.toFixed(2)} oz/yd² ({result.totalGLM.toFixed(1)} GLM)
                  </div>
                </div>
              </div>
            </div>

            {/* Proportional Cost Breakdown Bar */}
            <div className="mt-6 pt-5 border-t border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/70">Cost Distribution:</span>
                <span className="text-foreground/50 text-[11px]">
                  Warp: {warpPct.toFixed(0)}% • Weft: {weftPct.toFixed(0)}% • Sizing: {sizingPct.toFixed(0)}% • Job: {jobPct.toFixed(0)}% • OH: {overheadPct.toFixed(0)}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-container-highest">
                <div
                  style={{ width: `${warpPct}%` }}
                  className="bg-blue-600 transition-all duration-500"
                  title={`Warp Cost: ${warpPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${weftPct}%` }}
                  className="bg-cyan-500 transition-all duration-500"
                  title={`Weft Cost: ${weftPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${sizingPct}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Sizing Cost: ${sizingPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${jobPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Job Cost: ${jobPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${overheadPct}%` }}
                  className="bg-purple-500 transition-all duration-500"
                  title={`Overhead: ${overheadPct.toFixed(1)}%`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-foreground/70 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span>Warp ({warpPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <span>Weft ({weftPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Sizing ({sizingPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Job Weaving ({jobPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span>Overhead ({overheadPct.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ITEM-BY-ITEM DETAILED BREAKDOWN TABLE */}
          <Card variant="elevated" className="border border-outline-variant/40 shadow-sm">
            <CardHeader className="pb-3 border-b border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Detailed Cost Breakdown
                  </CardTitle>
                </div>
                <Badge variant={detectedBadgeVariant} className="text-xs font-medium">
                  {detectedBadgeText}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 p-0 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/40 bg-surface-container-low text-foreground/70 font-semibold">
                      <th className="py-3 px-4 rounded-tl-xl">Cost Component</th>
                      <th className="py-3 px-4">Calculation Basis / Quantity</th>
                      <th className="py-3 px-4">Rate Applied</th>
                      <th className="py-3 px-4 text-right">Cost (₹ / Meter)</th>
                      <th className="py-3 px-4 text-right rounded-tr-xl">Share %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {/* 1. ALL WARP YARNS (TOTAL + DETAILED SUB-ROWS) */}
                    <tr className="hover:bg-surface-container/50 transition-colors bg-surface-container-low/30 font-semibold">
                      <td className="py-3.5 px-4 text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        <span>All Warp Yarns (Total)</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">
                        {result.warpWeightGrams.toFixed(2)} g/m (incl. {commonParams.wastagePercent}% wastage)
                        <div className="text-[11px] text-foreground/50">
                          {result.totalEnds} total reed ends
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/80">
                        {warpYarns.length > 1 ? "Itemized per yarn below" : `₹${warpYarns[0]?.rate || 280} / kg`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground text-sm">
                        {formatINR(result.warpCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/60 font-medium">
                        {warpPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* Individual Warp Yarn Sub-Rows */}
                    {result.warpBreakdown?.map((wb) => (
                      <tr
                        key={wb.id}
                        className="bg-surface/50 text-[11px] border-l-4 border-l-blue-500/70"
                      >
                        <td className="py-2.5 px-4 pl-8 text-foreground/80">
                          ↳ <span className="font-semibold text-foreground">{wb.name}</span> ({wb.countDisplay})
                          {wb.extraPercent > 0 && (
                            <span className="ml-1 text-[10px] text-primary font-medium">
                              (+{wb.extraPercent}% Extra Take-up)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-foreground/60">
                          {wb.ends} ends • {wb.weightGrams.toFixed(2)} g/m ({wb.totalGala.toFixed(1)}% crimp)
                        </td>
                        <td className="py-2.5 px-4 text-foreground/60">
                          ₹{wb.rateApplied} / kg
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-foreground/90">
                          {formatINR(wb.cost)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-foreground/50">
                          {totalBreakdown > 0 ? ((wb.cost / totalBreakdown) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}

                    {/* 2. ALL WEFT YARNS (TOTAL + DETAILED SUB-ROWS) */}
                    <tr className="hover:bg-surface-container/50 transition-colors bg-surface-container-low/30 font-semibold">
                      <td className="py-3.5 px-4 text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                        <span>All Weft Yarns (Total)</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">
                        {result.weftWeightGrams.toFixed(2)} g/m (incl. {commonParams.wastagePercent}% wastage)
                        <div className="text-[11px] text-foreground/50">
                          {commonParams.ppi} total PPI • {result.reedSpace}&quot; reed space
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/80">
                        {weftYarns.length > 1 ? "Itemized per yarn below" : `₹${weftYarns[0]?.rate || 260} / kg`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground text-sm">
                        {formatINR(result.weftCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/60 font-medium">
                        {weftPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* Individual Weft Yarn Sub-Rows */}
                    {result.weftBreakdown?.map((wfb) => (
                      <tr
                        key={wfb.id}
                        className="bg-surface/50 text-[11px] border-l-4 border-l-cyan-500/70"
                      >
                        <td className="py-2.5 px-4 pl-8 text-foreground/80">
                          ↳ <span className="font-semibold text-foreground">{wfb.name}</span> ({wfb.countDisplay})
                        </td>
                        <td className="py-2.5 px-4 text-foreground/60">
                          {wfb.picks} picks/in • {wfb.weightGrams.toFixed(2)} g/m
                        </td>
                        <td className="py-2.5 px-4 text-foreground/60">
                          ₹{wfb.rateApplied} / kg
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-foreground/90">
                          {formatINR(wfb.cost)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-foreground/50">
                          {totalBreakdown > 0 ? ((wfb.cost / totalBreakdown) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}

                    {/* 3. SIZING COST (ON TOTAL WARP WEIGHT) */}
                    <tr className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>Sizing Cost (Total Warp)</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">
                        Charged on total warp wt ({(result.warpWeightGrams / 1000).toFixed(4)} kg/m)
                      </td>
                      <td className="py-3.5 px-4 text-foreground/80">
                        ₹{commonParams.sizingRate} / kg warp
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground text-sm">
                        {formatINR(result.sizingCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/60 font-medium">
                        {sizingPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* 4. JOB COST */}
                    <tr className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Job Cost ({commonParams.specialWeaveType || "Weaving"})</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">
                        {commonParams.jobRateType === "paisePerPick" ? (
                          <>
                            {commonParams.ppi} picks/in × {commonParams.jobRate} paise
                            <div className="text-[11px] text-foreground/50">
                              (PPI × jobRate) / 100
                            </div>
                          </>
                        ) : (
                          "Direct weaving rate per meter"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-foreground/80">
                        {commonParams.jobRateType === "paisePerPick"
                          ? `${commonParams.jobRate} paise / pick`
                          : `₹${commonParams.jobRate} / meter`}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground text-sm">
                        {formatINR(result.jobCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/60 font-medium">
                        {jobPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* Subtotal Direct Cost */}
                    <tr className="bg-surface-container/30 font-semibold border-t-2 border-outline-variant/40">
                      <td className="py-3 px-4 text-foreground">Direct Subtotal</td>
                      <td className="py-3 px-4 text-foreground/60" colSpan={2}>
                        All Warps + All Wefts + Sizing + Job
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground text-sm">
                        {formatINR(result.subtotalDirectCost)}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/60">
                        {(100 - overheadPct).toFixed(1)}%
                      </td>
                    </tr>

                    {/* 5. Overhead */}
                    <tr className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        <span>Overhead</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">
                        {commonParams.overheadPercent}% on direct subtotal ({formatINR(result.subtotalDirectCost)})
                      </td>
                      <td className="py-3.5 px-4 text-foreground/80">
                        {commonParams.overheadPercent}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground text-sm">
                        {formatINR(result.overhead)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/60 font-medium">
                        {overheadPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* 7. Total Cost */}
                    <tr className="bg-surface-container font-bold border-t-2 border-outline-variant/60">
                      <td className="py-3.5 px-4 text-foreground text-sm">Total Cost</td>
                      <td className="py-3.5 px-4 text-foreground/70" colSpan={2}>
                        Direct Subtotal + Overhead
                      </td>
                      <td className="py-3.5 px-4 text-right text-base text-foreground font-extrabold">
                        {formatINR(result.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-foreground/60">100.0%</td>
                    </tr>

                    {/* 6. Margin */}
                    <tr className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-success flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-success" />
                        <span>Margin (Profit)</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground/70">
                        {commonParams.marginPercent}% on total cost ({formatINR(result.totalCost)})
                      </td>
                      <td className="py-3.5 px-4 text-foreground/80">
                        {commonParams.marginPercent}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-success text-sm">
                        {formatINR(result.margin)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-success font-medium">
                        +{commonParams.marginPercent}%
                      </td>
                    </tr>

                    {/* 8. Suggested Selling Price */}
                    <tr className="bg-primary/10 border-t-2 border-primary/40 font-extrabold">
                      <td className="py-4 px-4 text-primary text-base">
                        Suggested Selling Price
                      </td>
                      <td className="py-4 px-4 text-primary/80 font-medium" colSpan={2}>
                        Total Cost + Margin ({commonParams.marginPercent}%)
                        <span className="block text-xs font-normal text-foreground/60">
                          = {formatINR(result.suggestedSellingPricePerYard)} / yard
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-xl text-primary font-black">
                        {formatINR(result.suggestedSellingPrice)}
                      </td>
                      <td className="py-4 px-4 text-right text-primary text-xs font-semibold">
                        ₹ / meter
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Technical Fabric Physical Specs Card */}
          <Card variant="filled" className="border border-outline-variant/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span>Fabric Physical Specifications (Ichalkaranji Standards)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/30">
                  <div className="text-[10px] text-foreground/60 font-semibold uppercase">
                    Total Ends
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {result.totalEnds}
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    Body: {Math.round(commonParams.epi * commonParams.width)} + 48 selvedge
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/30">
                  <div className="text-[10px] text-foreground/60 font-semibold uppercase">
                    Reed Space
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {result.reedSpace}&quot;
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    Contraction approx. 5.5%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/30">
                  <div className="text-[10px] text-foreground/60 font-semibold uppercase">
                    Total Warp Weight
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {result.warpWeightGrams.toFixed(1)} <span className="text-xs font-normal">g/m</span>
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    {(result.warpWeightGrams / 10).toFixed(2)} kg / 100m
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/30">
                  <div className="text-[10px] text-foreground/60 font-semibold uppercase">
                    Total Weft Weight
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {result.weftWeightGrams.toFixed(1)} <span className="text-xs font-normal">g/m</span>
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    {(result.weftWeightGrams / 10).toFixed(2)} kg / 100m
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/30">
                  <div className="text-[10px] text-foreground/60 font-semibold uppercase">
                    GLM (Linear Wt)
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {result.totalGLM.toFixed(1)} <span className="text-xs font-normal">g/m</span>
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    {(result.totalGLM / 10).toFixed(2)} kg / 100m
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-surface border border-outline-variant/30">
                  <div className="text-[10px] text-foreground/60 font-semibold uppercase">
                    GSM & Ounces
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {result.totalGSM.toFixed(1)} <span className="text-xs font-normal">g/m²</span>
                  </div>
                  <div className="text-[10px] text-foreground/50">
                    {result.ouncesPerSqYard.toFixed(2)} oz/yd²
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant/30 bg-surface-container-low/60 py-6 text-center text-xs text-foreground/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Greige Cloth Costing • Ichalkaranji Multi-Yarn &amp; Butta Architecture • Material Design 3
          </span>
          <span className="text-foreground/50">
            Real Weaving Formulas: Individual Yarn Counts, Extra % Take-up, Sizing on Total Warp
          </span>
        </div>
      </footer>
    </div>
  );
}
