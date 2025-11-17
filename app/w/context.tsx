"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type TabType = "value-prop" | "style" | "campaigns" | "design";
type SubmenuType = string | null;

// Shortcode mapping
const TAB_SHORTCODES: Record<string, TabType> = {
  vp: "value-prop",
  s: "style",
  c: "campaigns",
  d: "design",
};

const TAB_TO_SHORTCODE: Record<TabType, string> = {
  "value-prop": "vp",
  style: "s",
  campaigns: "c",
  design: "d",
};

interface WorkflowTabContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeSubmenu: SubmenuType;
  setActiveSubmenu: (submenu: SubmenuType) => void;
}

const WorkflowTabContext = createContext<WorkflowTabContextType | undefined>(undefined);

export function WorkflowTabProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    const tabParam = searchParams.get("t");
    if (tabParam && TAB_SHORTCODES[tabParam]) {
      return TAB_SHORTCODES[tabParam];
    }
    return "value-prop";
  });

  const [activeSubmenu, setActiveSubmenuState] = useState<SubmenuType>(() => {
    return searchParams.get("s") || null;
  });

  // Sync with URL params on mount and when searchParams change
  useEffect(() => {
    const tabParam = searchParams.get("t");
    const tabFromUrl = tabParam && TAB_SHORTCODES[tabParam] 
      ? TAB_SHORTCODES[tabParam] 
      : "value-prop";
    setActiveTabState((prev) => prev !== tabFromUrl ? tabFromUrl : prev);

    const submenuFromUrl = searchParams.get("s") || null;
    setActiveSubmenuState((prev) => prev !== submenuFromUrl ? submenuFromUrl : prev);
  }, [searchParams]);

  const setActiveTab = (tab: TabType) => {
    const shortcode = TAB_TO_SHORTCODE[tab];
    const currentTab = searchParams.get("t");
    
    // Only update if different
    if (currentTab !== shortcode) {
      setActiveTabState(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("t", shortcode);
      // Clear submenu when switching tabs
      params.delete("s");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const setActiveSubmenu = (submenu: SubmenuType) => {
    const currentSubmenu = searchParams.get("s");
    
    // Only update if different
    if (currentSubmenu !== submenu) {
      setActiveSubmenuState(submenu);
      const params = new URLSearchParams(searchParams.toString());
      if (submenu) {
        params.set("s", submenu);
      } else {
        params.delete("s");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <WorkflowTabContext.Provider value={{ activeTab, setActiveTab, activeSubmenu, setActiveSubmenu }}>
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

