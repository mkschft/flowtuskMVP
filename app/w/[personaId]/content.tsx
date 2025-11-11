"use client";

import { useWorkflowTab } from "@/app/w/context";
import { ICP } from "@/lib/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, Zap, CheckCircle2, Rocket } from "lucide-react";
import { useState } from "react";

function getInitials(name: string): string {
  if (!name) return "?";
  const cleaned = name.trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const letters = cleaned.replace(/[^a-zA-Z]/g, "");
  return (letters.slice(0, 2) || cleaned.slice(0, 2)).toUpperCase();
}

export function PersonaContent({ icp }: { icp: ICP }) {
  const { activeTab } = useWorkflowTab();
  const [copiedRow, setCopiedRow] = useState<string | null>(null);

  const handleCopyRow = async (content: string, rowId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedRow(rowId);
      setTimeout(() => setCopiedRow(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateValuePropContent = () => {
    const who = `${icp.persona_name} (${icp.persona_role}) at ${icp.persona_company}`;
    const pain = icp.pain_points.join(", ");
    const solution = icp.description || "Our solution addresses your specific needs.";
    const whyUs = `Fit Score: ${icp.fit_score}% | ${icp.profiles_found}+ profiles found`;

    return { who, pain, solution, whyUs };
  };

  const renderContent = () => {
    switch (activeTab) {
      case "value-prop":
        return (
          <div className="space-y-4">
            {/* Name and Position */}
            <div className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={undefined} alt={icp.persona_name} />
                  <AvatarFallback className="rounded-lg text-sm">
                    {getInitials(icp.persona_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{icp.persona_name}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {icp.persona_role} at {icp.persona_company}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Description</h3>
                  <p className="text-xs text-muted-foreground">{icp.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">Location</h3>
                  <p className="text-xs text-muted-foreground">
                    {icp.location}, {icp.country}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">Category</h3>
                  <p className="text-xs text-muted-foreground">{icp.title}</p>
                </div>

                {icp.website_url && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Website</h3>
                    <p className="text-xs text-muted-foreground">
                      <a href={icp.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {icp.website_url}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Pain Points</h3>
                  <ul className="space-y-0.5">
                    {icp.pain_points.map((pain: string, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground">
                        • {pain}
                      </li>
                    ))}
                  </ul>
                </div>

                {icp.goals && icp.goals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Goals</h3>
                    <ul className="space-y-0.5">
                      {icp.goals.map((goal: string, index: number) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          • {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-3 border-t">
              <div className="text-xs">
                <span className="font-medium">Fit Score:</span> {icp.fit_score}%
              </div>
              <div className="text-xs">
                <span className="font-medium">Profiles Found:</span> {icp.profiles_found}+
              </div>
            </div>

            {/* Value Proposition Framework */}
            <div className="pt-4">
              <h2 className="text-lg font-bold mb-1">Value Proposition Framework</h2>
              <p className="text-xs text-muted-foreground mb-2">
                Click any row to copy the content
              </p>
              
              <div className="rounded-lg border bg-card">
                {(() => {
                  const { who, pain, solution, whyUs } = generateValuePropContent();
                  const frameworkRows = [
                    {
                      id: "who",
                      icon: Target,
                      title: "Who",
                      content: who,
                    },
                    {
                      id: "pain",
                      icon: Zap,
                      title: "Pain",
                      content: pain,
                    },
                    {
                      id: "solution",
                      icon: CheckCircle2,
                      title: "Solution",
                      content: solution,
                    },
                    {
                      id: "why-us",
                      icon: Rocket,
                      title: "Why Us",
                      content: whyUs,
                    },
                  ];

                  return (
                    <div className="divide-y">
                      {frameworkRows.map((row, index) => {
                        const Icon = row.icon;
                        const isCopied = copiedRow === row.id;
                        return (
                          <div
                            key={row.id}
                            onClick={() => handleCopyRow(row.content, row.id)}
                            className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                          >
                            <div className="mt-0.5">
                              <Icon className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold mb-0.5">{row.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {row.content}
                              </p>
                            </div>
                            {isCopied && (
                              <span className="text-xs text-primary">Copied!</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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

