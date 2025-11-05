"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Circle,
  CheckCircle2,
  Target,
  Zap,
  TrendingUp,
  Rocket,
  Globe,
  Brain,
  FileText,
  Users,
  DollarSign,
  Presentation,
  Image as ImageIcon,
  Bot,
  BarChart3,
  Triangle,
  GitBranch,
  Monitor,
  Download,
  ArrowRight,
  User,
  Search,
  MessageSquare,
  Mail,
  Share2,
  Workflow,
  Clock,
  RefreshCw,
  Video,
  Play,
  Sparkles,
  PenTool,
  Layout,
  Palette,
  Table,
  Briefcase
} from "lucide-react";

// Slide wrapper component
function Slide({ children, slideNumber }: { children: React.ReactNode; slideNumber: number }) {
  return (
    <div className="relative w-full h-screen flex items-center justify-center p-8 md:p-16">
      {/* Slide number indicator */}
      <div className="absolute top-8 right-8 text-sm text-muted-foreground">
        {slideNumber.toString().padStart(2, '0')}
      </div>
      
      {/* Content */}
      <div className="w-full max-w-6xl">
        {children}
      </div>
    </div>
  );
}

// Slide 1: Cover
function CoverSlide() {
  return (
    <Slide slideNumber={1}>
      <div className="text-center space-y-12">
        {/* Logo + Brand Name - Side by Side */}
        <div className="flex items-center justify-center gap-4">
          <Image
            src="/logo.svg"
            alt="Flowtusk Logo"
            width={56}
            height={56}
            className="h-14 w-14"
          />
          <div className="text-6xl font-semibold gradient-text">
            Flowtusk
          </div>
        </div>

        {/* Tagline as subheading */}
        <h2 className="text-2xl md:text-3xl text-muted-foreground">
          Vibe create your B2B funnel in minutes not weekends
        </h2>

        <div className="mt-16 flex items-center justify-center gap-4 text-lg text-muted-foreground">
          <span>October 2025</span>
          <span>•</span>
          <span>Hasan Shahriar</span>
        </div>
      </div>
    </Slide>
  );
}

