"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Target,
  AlertCircle,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// TypeScript interfaces
type PersonalityTrait = {
  id: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  description: string;
};

type Motivation = {
  id: string;
  label: string;
  weight: number;
  description: string;
};

type Behavior = {
  id: string;
  text: string;
  category: "decision-making" | "research" | "communication";
};

type Demographic = {
  label: string;
  value: string;
};

type InsightItem = {
  id: string;
  text: string;
  priority?: "high" | "medium" | "low";
};

type EnhancedPersona = {
  id: string;
  name: string;
  role: string;
  company: string;
  tagline: string;
  avatar?: string;
  
  // Personality & Psychology
  personalityTraits: PersonalityTrait[];
  motivations: Motivation[];
  behaviors: Behavior[];
  demographics: Demographic[];
  
  // Insights Grid
  painPoints: InsightItem[];
  growthOpportunities: InsightItem[];
  valueProp: InsightItem[];
  contentSuggestions: InsightItem[];
};

type EnhancedPersonaShowcaseProps = {
  persona?: EnhancedPersona;
  onPersonalityChange?: (traitId: string, value: number) => void;
  onMotivationChange?: (motivationId: string, weight: number) => void;
  onRegenerate?: (persona: EnhancedPersona) => void;
  readOnly?: boolean;
};

// Mock Data: Accounting Firm Owner
const mockPersona: EnhancedPersona = {
  id: "acc-firm-owner-1",
  name: "Sarah Chen",
  role: "Accounting Firm Owner",
  company: "Chen & Associates CPAs",
  tagline: "Scaling a traditional practice with modern tools",
  personalityTraits: [
    {
      id: "risk-tolerance",
      label: "Risk Tolerance",
      leftLabel: "Risk-Averse",
      rightLabel: "Risk-Taker",
      value: 35,
      description: "Prefers proven solutions over experimental ones"
    },
    {
      id: "decision-speed",
      label: "Decision Speed",
      leftLabel: "Deliberate",
      rightLabel: "Quick",
      value: 40,
      description: "Takes time to evaluate options thoroughly"
    },
    {
      id: "tech-adoption",
      label: "Tech Adoption",
      leftLabel: "Conservative",
      rightLabel: "Early Adopter",
      value: 55,
      description: "Open to tech that clearly saves time"
    },
    {
      id: "collaboration",
      label: "Collaboration Style",
      leftLabel: "Independent",
      rightLabel: "Team-Oriented",
      value: 70,
      description: "Values team input and delegation"
    },
  ],
  motivations: [
    {
      id: "efficiency",
      label: "Operational Efficiency",
      weight: 40,
      description: "Reduce time spent on manual processes"
    },
    {
      id: "growth",
      label: "Business Growth",
      weight: 30,
      description: "Take on more clients without hiring"
    },
    {
      id: "quality",
      label: "Service Quality",
      weight: 20,
      description: "Maintain accuracy as well as client satisfaction"
    },
    {
      id: "compliance",
      label: "Compliance & Security",
      weight: 10,
      description: "Stay updated with regulations"
    },
  ],
  behaviors: [
    {
      id: "b1",
      text: "Researches via peer recommendations and industry forums",
      category: "research"
    },
    {
      id: "b2",
      text: "Prefers demos over reading documentation",
      category: "research"
    },
    {
      id: "b3",
      text: "Makes purchase decisions after ROI calculator review",
      category: "decision-making"
    },
    {
      id: "b4",
      text: "Involves senior accountant in evaluation process",
      category: "decision-making"
    },
    {
      id: "b5",
      text: "Responds best to email with clear next steps",
      category: "communication"
    },
    {
      id: "b6",
      text: "Values case studies from similar firm sizes",
      category: "communication"
    },
  ],
  demographics: [
    { label: "Age Range", value: "38-55" },
    { label: "Location", value: "Mid-sized US cities" },
    { label: "Firm Size", value: "5-15 employees" },
    { label: "Annual Revenue", value: "$800K - $2M" },
    { label: "Education", value: "CPA, MBA (30%)" },
    { label: "Experience", value: "10-20 years in accounting" },
  ],
  painPoints: [
    {
      id: "p1",
      text: "Spending 15+ hours/week on admin tasks instead of client work",
      priority: "high"
    },
    {
      id: "p2",
      text: "Difficulty hiring qualified staff in competitive market",
      priority: "high"
    },
    {
      id: "p3",
      text: "Manual data entry leading to occasional errors",
      priority: "medium"
    },
    {
      id: "p4",
      text: "Client communication scattered across email, phone, portal",
      priority: "medium"
    },
  ],
  growthOpportunities: [
    {
      id: "g1",
      text: "Automate bookkeeping to free up 10 hours/week for advisory services",
      priority: "high"
    },
    {
      id: "g2",
      text: "Increase client capacity by 30% without new hires",
      priority: "high"
    },
    {
      id: "g3",
      text: "Upsell advisory services to existing bookkeeping clients",
      priority: "medium"
    },
    {
      id: "g4",
      text: "Position as modern, tech-savvy firm to attract younger clients",
      priority: "medium"
    },
  ],
  valueProp: [
    {
      id: "v1",
      text: "Cut admin time in half with AI-powered automation built for CPAs",
      priority: "high"
    },
    {
      id: "v2",
      text: "Proven ROI: Firms save $45K annually in labor costs",
      priority: "high"
    },
    {
      id: "v3",
      text: "Bank-level security with SOC 2 Type II compliance",
      priority: "medium"
    },
  ],
  contentSuggestions: [
    {
      id: "c1",
      text: "Case study: How [Similar Firm] grew 40% without hiring",
      priority: "high"
    },
    {
      id: "c2",
      text: "ROI calculator: Your time savings in dollars",
      priority: "high"
    },
    {
      id: "c3",
      text: "Guide: 5 automation wins for small CPA firms",
      priority: "medium"
    },
    {
      id: "c4",
      text: "Video demo: See the platform in 3 minutes",
      priority: "medium"
    },
  ],
};

