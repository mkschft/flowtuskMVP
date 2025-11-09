"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Lightbulb,
  MessageSquare,
  MapPin,
  Mail,
  Linkedin,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Compact summary data type
type PersonaSegment = {
  label: string;
  matchScore: number;
};

type CompactInsight = {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: string;
};

type CompactPersonaSummary = {
  title: string;
  subtitle: string;
  icpScore: number;
  segments: PersonaSegment[];
  keyInsights: CompactInsight[];
  behaviors: {
    research: string[];
    decisionMaking: string[];
    communication: string[];
  };
  demographics: { label: string; value: string }[];
  // Persona details
  personaName?: string;
  personalityTraits?: PersonalityTrait[];
  buyingSignals?: BuyingSignals;
  personaRole?: string;
  personaCompany?: string;
  personaLocation?: string;
  personaDescription?: string;
  valueProp?: string;
};

type PersonalityTrait = {
  id: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  description: string;
};

type BuyingSignals = {
  budget: {
    range: string;
    authority: string;
    timing: string;
  };
  decisionCriteria: string[];
  competitors: string[];
  triggers: string[];
};

type CompactPersonaCardProps = {
  summary?: CompactPersonaSummary;
  onEmailClick?: () => void;
  onLinkedInClick?: () => void;
  onLandingClick?: () => void;
};

// Mock data - Accounting Firm Owner compact view
const defaultSummary: CompactPersonaSummary = {
  title: "Ideal Customer Profile",
  subtitle: "Mid-Sized Accounting Firm Owners",
  icpScore: 92,
  personaName: "Sarah Chen",
  personaRole: "Managing Partner",
  personaCompany: "Chen & Associates CPAs (12 employees)",
  personaLocation: "Austin, Texas, United States",
  personaDescription: "Owners of mid-sized accounting firms seeking efficient automation solutions to scale their practice.",
  valueProp: "Automate every aspect of your accounting workflows and save 40% of your time, allowing you to focus on growing your client base while reducing errors.",
  segments: [
    { label: "Tax & Accounting Firms", matchScore: 92 },
    { label: "ERP Resellers", matchScore: 68 },
    { label: "Financial Advisors", matchScore: 45 },
  ],
  keyInsights: [
    {
      icon: <AlertCircle className="w-4 h-4" />,
      title: "Top Pain Points",
      color: "red",
      items: [
        "15+ hours/week on admin instead of client work",
        "Difficulty hiring qualified staff",
        "Manual data entry errors",
      ],
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Growth Opportunities",
      color: "green",
      items: [
        "Automate to free 10 hours/week",
        "30% more clients without hiring",
        "Upsell advisory services",
      ],
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Value Props",
      color: "purple",
      items: [
        "Cut admin time in half with AI",
        "Save $45K annually in labor",
        "Bank-level SOC 2 security",
      ],
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Content to Create",
      color: "amber",
      items: [
        "Case study: 40% growth without hiring",
        "ROI calculator tool",
        "3-min platform demo video",
      ],
    },
  ],
  behaviors: {
    research: [
      "Researches via peer recommendations and industry forums",
      "Prefers demos over reading documentation",
    ],
    decisionMaking: [
      "Makes purchase decisions after ROI calculator review",
      "Involves senior accountant in evaluation process",
    ],
    communication: [
      "Responds best to email with clear next steps",
      "Values case studies from similar firm sizes",
    ],
  },
  demographics: [
    { label: "Age Range", value: "38-55" },
    { label: "Location", value: "Mid-sized US cities" },
    { label: "Firm Size", value: "5-15 employees" },
    { label: "Annual Revenue", value: "$800K - $2M" },
  ],
  personalityTraits: [
    {
      id: "risk-tolerance",
      label: "Risk Tolerance",
      leftLabel: "Risk-Averse",
      rightLabel: "Risk-Taker",
      value: 35,
      description: "Prefers proven solutions over experimental ones",
    },
    {
      id: "decision-speed",
      label: "Decision Speed",
      leftLabel: "Cautious",
      rightLabel: "Fast",
      value: 65,
      description: "Makes decisions quickly when ROI is clear",
    },
    {
      id: "tech-adoption",
      label: "Tech Adoption",
      leftLabel: "Late Adopter",
      rightLabel: "Early Adopter",
      value: 55,
      description: "Willing to try new tech if it solves pain",
    },
  ],
  buyingSignals: {
    budget: {
      range: "$300-600/month",
      authority: "Final decision maker",
      timing: "Q1 2025",
    },
    decisionCriteria: [
      "Clear ROI (payback < 6 months)",
      "Easy implementation (< 30 days)",
      "QuickBooks integration required",
      "Bank-level security (SOC 2)",
    ],
    competitors: [
      "Currently using: Manual Excel workflows",
      "Considered: QuickBooks Enterprise ($$$)",
      "Pain: Too expensive, too complex",
    ],
    triggers: [
      "Just hired employee #12 (scaling pain)",
      "Tax season overload (15+ hour weeks)",
      "Looking to grow 30% in 2025",
    ],
  },
};