// Slide 2: Problem
function ProblemSlide() {
  const problems = [
    {
      title: "No customer clarity",
      description: "Teams launch without validated ICPs. Generic messaging → ~5% conversion rates."
    },
    {
      title: "Tool chaos",
      description: "7+ unconnected tools per funnel (brief → copy → design → LP → email → outreach → tracking). Context gets lost; output is inconsistent."
    },
    {
      title: "Built for speed, not fit",
      description: "Page builders/AI writers make things fast, but not for the right audience. Consultants cost €15-50k, take 6 weeks, still miss the mark."
    },
    {
      title: "Expensive & slow results",
      description: "€15-50k consultants. 6-week timelines. Still generic messaging."
    }
  ];

  return (
    <Slide slideNumber={2}>
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-medium text-foreground leading-tight">
          B2B Marketing funnels take weeks to build — and fail to convert ~95% of the time
        </h2>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-5 gap-8">
          {/* Left Column - Problem Items */}
          <div className="col-span-3 space-y-4">
            {problems.map((problem, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-lg font-semibold gradient-text">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column - Illustration Placeholder */}
          <div className="col-span-2 flex items-center">
            <div className="w-full h-full min-h-[300px] border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <ImageIcon className="h-16 w-16 text-pink-500 dark:text-pink-400" />
              <div className="space-y-2">
                <h4 className="font-semibold gradient-text">
                  Illustration: Positioning Chaos
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Split-screen visualization showing chaotic sticky notes, scattered whiteboard ideas, and tangled messaging on the left vs. clean, organized positioning document with clear personas and value props on the right. Conveys the before/after transformation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 3: The Gap / Why Now
function GapSlide() {
  return (
    <Slide slideNumber={3}>
      <div className="space-y-10">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
          2025: GenAI has transformed content creation without knowing who to sell to. Clarity layer is missing
        </h2>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Content AI is commoditized */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Bot className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-medium text-foreground">Content AI is commoditized</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Marketers use the same tools (Jasper, Copy.ai, ChatGPT). Same prompts = same generic output = invisible in market noise.
            </p>
          </div>

          {/* Data tools give numbers */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-medium text-foreground">Data tools show what happened, not what to say</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Analytics tell you &quot;bounce rate is 73%&quot; but they don&apos;t explain why or tell you &quot;your value prop missed their actual pain point&quot;
            </p>
          </div>

          {/* The gap */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Triangle className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-medium text-foreground">The gap (what&apos;s missing)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No system connects customer research → positioning → content creation. Teams waste GenAI&apos;s speed on the wrong message.
            </p>
          </div>

          {/* The opportunity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Rocket className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-medium text-foreground">The opportunity (Flowtusk)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The B2B Funnel Copilot: URL → validated ICPs → tailored messaging → multichannel funnel. Finally, GenAI that knows your buyer.
            </p>
          </div>
        </div>

        {/* Bottom illustration placeholder */}
        <div className="border-2 border-dashed border-violet-400 dark:border-violet-600 rounded-xl bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20 p-8 flex flex-col items-center justify-center space-y-4">
          <GitBranch className="h-12 w-12 gradient-text" />
          <div className="text-center space-y-2">
            <h4 className="font-semibold gradient-text">
              Illustration: Evolution Timeline
            </h4>
            <p className="text-xs text-muted-foreground max-w-3xl">
              Timeline graphic showing progression: Manual positioning with consultants (2020) → Generic AI copy tools (2023) → Positioning Copilot (2025). Use arrows and visual milestones to show the gap that Flowtusk fills
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 4: Solution (How It Works)
function SolutionSlide() {
  const steps = [
    {
      number: 1,
      title: "Input",
      description: "Drop any URL (or competitor's). Add target market if needed."
    },
    {
      number: 2,
      title: "Analysis",
      description: "AI extracts actual customer voice, maps positioning gaps, validates against competition"
    },
    {
      number: 3,
      title: "Personas",
      description: "3 data-backed ICPs with psychographics, pains, triggers, and channel preferences—pick your winner"
    },
    {
      number: 4,
      title: "Value Props",
      description: "5 angles tailored to chosen ICP: hooks, objections handled, proof points mapped"
    },
    {
      number: 5,
      title: "Assets",
      description: "Complete funnel ready: Landing page, LinkedIn sequence, email nurture—export anywhere in one click"
    }
  ];

  return (
    <Slide slideNumber={4}>
      <div className="space-y-10">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
          From any URL to converting campaigns in under 10 minutes
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-12">
          {/* Left Column - Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                {/* Number badge */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {step.number}
                </div>
                {/* Content */}
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-medium text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Product Screenshot Placeholder */}
          <div className="flex items-center">
            <div className="w-full h-full min-h-[400px] border-2 border-dashed border-violet-400 dark:border-violet-600 rounded-xl bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Monitor className="h-16 w-16 gradient-text" />
              <div className="space-y-2">
                <h4 className="font-semibold gradient-text">
                  Live Demo Output
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  Shows actual ICP cards with:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left max-w-md">
                  <li>• Verified pains from real customer data</li>
                  <li>• Message-market fit scoring</li>
                  <li>• Export-ready templates</li>
                </ul>
                <p className="text-xs font-medium text-foreground pt-2 italic">
                  Not templates. Not generic AI. Real customer intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 5: How it Works (Architecture)
function HowItWorksSlide() {
  return (
    <Slide slideNumber={5}>
      <div className="space-y-6">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-medium text-foreground leading-tight text-center mb-8">
          How it Works
        </h2>

        {/* Top Row: User Input → Orchestrator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Card className="p-5 bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] text-white min-w-[160px] text-center">
            <User className="h-7 w-7 mx-auto mb-2" />
            <h3 className="font-bold text-base mb-1">User Input</h3>
            <p className="text-xs opacity-90">(URL + Goal)</p>
          </Card>
          
          <ArrowRight className="h-8 w-8 text-purple-500" />
          
          <Card className="p-5 bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] text-white min-w-[160px] text-center">
            <Workflow className="h-7 w-7 mx-auto mb-2" />
            <h3 className="font-bold text-base">Orchestrator</h3>
          </Card>
        </div>

        {/* Main Grid: 3 Layers */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          
          {/* AGENTS LAYER */}
          <div>
            <Badge className="mb-3 bg-orange-600 text-white font-semibold">AGENTS</Badge>
            <div className="space-y-3">
              <Card className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                <Search className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Analyzer Agent</h4>
                <p className="text-xs opacity-90">Crawls & analyzes</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <Users className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">ICP Agent</h4>
                <p className="text-xs opacity-90">Builds personas</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-cyan-600 to-cyan-700 text-white">
                <Target className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Positioning Agent</h4>
                <p className="text-xs opacity-90">Creates value props</p>
              </Card>
            </div>
          </div>

          {/* CLARITY LAYER */}
          <div>
            <Badge className="mb-3 bg-emerald-600 text-white font-semibold">CLARITY LAYER</Badge>
            <div className="space-y-3">
              <Card className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                <Globe className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Site Context</h4>
                <p className="text-xs opacity-90">Brand & messaging</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                <Users className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Personas</h4>
                <p className="text-xs opacity-90">ICP cards</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                <Zap className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Value Props</h4>
                <p className="text-xs opacity-90">Messaging options</p>
              </Card>
            </div>
          </div>

          {/* CONTENT LAYER */}
          <div>
            <Badge className="mb-3 bg-blue-600 text-white font-semibold">CONTENT LAYER</Badge>
            <div className="space-y-3">
              <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <MessageSquare className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Content → LinkedIn</h4>
                <p className="text-xs opacity-90">(Post • Bio • InMail)</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-red-600 to-red-700 text-white">
                <Mail className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Content → Email</h4>
                <p className="text-xs opacity-90">(One-time • Sequence)</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                <FileText className="h-5 w-5 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Content → Landing Page</h4>
                <p className="text-xs opacity-90">(Sections/Components)</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-6">
          <ArrowRight className="h-8 w-8 text-purple-500 rotate-90" />
        </div>

        {/* Bottom Row: Export Layer */}
        <div className="flex justify-center">
          <div>
            <Badge className="mb-3 bg-slate-700 text-white font-semibold">EXPORT LAYER</Badge>
            <div className="flex gap-6">
              <Card className="p-5 bg-gradient-to-br from-slate-700 to-slate-800 text-white min-w-[220px] text-center">
                <FileText className="h-7 w-7 mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-2">Template Registry</h4>
                <p className="text-xs opacity-90">(Next.js • Webflow • Email)</p>
              </Card>
              
              <ArrowRight className="h-8 w-8 text-slate-500 self-center" />
              
              <Card className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white min-w-[220px] text-center">
                <Share2 className="h-7 w-7 mx-auto mb-2" />
                <h4 className="font-semibold text-sm mb-2">Publish/Share/Embed</h4>
                <p className="text-xs opacity-90">(Webflow • Notion • Slides • API)</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 6: Roadmap
function RoadmapSlide() {
  const phases = [
    {
      number: 1,
      phase: "Phase 1",
      title: "MVP Development",
      timeframe: "Months 0-6",
      features: [
        "Ship core: URL → ICPs → Value Props → Content",
        "Onboard 2 partner agencies (from existing clients)",
        "Land 1 enterprise pilot"
      ],
      target: "20 early adopters",
      mrr: "€2K MRR"
    },
    {
      number: 2,
      phase: "Phase 2",
      title: "Product-Market Fit",
      timeframe: "Months 6–12",
      features: [
        "Multi-channel platform development (mobile app, marketplace etc.",
        "Add LinkedIn + Email sequences",
        "Close 3 enterprise accounts (€2-5K/month each)"
      ],
      target: "40 customers",
      mrr: "€5K MRR, €60K ARR"
    },
    {
      number: 3,
      phase: "Phase 3",
      title: "Scale",
      timeframe: "Months 13–24",
      features: [
        "Autonomous marketing agents + orchestration",
        "Launch certified agency partner program",
        "10 enterprise clients on annual contracts"
      ],
      target: "700 customers",
      mrr: "€1M ARR",
      mrrSubtitle: "40% from agencies/enterprise"
    }
  ];

  // Helper to render features with arrow icons
  const renderFeature = (feature: string) => {
    const parts = feature.split('→').map(part => part.trim());
    if (parts.length === 1) {
      return <span>{feature}</span>;
    }
    return (
      <span className="flex items-center gap-0.5">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-0.5">
            <span>{part}</span>
            {i < parts.length - 1 && <ArrowRight className="h-3 w-3 shrink-0 gradient-text" />}
          </span>
        ))}
      </span>
    );
  };

  return (
    <Slide slideNumber={6}>
      <div className="space-y-6">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
          From MVP to growth in 24 months with €1M ARR (2027)
        </h2>

        {/* Three Phase Cards */}
        <div className="grid grid-cols-3 gap-6">
          {phases.map((phase) => (
            <div key={phase.number} className="flex flex-col space-y-6">
              <Card className="p-6 flex-1">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold gradient-text uppercase tracking-wide">
                      {phase.phase}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {phase.timeframe}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {phase.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="gradient-text mt-0.5">•</span>
                        {renderFeature(feature)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Target Card */}
              <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 border-2 border-dashed border-purple-300 dark:border-purple-700">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Target{(phase as any).mrrSubtitle && ` (${(phase as any).mrrSubtitle})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold gradient-text">
                      {phase.target}
                    </p>
                    {(phase as any).targetSubtitle && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(phase as any).targetSubtitle}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold gradient-text">
                      {phase.mrr}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Vision Statement */}
        <div className="text-center py-2 space-y-1">
          <p className="text-base text-muted-foreground">
            <span className="font-semibold text-foreground">Year 1 goal (2026):</span> €5K MRR, 5+ agency partners, 40 customers - validated playbook
          </p>
          <p className="text-base text-muted-foreground">
            <span className="font-semibold text-foreground">Year 2 goal (2027):</span> €75K+ MRR, 20+ agency partners, 10 enterprise accounts - ready to scale Series A
          </p>
        </div>
      </div>
    </Slide>
  );
}

// Slide 7: Market Size
function MarketSizeSlide() {
  return (
    <Slide slideNumber={7}>
      <div className="relative w-full h-full flex flex-col pb-8">
        <div className="flex-1 space-y-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-semi-bold text-foreground leading-tight">
            100K+ SaaS founders and B2B marketers need positioning clarity—no good tools exist
          </h2>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-12">
            {/* Left Column - Market Size */}
            <div className="space-y-8">
              <h3 className="text-xl font-bold gradient-text mb-4">
                Market Size
              </h3>

              {/* TAM */}
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  TAM (Total Addressable Market)
                </p>
                <p className="text-5xl font-semi-bold text-foreground">$15B</p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  B2B marketing automation market (HubSpot, Salesforce, Marketo, ActiveCampaign).*
                </p>
              </div>

              {/* SAM */}
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  SAM (Serviceable Addressable Market)
                </p>
                <p className="text-5xl font-semi-bold text-foreground">$2.4B</p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  Positioning, messaging, and funnel optimization software segment — includes content AI, CRM, and conversion tools.**
                </p>
              </div>

              {/* SOM */}
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  SOM target (Beachhead — Nordics, Year 2)
                </p>
                <p className="text-5xl font-semi-bold text-foreground">€1.0M ARR</p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">
                  ICP: Nordic B2B SaaS teams (10–50 employees) with a modern CMS + CRM stack and LinkedIn/email outbound. (≈ €83k MRR)***
                </p>
              </div>
            </div>

            {/* Right Column - Flowtusk Playbook */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold gradient-text mb-3">
                Flowtusk Playbook
              </h3>

              {/* Time to value */}
              <Card className="p-4 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
                <div className="flex items-start gap-4">
                  <Clock className="h-8 w-8 text-[#7c3aed] shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Time to value</p>
                    <p className="text-lg font-bold text-foreground leading-tight">
                      <span className="gradient-text">10 minutes</span> vs 4 weeks
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From URL to complete campaign while consultants still schedule kickoffs
                    </p>
                  </div>
                </div>
              </Card>

              {/* Cost */}
              <Card className="p-4 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
                <div className="flex items-start gap-4">
                  <span className="text-3xl text-[#7c3aed] shrink-0 font-bold">€</span>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fraction of agency cost</p>
                    <p className="text-lg font-bold text-foreground leading-tight">
                      <span className="gradient-text">€149/month</span> vs €50K project
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlimited campaigns vs one-time deliverable
                    </p>
                  </div>
                </div>
              </Card>

              {/* Built-in distribution */}
              <Card className="p-4 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
                <div className="flex items-start gap-4">
                  <Share2 className="h-8 w-8 text-[#7c3aed] shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Built-in distribution</p>
                    <p className="text-lg font-bold text-foreground leading-tight">
                      <span className="gradient-text">20+ agency partnerships</span> locked
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Agencies white-label us = we scale through their clients
                    </p>
                  </div>
                </div>
              </Card>

              {/* Unique positioning engine */}
              <Card className="p-4 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
                <div className="flex items-start gap-4">
                  <Bot className="h-8 w-8 text-[#7c3aed] shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unique positioning engine</p>
                    <p className="text-lg font-bold text-foreground leading-tight">
                      <span className="gradient-text">AI that learns what converts</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Not just content generation - we track what messaging actually works
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* References - Bottom Left, One Line */}
        <div className="absolute bottom-1 left-0">
          <div className="text-[8px] text-muted-foreground leading-tight flex items-center gap-3">
            <span>* Statista, Grand View Research (2024)</span>
            <span>** Gartner, G2Crowd data (16% carve)</span>
            <span>*** Crunchbase + LinkedIn Sales Navigator (2025 SaaS ecosystem)</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 8: Business Model
function BusinessModelSlide() {
  const proofPoints = [
    {
      title: "Shovels in the GenAI gold rush",
      description: "B2B teams are burning millions on AI content tools - but still shooting blind. We're the missing first step: WHO to target before they write anything.",
      icon: DollarSign
    },
    {
      title: "Content-led growth",
      description: "Our growth is content-first—demo videos, short clips, and public storytelling build consistent visibility and media attention.",
      icon: Play
    },
    {
      title: "Agency partnerships",
      description: "Existing client network + agency partners = warm launches, co-builds, and fast growth momentum.",
      icon: Users
    }
  ];

  const targets = [
    {
      label: "Audience building",
      value: "100K+",
      description: "reach targeting marketer communities (Product Hunt, Reddit, Discords), plus niche newsletters and content-marketing circles."
    },
    {
      label: "First time value",
      value: "< 10 min",
      description: "from demo link -> funnels -> multi-channel content (LinkedIn, Email, X, LP) all under 10 minutes—with one-click embed/share"
    },
    {
      label: "CONTENT SAVES + SHARES*",
      value: "20%",
      description: "Achieved via Cursor/Bolt/Base44-inspired share loops and a content flywheel on every export."
    },
    {
      label: "WAITLIST sign-ups",
      value: "1,500+",
      description: "from founders, marketers, and agency operators within the first 30 days—driven by early demo and social buzz."
    }
  ];

  return (
    <Slide slideNumber={8}>
      <div className="space-y-8">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-semi-bold text-foreground leading-tight">
            We're building the Bolt.new for B2B marketing—riding the GenAI wave with deep GTM + agency expertise
          </h2>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left: Proof Points */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold gradient-text">Why We Win</h3>
              {proofPoints.map((point, idx) => {
                const IconComponent = point.icon;
                return (
                  <Card key={idx} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                        <IconComponent className="h-6 w-6 gradient-text" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-foreground">{point.title}</h3>
                        <p className="text-sm text-muted-foreground">{point.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Right: Social-Driven Targets */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold gradient-text">First 6-months GTM Targets</h3>
              <div className="grid grid-cols-2 gap-4">
                {targets.map((target, idx) => (
                  <Card key={idx} className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{target.label}</p>
                    <p className="text-3xl font-bold gradient-text mb-2">{target.value}</p>
                    <p className="text-xs text-muted-foreground">{target.description}</p>
                  </Card>
                ))}
              </div>
              {/* Footnote */}
              <p className="text-[8px] text-muted-foreground leading-tight mt-10">
                * Industry avg 2-5% (Rival IQ 2024); we target 20% via "10x content" (Rand Fishkin)
              </p>
            </div>
          </div>
      </div>
    </Slide>
  );
}

// Slide 9: Competitive Positioning
function CompetitivePositioningSlide() {
  return (
    <Slide slideNumber={9}>
      <div className="space-y-10">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-semi-bold text-foreground leading-tight">
          From vibe to value: we own the sweet spot of GenAI creation
        </h2>

        {/* 2x2 Quadrant Grid */}
        <div className="flex justify-center pb-16">
          <div className="relative">
            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-1">
            {/* Top Left - Fast + Generic */}
            <Card className="p-6 bg-muted/30 min-h-[240px] flex flex-col justify-center border border-muted-foreground/20 relative">
              <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2">
                {/* Placeholder for Jasper logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/jasper.svg" alt="Jasper" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for Notion logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/notion.svg" alt="Notion" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for Framer logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/framer.svg" alt="Framer" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for Canva logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/canva.svg" alt="Canva" className="w-full h-full object-contain opacity-60" />
                </div>
              </div>
              <div className="space-y-3 pr-24">
                <div>
                  <h3 className="text-base font-semibold text-foreground">AI copy, page builders, ad tools</h3>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Jasper, Copy.ai, Notion AI</p>
                  <p>• Unbounce, Framer (templates)</p>
                  <p>• Canva, AdCreative.ai</p>
                </div>
              </div>
            </Card>

            {/* Top Right - Fast + Personalized - Flowtusk */}
            <Card className="p-6 bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 min-h-[240px] flex flex-col justify-center relative border-2 border-purple-600 dark:border-purple-500">
              <div className="space-y-4 flex flex-col items-center">
                <img src="/logo.svg" alt="Flowtusk" className="h-12 w-auto" />
                <h3 className="text-2xl font-bold gradient-text">Flowtusk</h3>
                <p className="text-sm font-medium text-foreground text-center">Fast launch with tailored content that ships everywhere.</p>
                <p className="text-xs text-muted-foreground text-center italic">Positioning-first AI that knows your ICP before writing a word</p>
              </div>
            </Card>

            {/* Bottom Left - Slow + Generic */}
            <Card className="p-6 bg-muted/30 min-h-[240px] flex flex-col justify-center border border-muted-foreground/20 relative">
              <div className="absolute left-2 top-2 text-xs text-muted-foreground">
                Slow, Low Personalization
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2">
                {/* Placeholder for HubSpot logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/hubspot.svg" alt="HubSpot" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for Zapier logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/zapier.svg" alt="Zapier" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for Mailchimp logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/mailchimp.svg" alt="Mailchimp" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for Airtable logo */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/airtable.svg" alt="Airtable" className="w-full h-full object-contain opacity-60" />
                </div>
              </div>
              <div className="space-y-3 pr-24">
                <h3 className="text-base font-semibold text-foreground">DIY & fragmented tools</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• HubSpot,Zapier,Make</p>
                  <p>• Mailchimp, Klaviyo</p>
                  <p>• Google Sheets, Airtable</p>
                </div>
              </div>
            </Card>

            {/* Bottom Right - Slow + Personalized */}
            <Card className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 min-h-[240px] flex flex-col justify-center border border-muted-foreground/20 relative">
              <div className="absolute right-2 top-2 text-xs text-muted-foreground">
                Slow, High Personalization
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-2">
                {/* Placeholder for agency/consultant logo 1 */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/optimizely.svg" alt="Optimizely" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for agency/consultant logo 2 */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/fibrai.svg" alt="FibrAI" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for agency/consultant logo 3 */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/dovetail.svg" alt="Dovetail" className="w-full h-full object-contain opacity-60" />
                </div>
                {/* Placeholder for agency/consultant logo 4 */}
                <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
                  <img src="/logos/agency.svg" alt="Agency" className="w-full h-full object-contain opacity-60" />
                </div>
              </div>
              <div className="space-y-3 pr-24">
                <h3 className="text-base font-semibold text-foreground">Tailored, expensive, manual</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Brand and creative agencies</p>
                  <p>• Optimizely, FibrAI, Dovetail</p>
                  <p>• B2B Positioning Consultants</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Axis Labels */}
          <div className="absolute -left-52 top-[45%] -translate-y-1/2 -rotate-90 text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">
            Content Personalization (Generic → Tailored)
          </div>
          <div className="absolute left-0 right-0 -bottom-12 text-center text-xs text-muted-foreground uppercase tracking-wide">
            Speed to Launch (Slow → Fast)
          </div>
          <div className="absolute left-2 top-2 text-xs text-muted-foreground">
            Fast, Low Personalization
          </div>
          <div className="absolute right-2 top-2 text-xs gradient-text font-semibold">
            Fast, High Personalization
          </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 10: Team
function TeamSlide() {
  return (
    <Slide slideNumber={10}>
      <div className="space-y-10">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-semi-bold text-foreground leading-tight">
          From Nordic consulting to scalable SaaS
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-12">
          {/* Left: Founder Profile */}
          <div className="col-span-2 space-y-4">
            {/* Photo */}
            <Card className="p-2 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 overflow-hidden">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/Founder.jpg"
                  alt="Hasan Shahriar"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              </div>
            </Card>

            {/* Name & Title */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-foreground">Hasan Shahriar</h3>
              <p className="text-base gradient-text font-medium">Founder & CEO</p>
            </div>

            {/* Brand Logos - Hidden for now */}
            {/* <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground text-center">Clients & Partners</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white dark:bg-slate-900 rounded border border-muted-foreground/20 flex items-center justify-center h-12">
                  <img src="/Nordea.svg.png" alt="Nordea" className="max-h-8 max-w-full object-contain opacity-70" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded border border-muted-foreground/20 flex items-center justify-center h-12">
                  <img src="/kone.svg" alt="KONE" className="max-h-8 max-w-full object-contain opacity-70" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded border border-muted-foreground/20 flex items-center justify-center h-12">
                  <img src="/tietoevry.png" alt="TietoEvry" className="max-h-8 max-w-full object-contain opacity-70" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded border border-muted-foreground/20 flex items-center justify-center h-12">
                  <img src="/zipli.svg" alt="Zipli" className="max-h-8 max-w-full object-contain opacity-70" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded border border-muted-foreground/20 flex items-center justify-center h-12">
                  <img src="/netguru.png" alt="Netguru" className="max-h-8 max-w-full object-contain opacity-70" />
                </div>
                <div className="p-2 bg-muted/30 rounded border border-muted-foreground/20 flex items-center justify-center text-[10px] text-muted-foreground h-12">Others</div>
              </div>
            </div> */}
          </div>

          {/* Right: Experience & Stats */}
          <div className="col-span-3 space-y-6">
            {/* Title */}
            <h3 className="text-xl font-bold gradient-text">8+ Years of B2B Marketing and GTM Expertise—Productized</h3>
            
            {/* Experience Summary */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold text-foreground">Enterprise foundation:</span> KONE, TietoEvry, Nordea — built MVPs that generated 300+ B2B leads. Discovered positioning drives pipeline, not features.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold text-foreground">Independent consultant:</span> €61K YTD 2024. 120+ campaigns shipped. Achieved 15% boost in conversion with positioning-first approach.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold text-foreground">Startup ecosystem:</span> Co-founded Krusti (€300K ARR). Active in Helsinki tech scene. Know what early-stage founders actually need.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] mt-1.5 shrink-0" />
                <p>
                  <span className="font-semibold text-foreground">Founder, Flowtusk (2025–):</span> Turning my 7-year playbook into AI. What took weeks of consulting now takes 10 minutes.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 pt-4 pb-6">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold gradient-text">8+</div>
                <div className="text-xs text-muted-foreground">Years in B2B Marketing</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold gradient-text">€61K</div>
                <div className="text-xs text-muted-foreground">YTD Revenue</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold gradient-text">100+</div>
                <div className="text-xs text-muted-foreground">Campaigns Delivered</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold gradient-text">4</div>
                <div className="text-xs text-muted-foreground">Enterprise Clients</div>
              </Card>
            </div>

            {/* Client Logos Row */}
            <div className="pt-2 pb-2">
              <div className="flex items-center justify-between gap-8 flex-wrap">
                <div className="h-8 flex items-center justify-center">
                  <img src="/Nordea.svg.png" alt="Nordea" className="max-h-8 max-w-20 object-contain opacity-70 grayscale" />
                </div>
                <div className="h-8 flex items-center justify-center">
                  <img src="/kone.svg" alt="KONE" className="max-h-8 max-w-20 object-contain opacity-70 grayscale" />
                </div>
                <div className="h-8 flex items-center justify-center">
                  <img src="/tietoevry.png" alt="TietoEvry" className="max-h-8 max-w-20 object-contain opacity-70 grayscale" />
                </div>
                <div className="h-8 flex items-center justify-center">
                  <img src="/netguru.png" alt="Netguru" className="max-h-8 max-w-20 object-contain opacity-70 grayscale" />
                </div>
                <div className="h-8 flex items-center justify-center">
                  <img src="/zipli.svg" alt="Zipli" className="max-h-7 max-w-16 object-contain opacity-70 grayscale" />
                </div>
                <div className="h-8 flex items-center justify-center">
                  <img src="/arkken.svg" alt="Arkken" className="max-h-8 max-w-20 object-contain opacity-70 grayscale" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 11: The Ask
function TheAskSlide() {
  return (
    <Slide slideNumber={11}>
      <div className="space-y-12">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-medium text-foreground leading-tight">
          €300K business loan to build MVP and acquire first 200 customers
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-12">
          {/* Left: The Ask Amount & Use of Funds */}
          <div className="col-span-2 space-y-6">
            {/* Amount */}
            <div className="space-y-4">
              <div className="text-6xl font-bold gradient-text">€300K</div>
              <Card className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Business loan to validate product-market fit and build foundation for Series A
                </p>
              </Card>
            </div>

            {/* Use of Funds */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Use of Funds</h3>
              
              <Card className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Engineering & Product</span>
                <span className="text-lg font-bold gradient-text">€180K (60%)</span>
              </Card>

              <Card className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Customer Acquisition</span>
                <span className="text-lg font-bold gradient-text">€75K (25%)</span>
              </Card>

              <Card className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Operations</span>
                <span className="text-lg font-bold gradient-text">€45K (15%)</span>
              </Card>
            </div>

            {/* Donut Chart Placeholder */}
            <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 flex flex-col items-center justify-center space-y-4">
              <div className="w-32 h-32 rounded-full border-[24px] border-purple-500 dark:border-purple-400 relative">
                <div className="absolute inset-0 rounded-full" style={{
                  background: `conic-gradient(from 0deg, #7c3aed 0% 60%, #8b5cf6 60% 85%, #7c3aed 85% 100%)`
                }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Fund allocation breakdown
              </p>
            </Card>
          </div>

          {/* Right: Key Milestones */}
          <div className="col-span-3 space-y-6">
            <h3 className="text-xl font-bold text-foreground">Key Milestones</h3>

            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Badge className="bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] text-white shrink-0">M3</Badge>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-foreground">Month 3</h4>
                    <p className="text-sm text-muted-foreground">
                      50 paying customers, €7.5K MRR, validated positioning copilot concept
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Badge className="bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] text-white shrink-0">M6</Badge>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-foreground">Month 6</h4>
                    <p className="text-sm text-muted-foreground">
                      100 customers, break-even, multi-format export features launched
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Badge className="bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] text-white shrink-0">M12</Badge>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-foreground">Month 12</h4>
                    <p className="text-sm text-muted-foreground">
                      200 customers, €30K MRR, Series A ready with proven unit economics
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Statement */}
            <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
              <p className="text-sm text-center text-muted-foreground">
                Clear path to profitability: Break-even in 6 months, <span className="font-bold gradient-text">€10M+ ARR potential</span> in 3 years
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 12: Closing
function ClosingSlide() {
  return (
    <Slide slideNumber={12}>
      <div className="text-center space-y-12">
        {/* Logo/Brand */}
        <div className="inline-block space-y-4">
          <div className="text-5xl font-bold gradient-text">
            Flowtusk
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-medium text-foreground leading-tight max-w-4xl mx-auto">
            2025 is the year <span className="gradient-text">positioning becomes a product</span>, not a service
          </h2>
        </div>

        {/* Key Points */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 gradient-text shrink-0" />
              <p className="text-sm font-medium">Massive market with clear, validated pain point</p>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 gradient-text shrink-0" />
              <p className="text-sm font-medium">No direct competitors in positioning intelligence</p>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 gradient-text shrink-0" />
              <p className="text-sm font-medium">First platform that exports positioning everywhere</p>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 gradient-text shrink-0" />
              <p className="text-sm font-medium">Foundation for €10M+ ARR business</p>
            </div>
          </Card>
        </div>

        {/* The Ask */}
        <Card className="p-8 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 max-w-3xl mx-auto">
          <p className="text-2xl font-bold text-foreground">
            The Ask: <span className="gradient-text">€300K</span> to validate product-market fit and build the future of B2B positioning
          </p>
        </Card>

        {/* Contact */}
        <div className="pt-12 border-t max-w-2xl mx-auto space-y-3">
          <div className="text-xl font-bold text-foreground">
            Md Hasan Shahriar
          </div>
          <div className="text-lg">
            <a href="mailto:hasan@flowtusk.com" className="gradient-text hover:underline">
              hasan@flowtusk.com
            </a>
          </div>
          <div className="text-sm text-muted-foreground">
            Helsinki, Finland
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Main Deck Component
export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    <CoverSlide key="cover" />,
    <ProblemSlide key="problem" />,
    <GapSlide key="gap" />,
    <SolutionSlide key="solution" />,
    <HowItWorksSlide key="howitworks" />,
    <RoadmapSlide key="roadmap" />,
    <MarketSizeSlide key="marketsize" />,
    <BusinessModelSlide key="businessmodel" />,
    <CompetitivePositioningSlide key="competitive" />,
    <TeamSlide key="team" />,
    <TheAskSlide key="ask" />,
    <ClosingSlide key="closing" />,
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#7c3aed]/10 to-[#8b5cf6]/10 dark:from-[#7c3aed]/10 dark:to-[#8b5cf6]/10 rounded-full blur-3xl" />
      
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides[currentSlide]}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Slide indicators */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide
                  ? 'w-8 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

