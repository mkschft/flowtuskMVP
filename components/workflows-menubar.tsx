"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorkflowTab } from "@/app/w/context";

export function WorkflowsMenubar() {
  const { activeTab, setActiveTab } = useWorkflowTab();

  return (
    <div className="border-b bg-background px-4 py-2">
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(value) => {
          if (value) setActiveTab(value as typeof activeTab);
        }}
        className="w-full justify-start"
        variant="default"
        size="default"
      >
        <ToggleGroupItem value="value-prop" aria-label="Value Prop" className="text-xs px-3 h-7">
          Value Prop
        </ToggleGroupItem>
        <ToggleGroupItem value="mood-board" aria-label="Mood board" className="text-xs px-3 h-7">
          Mood board
        </ToggleGroupItem>
        <ToggleGroupItem value="style" aria-label="Style" className="text-xs px-3 h-7">
          Style
        </ToggleGroupItem>
        <ToggleGroupItem value="campaigns" aria-label="Campaigns" className="text-xs px-3 h-7">
          Campaigns
        </ToggleGroupItem>
        <ToggleGroupItem value="design" aria-label="Design" className="text-xs px-3 h-7">
          Design
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

