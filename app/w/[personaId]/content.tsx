"use client";

import { useWorkflowTab } from "@/app/w/context";
import { ICP } from "@/lib/types/database";

export function PersonaContent({ icp }: { icp: ICP }) {
  const { activeTab } = useWorkflowTab();

  const renderContent = () => {
    switch (activeTab) {
      case "value-prop":
        return (
          <div className="space-y-6">
            {/* Name and Position */}
            <div className="pb-4 border-b">
              <h1 className="text-3xl font-bold">{icp.persona_name}</h1>
              <p className="text-muted-foreground mt-2">
                {icp.persona_role} at {icp.persona_company}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{icp.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    {icp.location}, {icp.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Category</h3>
                  <p className="text-sm text-muted-foreground">{icp.title}</p>
                </div>

                {icp.website_url && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Website</h3>
                    <p className="text-sm text-muted-foreground">
                      <a href={icp.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {icp.website_url}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Pain Points</h3>
                  <ul className="space-y-1">
                    {icp.pain_points.map((pain: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {pain}
                      </li>
                    ))}
                  </ul>
                </div>

                {icp.goals && icp.goals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Goals</h3>
                    <ul className="space-y-1">
                      {icp.goals.map((goal: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium">Fit Score:</span> {icp.fit_score}%
              </div>
              <div className="text-sm">
                <span className="font-medium">Profiles Found:</span> {icp.profiles_found}+
              </div>
            </div>
          </div>
        );
      case "mood-board":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Content for Mood board will appear here.
            </p>
          </div>
        );
      case "style":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Content for Style will appear here.
            </p>
          </div>
        );
      case "campaigns":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Content for Campaigns will appear here.
            </p>
          </div>
        );
      case "design":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Content for Design will appear here.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {renderContent()}
      </div>
    </div>
  );
}

