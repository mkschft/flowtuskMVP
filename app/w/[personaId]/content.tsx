"use client";

import { useWorkflowTab } from "@/app/w/context";
import { ICP } from "@/lib/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, Zap, CheckCircle2, Rocket, Globe, Linkedin, Facebook, Instagram, Twitter, Mail, FileText, Palette, ExternalLink } from "lucide-react";
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
        return (
          <div className="space-y-4">
            {/* Landing Page Card */}
            {icp.website_url && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background border shrink-0">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold">{icp.persona_company}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      A modern SaaS platform designed to streamline workflow automation and enhance team productivity through intelligent process management.
                    </p>
                    <a
                      href={icp.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <span className="truncate">{icp.website_url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            )}

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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Style Guide</h2>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium h-7"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Localized Style Guide</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Select Language & Location</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">English (US)</span>
                        <span className="text-xs text-muted-foreground">United States</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">English (UK)</span>
                        <span className="text-xs text-muted-foreground">United Kingdom</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Spanish (ES)</span>
                        <span className="text-xs text-muted-foreground">Spain</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">French (FR)</span>
                        <span className="text-xs text-muted-foreground">France</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">German (DE)</span>
                        <span className="text-xs text-muted-foreground">Germany</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Japanese (JP)</span>
                        <span className="text-xs text-muted-foreground">Japan</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Chinese (CN)</span>
                        <span className="text-xs text-muted-foreground">China</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span className="text-sm">+ Add Custom Locale</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border hover:bg-accent text-xs font-medium transition-colors h-7"
                  aria-label="Shuffle all styles"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Colors Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">Colors</h2>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-accent" aria-label="Light theme">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </button>
                    <button className="p-1 rounded hover:bg-accent" aria-label="Dark theme">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-2 space-y-2">
                  <div>
                    <h3 className="text-xs font-semibold mb-1">Neutrals</h3>
                    <div className="flex gap-0.5">
                      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <div
                          key={shade}
                          className="flex-1 h-6 rounded border"
                          style={{
                            backgroundColor: shade < 500 ? `hsl(0, 0%, ${100 - shade * 0.1}%)` : `hsl(0, 0%, ${100 - shade * 0.08}%)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="h-8 rounded border mb-1 bg-gradient-to-br from-blue-500 to-cyan-500" />
                      <div className="text-xs font-medium">Azure</div>
                      <div className="text-[10px] text-muted-foreground">#1879ED</div>
                    </div>
                    <div>
                      <div className="h-8 rounded border mb-1 bg-gradient-to-br from-orange-500 to-amber-500" />
                      <div className="text-xs font-medium">Zest</div>
                      <div className="text-[10px] text-muted-foreground">#E17D19</div>
                    </div>
                    <div>
                      <div className="h-8 rounded border mb-1 bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div className="text-xs font-medium">Violet</div>
                      <div className="text-[10px] text-muted-foreground">#BB1CEC</div>
                    </div>
                    <div>
                      <div className="h-8 rounded border mb-1 bg-gradient-to-br from-red-500 to-rose-500" />
                      <div className="text-xs font-medium">Red</div>
                      <div className="text-[10px] text-muted-foreground">#EE221B</div>
                    </div>
                    <div>
                      <div className="h-8 rounded border mb-1 bg-gradient-to-br from-pink-500 to-rose-500" />
                      <div className="text-xs font-medium">Pink</div>
                      <div className="text-[10px] text-muted-foreground">#EE1A7B</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold">Typography</h2>
                  <select className="text-[10px] px-1.5 py-0.5 rounded border bg-background">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>

                <div className="rounded-lg border bg-card p-2 space-y-2">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-xs font-semibold">Heading</h3>
                      <svg className="h-2.5 w-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="text-lg font-bold mb-0.5">Geist Sans</div>
                    <div className="text-[10px] text-muted-foreground">Google Fonts</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-xs font-semibold">Body</h3>
                      <svg className="h-2.5 w-2.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="text-sm font-sans mb-0.5">Geist Sans</div>
                    <div className="text-[10px] text-muted-foreground">Google Fonts</div>
                  </div>
                </div>
              </div>

              {/* UI Styling Section */}
              <div className="space-y-2">
                <h2 className="text-sm font-bold">UI Styling</h2>

                <div className="rounded-lg border bg-card p-2 space-y-2">
                  <div>
                    <h3 className="text-xs font-semibold mb-1.5">Buttons & Forms</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <button className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium hover:opacity-90">
                        Button
                      </button>
                      <button className="px-3 py-1.5 rounded-full border text-[10px] font-medium hover:bg-accent">
                        Button
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-medium">Label</label>
                      <input
                        type="text"
                        placeholder="Placeholder"
                        className="w-full px-2 py-1.5 text-[10px] rounded-lg border bg-background"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-1.5">Cards</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="h-12 rounded-lg border bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                        <div className="text-[10px] font-medium">Flat</div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-12 rounded-lg border bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                        <div className="text-[10px] font-medium">Elevated</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-1.5">Card Style</h3>
                    <div className="space-y-1.5">
                      <div className="rounded-lg border bg-card p-2">
                        <div className="text-[10px] font-medium mb-0.5">Default Card</div>
                        <div className="text-[10px] text-muted-foreground">Standard card with border</div>
                      </div>
                      <div className="rounded-lg border-2 border-primary/20 bg-card p-2">
                        <div className="text-[10px] font-medium mb-0.5">Accent Card</div>
                        <div className="text-[10px] text-muted-foreground">Card with accent border</div>
                      </div>
                      <div className="rounded-lg bg-muted p-2">
                        <div className="text-[10px] font-medium mb-0.5">Muted Card</div>
                        <div className="text-[10px] text-muted-foreground">Card with muted background</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

