"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Save } from "lucide-react";

interface SaveCostingModalProps {
  open: boolean;
  onClose: () => void;
  defaultTitle: string;
  defaultBuyer: string;
  onSave: (title: string, ref: string, status: "Draft" | "Reviewed" | "Quoted" | "Confirmed") => void;
}

export function SaveCostingModal({
  open,
  onClose,
  defaultTitle,
  defaultBuyer,
  onSave,
}: SaveCostingModalProps) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [reference, setReference] = React.useState(
    `GC-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [status, setStatus] = React.useState<"Draft" | "Reviewed" | "Quoted" | "Confirmed">(
    "Draft"
  );

  React.useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title || "Greige Fabric Costing", reference, status);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Save Costing Sheet"
      description="Save this costing calculation to local storage for quick recall, comparison, and quotation history."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Costing Sheet Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cotton Poplin 40x40 Inquiry"
          required
        />
        <Input
          label="Reference / Quotation Code"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. GC-4021"
          required
        />
        <Select
          label="Costing Status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "Draft" | "Reviewed" | "Quoted" | "Confirmed")
          }
          options={[
            { label: "Draft (Internal Estimation)", value: "Draft" },
            { label: "Reviewed (Technical Mill Approved)", value: "Reviewed" },
            { label: "Quoted (Sent to Buyer)", value: "Quoted" },
            { label: "Confirmed (Order Booked)", value: "Confirmed" },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <Save className="h-4 w-4" />
            <span>Save Sheet</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
