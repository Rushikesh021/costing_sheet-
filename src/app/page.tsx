"use client";

import * as React from "react";
import { CostingHeader } from "@/components/costing/CostingHeader";
import { CostSummaryCards } from "@/components/costing/CostSummaryCards";
import { CostBreakdownChart } from "@/components/costing/CostBreakdownChart";
import { FabricSpecsForm } from "@/components/costing/FabricSpecsForm";
import { YarnRatesForm } from "@/components/costing/YarnRatesForm";
import { WeavingChargesForm } from "@/components/costing/WeavingChargesForm";
import { CommercialsForm } from "@/components/costing/CommercialsForm";
import { SensitivityAnalysis } from "@/components/costing/SensitivityAnalysis";
import { YarnMasterModal } from "@/components/costing/YarnMasterModal";
import { CompareModal } from "@/components/costing/CompareModal";
import { PrintQuoteModal } from "@/components/costing/PrintQuoteModal";
import { SavedQuotesDrawer } from "@/components/costing/SavedQuotesDrawer";
import { SaveCostingModal } from "@/components/costing/SaveCostingModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FABRIC_PRESETS } from "@/lib/presets";
import {
  FabricSpecs,
  YarnRates,
  WeavingCharges,
  Commercials,
  CurrencyCode,
  SavedCostingSheet,
} from "@/lib/types";
import { calculateGreigeCosting } from "@/lib/costing-calculator";
import {
  Grid,
  Coins,
  Factory,
  Briefcase,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "greige_costing_sheets_v1";

export default function GreigeCostingDashboard() {
  const initialPreset = FABRIC_PRESETS[0];

  const [specs, setSpecs] = React.useState<FabricSpecs>(initialPreset.specs);
  const [yarnRates, setYarnRates] = React.useState<YarnRates>(initialPreset.yarnRates);
  const [weaving, setWeaving] = React.useState<WeavingCharges>(initialPreset.weavingCharges);
  const [commercials, setCommercials] = React.useState<Commercials>(initialPreset.commercials);
  const [currency, setCurrency] = React.useState<CurrencyCode>("USD");
  const [activeTab, setActiveTab] = React.useState<string>("specs");

  // Modals & Drawers state
  const [isPrintOpen, setIsPrintOpen] = React.useState<boolean>(false);
  const [isYarnMasterOpen, setIsYarnMasterOpen] = React.useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = React.useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = React.useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState<boolean>(false);

  // Saved Costings
  const [savedSheets, setSavedSheets] = React.useState<SavedCostingSheet[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Load saved sheets on mount
  React.useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedSheets(JSON.parse(data));
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Perform Calculations
  const results = React.useMemo(() => {
    return calculateGreigeCosting(specs, yarnRates, weaving, commercials);
  }, [specs, yarnRates, weaving, commercials]);

  // Handlers
  const handleLoadPreset = (presetId: string) => {
    const preset = FABRIC_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSpecs(preset.specs);
    setYarnRates(preset.yarnRates);
    setWeaving(preset.weavingCharges);
    setCommercials(preset.commercials);
    setCurrency(preset.commercials.currency);
    showToast(`Loaded preset: ${preset.name}`);
  };

  const handleResetToDefault = () => {
    setSpecs(initialPreset.specs);
    setYarnRates(initialPreset.yarnRates);
    setWeaving(initialPreset.weavingCharges);
    setCommercials(initialPreset.commercials);
    setCurrency("USD");
    showToast("Reset to default Poplin 40x40 specifications");
  };

  const handleSaveSheet = (
    title: string,
    referenceNumber: string,
    status: "Draft" | "Reviewed" | "Quoted" | "Confirmed"
  ) => {
    const newSheet: SavedCostingSheet = {
      id: `sheet-${Date.now()}`,
      title,
      referenceNumber,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status,
      specs: { ...specs },
      yarnRates: { ...yarnRates },
      weavingCharges: { ...weaving },
      commercials: { ...commercials },
      results: { ...results },
    };

    const updated = [newSheet, ...savedSheets];
    setSavedSheets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // LocalStorage error
    }
    showToast(`Saved "${title}" (${referenceNumber})`);
  };

  const handleLoadSavedSheet = (sheet: SavedCostingSheet) => {
    setSpecs(sheet.specs);
    setYarnRates(sheet.yarnRates);
    setWeaving(sheet.weavingCharges);
    setCommercials(sheet.commercials);
    if (sheet.commercials?.currency) {
      setCurrency(sheet.commercials.currency);
    }
    showToast(`Loaded saved sheet: ${sheet.title}`);
  };

  const handleDeleteSavedSheet = (id: string) => {
    const updated = savedSheets.filter((s) => s.id !== id);
    setSavedSheets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // LocalStorage error
    }
    showToast("Costing sheet deleted");
  };

  const handleDuplicateSheet = (sheet: SavedCostingSheet) => {
    const duplicated: SavedCostingSheet = {
      ...sheet,
      id: `sheet-${Date.now()}`,
      title: `${sheet.title} (Copy)`,
      referenceNumber: `${sheet.referenceNumber}-CP`,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
    const updated = [duplicated, ...savedSheets];
    setSavedSheets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // LocalStorage error
    }
    showToast(`Duplicated "${sheet.title}"`);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(savedSheets, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `greige-costing-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported all costing sheets to JSON file");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setSavedSheets(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          showToast(`Imported ${parsed.length} costing sheets`);
        }
      } catch {
        alert("Invalid JSON file format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground selection:bg-primary/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-2xl shadow-md-4 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <CostingHeader
        currentCurrency={currency}
        onCurrencyChange={(curr) => setCurrency(curr)}
        onLoadPreset={handleLoadPreset}
        onOpenSavedQuotes={() => setIsSavedDrawerOpen(true)}
        onOpenYarnMaster={() => setIsYarnMasterOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenPrintModal={() => setIsPrintOpen(true)}
        savedCount={savedSheets.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quality Banner & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface-container-low border border-outline-variant/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {specs.qualityName || "Greige Fabric Construction"}
              </h2>
              <Badge variant="outline" className="text-xs">
                {specs.weaveType}
              </Badge>
              {specs.buyerName && (
                <Badge variant="tertiary" className="text-xs hidden md:inline-flex">
                  Buyer: {specs.buyerName}
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground/60">
              {specs.warpCount}s x {specs.weftCount}s / {specs.epi} x {specs.ppi} • {specs.greigeWidth}&quot; Width • {results.totalGSM.toFixed(1)} GSM ({results.ouncesPerSqYard.toFixed(2)} oz/yd²)
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              title="Reset inputs to initial default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSaveModalOpen(true)}
              title="Save current costing sheet"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Costing</span>
            </Button>
          </div>
        </div>

        {/* 1. Master Metric Cards */}
        <CostSummaryCards results={results} currency={currency} />

        {/* 2. Interactive Charts & Weight Distribution */}
        <CostBreakdownChart results={results} currency={currency} />

        {/* 3. Detailed Parameter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="specs" icon={<Grid className="h-4 w-4" />}>
              Fabric Specs
            </TabsTrigger>
            <TabsTrigger value="yarn" icon={<Coins className="h-4 w-4" />}>
              Yarn & Wastage
            </TabsTrigger>
            <TabsTrigger value="weaving" icon={<Factory className="h-4 w-4" />}>
              Weaving & Overheads
            </TabsTrigger>
            <TabsTrigger value="commercials" icon={<Briefcase className="h-4 w-4" />}>
              Commercials & Order
            </TabsTrigger>
            <TabsTrigger value="analysis" icon={<Sliders className="h-4 w-4" />}>
              Sensitivity & What-If
            </TabsTrigger>
          </TabsList>

          <TabsContent value="specs">
            <FabricSpecsForm
              specs={specs}
              onChange={(updated) => setSpecs((prev) => ({ ...prev, ...updated }))}
              calculatedEnds={results.totalEnds}
              coverFactor={results.greigeCoverFactor}
            />
          </TabsContent>

          <TabsContent value="yarn">
            <YarnRatesForm
              yarnRates={yarnRates}
              onChange={(updated) => setYarnRates((prev) => ({ ...prev, ...updated }))}
              currency={currency}
              warpCostPerM={results.warpYarnCostPerMeter}
              weftCostPerM={results.weftYarnCostPerMeter}
              sizingCostPerM={results.sizingCostPerMeter}
              totalYarnKg={results.totalWarpYarnRequiredKg + results.totalWeftYarnRequiredKg}
            />
          </TabsContent>

          <TabsContent value="weaving">
            <WeavingChargesForm
              weaving={weaving}
              onChange={(updated) => setWeaving((prev) => ({ ...prev, ...updated }))}
              currency={currency}
              metersPerDay={results.metersPerLoomPerDay}
              totalConversionM={results.totalConversionCostPerMeter}
            />
          </TabsContent>

          <TabsContent value="commercials">
            <CommercialsForm
              commercials={commercials}
              onChange={(updated) =>
                setCommercials((prev) => ({ ...prev, ...updated }))
              }
              currency={currency}
              totalOrderProfit={results.totalOrderProfit}
              totalOrderValue={results.totalOrderValue}
              loomsRequired={results.loomsRequiredForLeadTime}
              daysToCompleteOn10Looms={results.daysToCompleteOrderOn10Looms}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <SensitivityAnalysis
              specs={specs}
              yarnRates={yarnRates}
              weaving={weaving}
              commercials={commercials}
              currency={currency}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant/40 bg-surface-container-low/50 py-6 text-center text-xs text-foreground/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Greige Costing System • Next.js 14 App Router • Material Design 3 Style
          </span>
          <span>ASTM D1907 & ISO 2060 Textile Standards Engine</span>
        </div>
      </footer>

      {/* Modals */}
      <PrintQuoteModal
        open={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        specs={specs}
        yarnRates={yarnRates}
        weaving={weaving}
        commercials={commercials}
        results={results}
        currency={currency}
      />

      <YarnMasterModal
        open={isYarnMasterOpen}
        onClose={() => setIsYarnMasterOpen(false)}
      />

      <CompareModal
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        activeSpecs={specs}
        activeYarnRates={yarnRates}
        activeWeaving={weaving}
        activeCommercials={commercials}
        currency={currency}
      />

      <SavedQuotesDrawer
        open={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedSheets={savedSheets}
        onLoadSheet={handleLoadSavedSheet}
        onDeleteSheet={handleDeleteSavedSheet}
        onDuplicateSheet={handleDuplicateSheet}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        currency={currency}
      />

      <SaveCostingModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultTitle={specs.qualityName || "Greige Fabric Costing"}
        defaultBuyer={specs.buyerName || ""}
        onSave={handleSaveSheet}
      />
    </div>
  );
}
