"use client";

import { useWorkflowTab } from "@/app/w/context";
import { ICP } from "@/lib/types/database";

export function PersonaContent({ icp }: { icp: ICP }) {
  const { activeTab } = useWorkflowTab();

  const renderContent = () => {
    switch (activeTab) {
      case "value-proposition":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Value Proposition</h2>
              <p className="text-muted-foreground">
                Content for Value Proposition will appear here.
              </p>
            </div>
          </div>
        );
      case "brand-dna":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Brand DNA</h2>
              <p className="text-muted-foreground">
                Content for Brand DNA will appear here.
              </p>
            </div>
          </div>
        );
      case "suggested-campaigns":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Suggested Campaigns</h2>
              <p className="text-muted-foreground">
                Content for Suggested Campaigns will appear here.
              </p>
            </div>
          </div>
        );
      case "design":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Design</h2>
              <p className="text-muted-foreground">
                Content for Design will appear here.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{icp.persona_name}</h1>
          <p className="text-muted-foreground mt-2">
            {icp.persona_role} at {icp.persona_company}
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