export function CompactPersonaCard({ 
  summary = defaultSummary,
  onEmailClick,
  onLinkedInClick,
  onLandingClick,
}: CompactPersonaCardProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = async () => {
    const text = `${summary.title}\n${summary.subtitle}\nICP Score: ${summary.icpScore}%`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: "text-red-600 dark:text-red-400",
      green: "text-green-600 dark:text-green-400",
      purple: "text-purple-600 dark:text-purple-400",
      amber: "text-amber-600 dark:text-amber-400",
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Compact Card with Glowing Border */}
      <div className="relative">
        {/* Animated glow effect layers - very subtle glow with slow pulse */}
        <div 
          className="absolute -inset-[1px] bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-2xl opacity-15 blur-md"
          style={{
            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        
        {/* Content container with light pink/purple gradient */}
        <Card className="relative overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
          <div className="p-6 sm:p-8">
            {/* Persona Header Card */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=AccountingOwner42&backgroundColor=transparent&strokeColor=000000`}
                      alt="Persona Avatar"
                      className="w-16 h-16 rounded-full ring-2 ring-purple-200 dark:ring-purple-800 ring-offset-2 ring-offset-background bg-white"
                      style={{ filter: 'contrast(1.2)' }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  
                  {/* Persona Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {summary.personaName || "Persona Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      {summary.personaRole || "Role"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {summary.personaCompany || "Company"}
                    </p>
                    {summary.personaLocation && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {summary.personaLocation}
                      </p>
                    )}
                  </div>
                </div>

                {/* ICP Score Circle Badge */}
                <div className="shrink-0">
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {summary.icpScore}%
                      </div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Match
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {summary.personaDescription && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Mid-sized accounting firm owners seeking automation to scale their practice
                </p>
              )}

              {/* Segment Pills - Enhanced but Refined */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Top Segments:</span>
                {summary.segments.map((segment, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-md bg-purple-100/80 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 shadow-sm"
                  >
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      {segment.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Proposition Card */}
            {summary.valueProp && (
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    ⭐
                  </div>
                  <h4 className="font-bold text-base">Value Proposition</h4>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  "{summary.valueProp}"
                </p>
              </div>
            )}

            {/* More Details Button */}
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  More Details
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* CTA Section - Generate Marketing Assets */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Generate Marketing Assets</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={onEmailClick}
            className="flex flex-col items-center gap-2 h-auto py-6 bg-gradient-to-br from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Mail className="w-6 h-6" />
            <div className="text-center">
              <div className="text-sm font-semibold">Email Sequences</div>
              <div className="text-xs opacity-90">3 ready-to-send</div>
            </div>
          </Button>
          
          <Button
            onClick={onLinkedInClick}
            className="flex flex-col items-center gap-2 h-auto py-6 bg-gradient-to-br from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Linkedin className="w-6 h-6" />
            <div className="text-center">
              <div className="text-sm font-semibold">LinkedIn Posts</div>
              <div className="text-xs opacity-90">5 posts ready</div>
            </div>
          </Button>
          
          <Button
            onClick={onLandingClick}
            className="flex flex-col items-center gap-2 h-auto py-6 bg-gradient-to-br from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Globe className="w-6 h-6" />
            <div className="text-center">
              <div className="text-sm font-semibold">Landing Page</div>
              <div className="text-xs opacity-90">Complete copy</div>
            </div>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Click to generate ready-to-use content personalized for this ICP
        </p>
      </div>

      {/* Layer 1: Expandable Details with Tabs */}
      {showDetails && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <Tabs defaultValue="demographics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="signals">Buying Signals</TabsTrigger>
            </TabsList>

            {/* Demographics Tab */}
            <TabsContent value="demographics">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Demographics & Context</h3>
                <div className="space-y-6">
                  {/* Basic Demographics */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Basic Information</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {summary.demographics.map((demo, idx) => (
                        <div key={idx}>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            {demo.label}
                          </p>
                          <p className="text-sm font-medium">{demo.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Behavioral Patterns */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-sm">Behavioral Patterns</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Research
                        </h5>
                        <div className="space-y-2">
                          {summary.behaviors.research.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2 rounded bg-muted/50 border"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Decision Making
                        </h5>
                        <div className="space-y-2">
                          {summary.behaviors.decisionMaking.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2 rounded bg-muted/50 border"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Communication
                        </h5>
                        <div className="space-y-2">
                          {summary.behaviors.communication.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2 rounded bg-muted/50 border"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Personality Profile</h3>
                {summary.personalityTraits && summary.personalityTraits.length > 0 ? (
                  <div className="space-y-6">
                    {summary.personalityTraits.map((trait) => (
                      <div key={trait.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">{trait.label}</label>
                          <span className="text-xs text-muted-foreground">{trait.value}%</span>
                        </div>
                        <Slider 
                          value={[trait.value]}
                          disabled
                          className="cursor-default"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{trait.leftLabel}</span>
                          <span>{trait.rightLabel}</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">{trait.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No personality data available</p>
                )}
              </Card>
            </TabsContent>

            {/* Buying Signals Tab */}
            <TabsContent value="signals">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Buying Signals</h3>
                {summary.buyingSignals ? (
                  <div className="space-y-6">
                    {/* Budget & Authority */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Budget & Authority</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Budget Range</p>
                          <p className="text-sm font-medium">{summary.buyingSignals.budget.range}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Authority</p>
                          <p className="text-sm font-medium">{summary.buyingSignals.budget.authority}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                          <p className="text-sm font-medium">{summary.buyingSignals.budget.timing}</p>
                        </div>
                      </div>
                    </div>

                    {/* Decision Criteria */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Decision Criteria</h4>
                      <ul className="space-y-2">
                        {summary.buyingSignals.decisionCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                            <span className="text-sm">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Competitive Landscape */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Competitive Landscape</h4>
                      <div className="space-y-2">
                        {summary.buyingSignals.competitors.map((comp, idx) => (
                          <div key={idx} className="text-sm p-2 rounded bg-muted/50 border">
                            {comp}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buying Triggers */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Buying Triggers</h4>
                      <div className="space-y-2">
                        {summary.buyingSignals.triggers.map((trigger, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <span className="text-sm">{trigger}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No buying signals data available</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

