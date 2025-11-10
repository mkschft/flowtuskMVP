"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TabType = "value-proposition" | "brand-dna" | "suggested-campaigns" | "design";

interface WorkflowTabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const WorkflowTabContext = createContext<WorkflowTabContextType | undefined>(undefined);

export function WorkflowTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>("value-proposition");

  return (
    <WorkflowTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </WorkflowTabContext.Provider>
  );
}

export function useWorkflowTab() {
  const context = useContext(WorkflowTabContext);
  if (context === undefined) {
    throw new Error("useWorkflowTab must be used within a WorkflowTabProvider");
  }
  return context;
}

