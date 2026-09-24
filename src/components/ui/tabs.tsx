"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const currentTab = value !== undefined ? value : internalValue;

  const setActiveTab = React.useCallback(
    (id: string) => {
      if (onValueChange) onValueChange(id);
      else setInternalValue(id);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab }}>
      <div className={cn("w-full flex flex-col space-y-4", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-container border border-outline-variant/40 overflow-x-auto max-w-full scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  icon,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-2 text-xs md:text-sm font-medium transition-all duration-200 select-none gap-2",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm font-semibold"
          : "text-foreground/70 hover:text-foreground hover:bg-surface-container-high/60",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div className={cn("focus-visible:outline-none animate-in fade-in duration-200", className)}>
      {children}
    </div>
  );
}
