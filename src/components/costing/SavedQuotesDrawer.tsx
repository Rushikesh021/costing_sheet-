"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavedCostingSheet, CurrencyCode } from "@/lib/types";
import { formatCurrency } from "@/lib/costing-calculator";
import {
  FolderOpen,
  Trash2,
  Copy,
  Upload,
  Download,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface SavedQuotesDrawerProps {
  open: boolean;
  onClose: () => void;
  savedSheets: SavedCostingSheet[];
  onLoadSheet: (sheet: SavedCostingSheet) => void;
  onDeleteSheet: (id: string) => void;
  onDuplicateSheet: (sheet: SavedCostingSheet) => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency: CurrencyCode;
}

export function SavedQuotesDrawer({
  open,
  onClose,
  savedSheets,
  onLoadSheet,
  onDeleteSheet,
  onDuplicateSheet,
  onExportJSON,
  onImportJSON,
  currency,
}: SavedQuotesDrawerProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Saved Costing Sheets & Quotation History"
      description="Manage, load, duplicate, or backup your textile fabric costing records."
      maxWidth="2xl"
    >
      <div className="space-y-4 pt-2">
        {/* Actions bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container border border-outline-variant/40">
          <span className="text-xs font-semibold text-foreground/80">
            {savedSheets.length} Saved Costing{savedSheets.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJSON}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportJSON}
              disabled={savedSheets.length === 0}
              title="Backup all costings to JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Backup JSON</span>
            </Button>
          </div>
        </div>

        {/* List of saved sheets */}
        {savedSheets.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <FolderOpen className="h-10 w-10 text-foreground/40 mx-auto" />
            <p className="text-sm font-semibold text-foreground">No Saved Costing Sheets</p>
            <p className="text-xs text-foreground/60 max-w-sm mx-auto">
              Save your current calculations using the &quot;Save Costing&quot; button on the main dashboard to keep records here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {savedSheets.map((sheet) => (
              <div
                key={sheet.id}
                className="p-4 rounded-2xl bg-surface-container border border-outline-variant/40 hover:border-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {sheet.title || sheet.specs.qualityName}
                    </h4>
                    <Badge variant="default" className="text-[10px]">
                      {sheet.referenceNumber}
                    </Badge>
                  </div>
                  <div className="text-xs text-foreground/70 flex items-center gap-2">
                    <span>
                      {sheet.specs.warpCount}x{sheet.specs.weftCount} / {sheet.specs.epi}x{sheet.specs.ppi} ({sheet.results.totalGSM.toFixed(0)} GSM)
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(sheet.results.netSellingPricePerMeter, currency, 3)}/m
                    </span>
                  </div>
                  <div className="text-[10px] text-foreground/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {sheet.date} {sheet.specs.buyerName ? `• ${sheet.specs.buyerName}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDuplicateSheet(sheet)}
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteSheet(sheet.id)}
                    className="hover:text-error hover:border-error/40"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onLoadSheet(sheet);
                      onClose();
                    }}
                    title="Load into workspace"
                  >
                    <span>Load</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