export function EnhancedPersonaShowcase({
  persona = mockPersona,
  onPersonalityChange,
  onMotivationChange,
  onRegenerate,
  readOnly = false,
}: EnhancedPersonaShowcaseProps) {
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localPersona, setLocalPersona] = useState(persona);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTraitChange = (traitId: string, value: number) => {
    if (readOnly) return;
    const updatedTraits = localPersona.personalityTraits.map((trait) =>
      trait.id === traitId ? { ...trait, value } : trait
    );
    setLocalPersona({ ...localPersona, personalityTraits: updatedTraits });
    onPersonalityChange?.(traitId, value);
  };

  const handleMotivationChange = (motivationId: string, weight: number) => {
    if (readOnly) return;
    const updatedMotivations = localPersona.motivations.map((motivation) =>
      motivation.id === motivationId ? { ...motivation, weight } : motivation
    );
    setLocalPersona({ ...localPersona, motivations: updatedMotivations });
    onMotivationChange?.(motivationId, weight);
  };

  const handleRegenerate = async () => {
    if (readOnly || !onRegenerate) return;
    setIsRegenerating(true);
    await onRegenerate(localPersona);
    setTimeout(() => setIsRegenerating(false), 2000);
  };

  const getPriorityColor = (priority?: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      case "low":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getPriorityBadge = (priority?: "high" | "medium" | "low") => {
    if (!priority) return null;
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] px-1.5 py-0",
          priority === "high" && "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
          priority === "medium" && "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
          priority === "low" && "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        )}
      >
        {priority}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* LAYER 1: Hero Card - Always Visible */}
      <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        
        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {localPersona.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {localPersona.name}
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {localPersona.role} • {localPersona.company}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 shrink-0">
                  Enhanced Profile
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground italic">
                {localPersona.tagline}
              </p>
            </div>
          </div>

          {/* Expandable Details Toggle */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setExpandedDetails(!expandedDetails)}
          >
            {expandedDetails ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More (Personality, Motivations, Behaviors)
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* LAYER 2: Expandable Details - Personality, Motivations, Behaviors */}
      {expandedDetails && (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <div className="p-6 space-y-8">
            {/* Personality Sliders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-lg">Personality Profile</h3>
                </div>
                {!readOnly && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="gap-2"
                  >
                    {isRegenerating ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Regenerate with New Adjustments
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {localPersona.personalityTraits.map((trait) => (
                  <div key={trait.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">
                        {trait.label}
                      </label>
                      <span className="text-sm font-mono text-muted-foreground">
                        {trait.value}
                      </span>
                    </div>
                    
                    <Slider
                      value={[trait.value]}
                      onValueChange={(values) => handleTraitChange(trait.id, values[0])}
                      max={100}
                      step={1}
                      className="w-full"
                      disabled={readOnly}
                    />
                    
                    <div className="flex items-start justify-between text-xs">
                      <span className="text-muted-foreground">{trait.leftLabel}</span>
                      <span className="text-muted-foreground">{trait.rightLabel}</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground italic">
                      {trait.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivations */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg">Primary Motivations</h3>
              </div>

              <div className="space-y-4">
                {localPersona.motivations.map((motivation) => (
                  <div key={motivation.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {motivation.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {motivation.description}
                        </p>
                      </div>
                      <span className="text-sm font-mono font-bold text-purple-600 ml-4">
                        {motivation.weight}%
                      </span>
                    </div>
                    
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${motivation.weight}%` }}
                      />
                    </div>
                    
                    {!readOnly && (
                      <Slider
                        value={[motivation.weight]}
                        onValueChange={(values) => handleMotivationChange(motivation.id, values[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Behaviors */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg">Behavioral Patterns</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["research", "decision-making", "communication"].map((category) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category.replace("-", " ")}
                    </h4>
                    <div className="space-y-2">
                      {localPersona.behaviors
                        .filter((b) => b.category === category)
                        .map((behavior) => (
                          <div
                            key={behavior.id}
                            className="p-3 rounded-lg bg-muted/50 border border-border text-sm"
                          >
                            {behavior.text}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">Demographics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {localPersona.demographics.map((demo, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {demo.label}
                    </p>
                    <p className="text-sm text-foreground">{demo.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* LAYER 3: Insights Grid - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pain Points */}
        <InsightCard
          title="Pain Points"
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
          items={localPersona.painPoints}
          onCopy={handleCopy}
          copiedId={copiedId}
          getPriorityBadge={getPriorityBadge}
        />

        {/* Growth Opportunities */}
        <InsightCard
          title="Growth Opportunities"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          items={localPersona.growthOpportunities}
          onCopy={handleCopy}
          copiedId={copiedId}
          getPriorityBadge={getPriorityBadge}
        />

        {/* Value Proposition */}
        <InsightCard
          title="Value Proposition"
          icon={<Sparkles className="w-5 h-5" />}
          color="purple"
          items={localPersona.valueProp}
          onCopy={handleCopy}
          copiedId={copiedId}
          getPriorityBadge={getPriorityBadge}
        />

        {/* Content Suggestions */}
        <InsightCard
          title="Content Suggestions"
          icon={<Lightbulb className="w-5 h-5" />}
          color="amber"
          items={localPersona.contentSuggestions}
          onCopy={handleCopy}
          copiedId={copiedId}
          getPriorityBadge={getPriorityBadge}
        />
      </div>
    </div>
  );
}

// Helper Component: Insight Card
type InsightCardProps = {
  title: string;
  icon: React.ReactNode;
  color: "red" | "green" | "purple" | "amber";
  items: InsightItem[];
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  getPriorityBadge: (priority?: "high" | "medium" | "low") => React.ReactNode;
};

function InsightCard({
  title,
  icon,
  color,
  items,
  onCopy,
  copiedId,
  getPriorityBadge,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const colorClasses = {
    red: {
      border: "border-red-200 dark:border-red-800",
      bg: "bg-red-50 dark:bg-red-950/30",
      iconText: "text-red-600 dark:text-red-400",
      hover: "hover:bg-red-100 dark:hover:bg-red-900/50",
    },
    green: {
      border: "border-green-200 dark:border-green-800",
      bg: "bg-green-50 dark:bg-green-950/30",
      iconText: "text-green-600 dark:text-green-400",
      hover: "hover:bg-green-100 dark:hover:bg-green-900/50",
    },
    purple: {
      border: "border-purple-200 dark:border-purple-800",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      iconText: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-900/50",
    },
    amber: {
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      iconText: "text-amber-600 dark:text-amber-400",
      hover: "hover:bg-amber-100 dark:hover:bg-amber-900/50",
    },
  };

  const classes = colorClasses[color];
  const displayedItems = expanded ? items : items.slice(0, 2);

  return (
    <Card className={cn("border-2", classes.border)}>
      <div className={cn("p-4 border-b", classes.bg, classes.border)}>
        <div className="flex items-center gap-2">
          <div className={classes.iconText}>{icon}</div>
          <h3 className="font-bold text-sm">{title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {displayedItems.map((item) => (
          <div
            key={item.id}
            className="group relative p-3 rounded-lg bg-muted/50 border border-border transition-colors hover:bg-muted"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              {getPriorityBadge(item.priority)}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onCopy(item.text, item.id)}
              >
                {copiedId === item.id ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-foreground">
              {item.text}
            </p>
          </div>
        ))}

        {items.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {items.length - 2} More
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
