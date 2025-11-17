"use client";

import { useWorkflowTab } from "@/app/w/context";
import { ICP, Site } from "@/lib/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, Zap, CheckCircle2, Rocket, Globe, Linkedin, Facebook, Instagram, Twitter, Mail, FileText, Palette, ExternalLink, Building2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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

export function PersonaContent({ icp, selectedSite }: { icp: ICP; selectedSite?: Site | null }) {
  const { activeTab, activeSubmenu } = useWorkflowTab();
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

  const generateCampaignSuggestions = () => {
    const role = icp.persona_role.toLowerCase();
    const company = icp.persona_company.toLowerCase();
    const title = icp.title.toLowerCase();
    const campaigns = [];

    // LinkedIn - for B2B, founders, executives, professionals
    if (
      role.includes("founder") ||
      role.includes("ceo") ||
      role.includes("cto") ||
      role.includes("executive") ||
      role.includes("director") ||
      role.includes("manager") ||
      title.includes("startup") ||
      title.includes("saas") ||
      title.includes("b2b")
    ) {
      campaigns.push({
        id: "linkedin",
        platform: "LinkedIn",
        icon: Linkedin,
        reason: `${icp.persona_role}s like ${icp.persona_name} are highly active on LinkedIn for professional networking and business insights. This platform offers precise targeting for B2B audiences and decision-makers.`,
        color: "from-blue-600 to-blue-700",
      });
    }

    // Facebook/Instagram - for ecommerce, consumer brands, small businesses
    if (
      title.includes("ecommerce") ||
      title.includes("retail") ||
      title.includes("consumer") ||
      role.includes("owner") ||
      role.includes("merchant") ||
      company.includes("shop") ||
      company.includes("store")
    ) {
      campaigns.push({
        id: "facebook",
        platform: "Facebook & Instagram",
        icon: Facebook,
        reason: `Perfect for reaching ${icp.persona_role}s in ecommerce and retail. These platforms excel at visual storytelling and have advanced targeting for consumer behavior and interests.`,
        color: "from-blue-500 to-indigo-600",
      });
    }

    // Twitter/X - for tech, startups, thought leaders
    if (
      role.includes("founder") ||
      role.includes("developer") ||
      role.includes("engineer") ||
      title.includes("tech") ||
      title.includes("startup") ||
      title.includes("saas")
    ) {
      campaigns.push({
        id: "twitter",
        platform: "Twitter / X",
        icon: Twitter,
        reason: `${icp.persona_role}s in tech and startups are highly engaged on Twitter for real-time updates, industry news, and thought leadership. Great for building brand awareness.`,
        color: "from-black to-gray-800",
      });
    }

    // Cold Email - always relevant for B2B
    if (
      role.includes("founder") ||
      role.includes("ceo") ||
      role.includes("director") ||
      role.includes("manager") ||
      title.includes("b2b") ||
      title.includes("saas")
    ) {
      campaigns.push({
        id: "email",
        platform: "Cold Email",
        icon: Mail,
        reason: `Direct outreach to ${icp.persona_role}s like ${icp.persona_name} is highly effective. Personalized cold emails can cut through the noise and reach decision-makers directly.`,
        color: "from-green-600 to-emerald-700",
      });
    }

    // Pitch Deck - for investors, founders, executives
    if (
      role.includes("founder") ||
      role.includes("ceo") ||
      role.includes("investor") ||
      role.includes("vc") ||
      title.includes("startup") ||
      title.includes("funding")
    ) {
      campaigns.push({
        id: "pitch-deck",
        platform: "Pitch Deck",
        icon: FileText,
        reason: `${icp.persona_role}s evaluating solutions need clear, compelling presentations. A well-designed pitch deck can effectively communicate value propositions and drive decisions.`,
        color: "from-purple-600 to-pink-600",
      });
    }

    // Instagram - for visual brands, lifestyle, consumer products
    if (
      title.includes("lifestyle") ||
      title.includes("fashion") ||
      title.includes("beauty") ||
      title.includes("consumer") ||
      role.includes("creative")
    ) {
      campaigns.push({
        id: "instagram",
        platform: "Instagram",
        icon: Instagram,
        reason: `Visual storytelling on Instagram resonates with ${icp.persona_role}s in consumer-facing industries. The platform's engagement rates and visual format are ideal for brand building.`,
        color: "from-pink-500 to-purple-600",
      });
    }

    // Default campaigns if none match
    if (campaigns.length === 0) {
      campaigns.push(
        {
          id: "linkedin",
          platform: "LinkedIn",
          icon: Linkedin,
          reason: `LinkedIn is the premier platform for reaching ${icp.persona_role}s professionally. With precise targeting and high engagement, it's ideal for B2B outreach.`,
          color: "from-blue-600 to-blue-700",
        },
        {
          id: "email",
          platform: "Cold Email",
          icon: Mail,
          reason: `Direct email outreach to ${icp.persona_role}s like ${icp.persona_name} allows for personalized messaging and direct engagement with decision-makers.`,
          color: "from-green-600 to-emerald-700",
        }
      );
    }

    return campaigns;
  };

  const getAllAvailableCampaigns = () => {
    return [
      {
        id: "linkedin",
        platform: "LinkedIn",
        icon: Linkedin,
        reason: `LinkedIn is the premier platform for professional networking and B2B outreach. Perfect for reaching ${icp.persona_role}s in business environments.`,
        color: "from-blue-600 to-blue-700",
      },
      {
        id: "facebook",
        platform: "Facebook & Instagram",
        icon: Facebook,
        reason: `Facebook and Instagram offer powerful targeting capabilities for reaching ${icp.persona_role}s through visual content and social engagement.`,
        color: "from-blue-500 to-indigo-600",
      },
      {
        id: "twitter",
        platform: "Twitter / X",
        icon: Twitter,
        reason: `Twitter/X is ideal for real-time engagement and thought leadership. Great for connecting with ${icp.persona_role}s who value industry insights.`,
        color: "from-black to-gray-800",
      },
      {
        id: "instagram",
        platform: "Instagram",
        icon: Instagram,
        reason: `Instagram excels at visual storytelling and brand building. Perfect for reaching ${icp.persona_role}s through engaging visual content.`,
        color: "from-pink-500 to-purple-600",
      },
      {
        id: "email",
        platform: "Cold Email",
        icon: Mail,
        reason: `Direct email outreach allows for personalized messaging to ${icp.persona_role}s like ${icp.persona_name}. Highly effective for B2B communication.`,
        color: "from-green-600 to-emerald-700",
      },
      {
        id: "pitch-deck",
        platform: "Pitch Deck",
        icon: FileText,
        reason: `Pitch decks are essential for presenting value propositions to ${icp.persona_role}s. Create compelling presentations that drive decisions.`,
        color: "from-purple-600 to-pink-600",
      },
    ];
  };

  const renderContent = () => {
    switch (activeTab) {
      case "value-prop":
        // Show business overview when business-overview submenu is active
        if (activeSubmenu === "business-overview") {
          if (!selectedSite) {
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <h1 className="text-2xl font-bold">Business Overview</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      No site data available
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No site has been scraped for this flow yet. Submit a URL in the chat to analyze a website.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <Building2 className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h1 className="text-2xl font-bold">Business Overview</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedSite.title || selectedSite.url}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  {selectedSite.url && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Website URL</h3>
                      <p className="text-xs text-muted-foreground">
                        <a
                          href={selectedSite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedSite.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  )}

                  {selectedSite.title && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Title</h3>
                      <p className="text-xs text-muted-foreground">{selectedSite.title}</p>
                    </div>
                  )}

                  {selectedSite.summary && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Summary</h3>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedSite.summary}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedSite.language && (
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Language</h3>
                      <p className="text-xs text-muted-foreground">{selectedSite.language}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Default: Show Persona (ICP) content
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
      case "style":
        // Show colors content when colors submenu is active
        if (activeSubmenu === "colors") {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Colors</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Color palette and theme settings for {icp.persona_company}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Palette className="h-3.5 w-3.5 mr-1.5" />
                    Export Palette
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Neutrals */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Neutrals</h3>
                    <div className="rounded-lg border bg-card p-4">
                      <div className="grid grid-cols-10 gap-1">
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                          <div key={shade} className="space-y-1">
                            <div
                              className="h-12 rounded border cursor-pointer hover:ring-2 hover:ring-ring transition-all"
                              style={{
                                backgroundColor: shade < 500 ? `hsl(0, 0%, ${100 - shade * 0.1}%)` : `hsl(0, 0%, ${100 - shade * 0.08}%)`,
                              }}
                              title={`Neutral ${shade}`}
                            />
                            <div className="text-[10px] text-center text-muted-foreground">{shade}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accent Colors */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Accent Colors</h3>
                    <div className="rounded-lg border bg-card p-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: "Azure", color: "from-blue-500 to-cyan-500", hex: "#1879ED" },
                          { name: "Zest", color: "from-orange-500 to-amber-500", hex: "#E17D19" },
                          { name: "Violet", color: "from-purple-500 to-pink-500", hex: "#BB1CEC" },
                          { name: "Red", color: "from-red-500 to-rose-500", hex: "#EE221B" },
                          { name: "Pink", color: "from-pink-500 to-rose-500", hex: "#EE1A7B" },
                          { name: "Green", color: "from-green-500 to-emerald-500", hex: "#10B981" },
                        ].map((colorItem) => (
                          <div
                            key={colorItem.name}
                            className="space-y-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                          >
                            <div className={`h-16 rounded-lg border bg-gradient-to-br ${colorItem.color}`} />
                            <div>
                              <div className="text-xs font-medium">{colorItem.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{colorItem.hex}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Theme Preview</h3>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Default style content (when no submenu or other submenus)
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">Select a style option from the submenu above.</p>
          </div>
        );
      case "campaigns":
        const campaignSuggestions = generateCampaignSuggestions();
        const allAvailableCampaigns = getAllAvailableCampaigns();
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Recommended Campaigns</h2>
                <p className="text-sm text-muted-foreground">
                  AI-generated campaign suggestions tailored for {icp.persona_name}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {campaignSuggestions.map((campaign) => {
                  const Icon = campaign.icon;
                  return (
                    <div
                      key={campaign.id}
                      className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${campaign.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{campaign.platform}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Recommended for this persona
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {campaign.reason}
                      </p>
                      <Button
                        size="sm"
                        className="w-full rounded-full text-sm h-9"
                        variant="outline"
                      >
                        <Palette className="h-4 w-4 mr-1.5" />
                        Design Campaign
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Available Campaigns</h2>
                <p className="text-sm text-muted-foreground">
                  All available campaign platforms you can use
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {allAvailableCampaigns.map((campaign) => {
                  const Icon = campaign.icon;
                  const isRecommended = campaignSuggestions.some(c => c.id === campaign.id);
                  return (
                    <div
                      key={campaign.id}
                      className="rounded-lg border bg-card p-3 space-y-2 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${campaign.color} shrink-0`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-xs truncate">{campaign.platform}</h3>
                          {isRecommended && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Recommended
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                        {campaign.reason}
                      </p>
                      <Button
                        size="sm"
                        className="w-full rounded-full text-xs h-8"
                        variant="outline"
                      >
                        <Palette className="h-3.5 w-3.5 mr-1.5" />
                        Design
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
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

