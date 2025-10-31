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
  Workflow
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
      title: "No customer clarity — just blind guesswork",
      description: "Teams launch without a validated ICP; messaging stays generic"
    },
    {
      title: "Tool chaos (7+ fragmented tools for one funnel)",
      description: "Brief in Notion → copy in Jasper/Docs → designs in Figma/Slides → page in Webflow/Unbounce → emails in HubSpot/Mailchimp → outreach on LinkedIn → tracking in GA. Context is lost"
    },
    {
      title: "Optimized for optimization, not for who you're selling to",
      description: "Page builders make pages fast, AI writers make text fast, and marketing platforms automate — but they all assume you already know the persona and positioning. Speed without clarity = poor conversion"
    },
    {
      title: "Expensive, slow, inconsistent",
      description: "3–6 weeks to ship; consultants cost €15k–50k+; messaging drifts across website, deck, LinkedIn, and sales calls"
    }
  ];

  return (
    <Slide slideNumber={2}>
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-medium text-foreground leading-tight max-w-4xl">
          B2B Marketing funnels take weeks to build —<br />
          and fail to convert ~95%<br />
          of the time
        </h2>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-5 gap-8">
          {/* Left Column - Problem Items */}
          <div className="col-span-3 space-y-8">
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
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
              <h3 className="text-xl font-bold text-foreground">Content AI is commoditized</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Teams can spin up copy fast (Jasper, Copy.ai, ChatGPT) but it&apos;s blind to ICP and brand positioning
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Result: plausible content <ArrowRight className="h-4 w-4 shrink-0" /> generic funnels <ArrowRight className="h-4 w-4 shrink-0" /> poor conversion
            </p>
          </div>

          {/* Data tools give numbers */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Data tools give numbers, not strategy</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Clearbit/Apollo surface firmographics and intent, not who to prioritize, what pains to speak to, or what to say
            </p>
            <p className="text-sm text-muted-foreground">
              Great for lists, not for message-market fit
            </p>
          </div>

          {/* The gap */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Triangle className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-bold text-foreground">The gap (what&apos;s missing)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              There&apos;s no clarity layer that turns a URL into validated ICPs, pains/JTBD, value props, and on-brand positioning, then carries that context into execution (LP, LinkedIn, email)
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Teams juggle 7+ tools <ArrowRight className="h-4 w-4 shrink-0" /> context lost, output inconsistent
            </p>
          </div>

          {/* The opportunity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Rocket className="h-6 w-6 gradient-text" />
              </div>
              <h3 className="text-xl font-bold text-foreground">The opportunity (what the solution must do)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              A Positioning Copilot that delivers:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">• URL <ArrowRight className="h-3 w-3 shrink-0" /> Clarity: ICPs, pains, brand positioning</li>
              <li className="flex items-center gap-2">• Clarity <ArrowRight className="h-3 w-3 shrink-0" /> Assets: on-brand landing pages, LinkedIn, and email</li>
              <li className="flex items-center gap-2">• Assets <ArrowRight className="h-3 w-3 shrink-0" /> Learning: feedback loops to improve conversion over time</li>
            </ul>
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
      description: "Paste your website URL (or use \"Show example\"); optionally add goal, market, and region."
    },
    {
      number: 2,
      title: "Analysis",
      description: "AI crawls key pages, maps brand voice/colors, product & proof, and builds a SiteContext (sitemap, messaging, competitors)."
    },
    {
      number: 3,
      title: "Personas",
      description: "Generates 3 ICP cards with role, firmographics, pains/goals, triggers, and LinkedIn lookalikes—pick one to continue."
    },
    {
      number: 4,
      title: "Value Props",
      description: "For the selected ICP, creates 5 on-brand options (hero hook, value props, objections handled, CTA + section outline)."
    },
    {
      number: 5,
      title: "Funnel",
      description: "Auto-builds Landing Page, LinkedIn, Email, and Notion/Slides from chosen ICP & value props. Export as JSON, Notion, Slides, or code in one click."
    }
  ];

  return (
    <Slide slideNumber={4}>
      <div className="space-y-10">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          From website URL to pitch-ready positioning in under 10 minutes
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
                  <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
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
                  Product Screenshot
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  Interface showing beautiful persona cards with photos, pain points, goals, and objections. Below, export options panel with buttons for Google Slides, Notion, LinkedIn, Email Templates. Clean, modern UI with purple-pink gradient accents
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
      phase: "MVP Development",
      title: "Positioning Copilot MVP",
      timeframe: "Now – Month 3",
      features: [
        "Website → Personas → Value Props → Content",
        "One-click export to Google Slides",
        "Validate fit with 50 design-partner teams"
      ],
      target: "50 customers",
      mrr: "€7.5K MRR"
    },
    {
      number: 2,
      phase: "Traction",
      title: "Multi-Format Exports",
      timeframe: "Months 4–6",
      features: [
        "Channel assets: Landing Page, LinkedIn, Email",
        "Export formats: Notion, Slides, JSON API",
        "Template Registry with quality guardrails"
      ],
      target: "200 customers",
      mrr: "€30K MRR"
    },
    {
      number: 3,
      phase: "Growth",
      title: "Brand Intelligence Platform",
      timeframe: "Months 7–12",
      features: [
        "Positioning Memory as living source of truth",
        "Consistency Scanner + competitive radar",
        "CRM integrations for closed-loop tracking"
      ],
      target: "500 customers",
      mrr: "€75K MRR"
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          From MVP to brand intelligence platform in 12 months
        </h2>

        {/* Three Phase Cards */}
        <div className="grid grid-cols-3 gap-6">
          {phases.map((phase) => (
            <div key={phase.number} className="space-y-6">
              <Card className="p-6">
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Target
                  </p>
                  <p className="text-2xl font-bold gradient-text">
                    {phase.target}
                  </p>
                  <p className="text-2xl font-bold gradient-text">
                    {phase.mrr}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Vision Statement */}
        <div className="text-center py-2">
          <p className="text-base text-muted-foreground">
            <span className="font-semibold text-foreground">Long-term vision:</span> Every B2B brand uses Flowtusk to maintain positioning clarity as a living, breathing asset
          </p>
        </div>

        {/* Illustration Placeholder */}
        <div className="border-2 border-dashed border-violet-400 dark:border-violet-600 rounded-lg bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20 px-6 py-3 flex items-center justify-center gap-4">
          <GitBranch className="h-6 w-6 gradient-text shrink-0" />
          <div className="text-center">
            <h4 className="text-xs font-semibold gradient-text inline">
              Illustration: Roadmap Timeline
            </h4>
            <span className="text-xs text-muted-foreground"> — Horizontal timeline showing three phases with key milestones marked.</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 7: Market Size
function MarketSizeSlide() {
  return (
    <Slide slideNumber={7}>
      <div className="space-y-8">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          100K+ SaaS founders and B2B marketers need positioning clarity—no good tools exist
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-12">
          {/* Left Column - Market Size */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold gradient-text mb-6">
              Market Size
            </h3>

            {/* TAM */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                TAM (Total Addressable Market)
              </p>
              <p className="text-5xl font-bold text-foreground">💰 $15B</p>
              <p className="text-sm text-muted-foreground">
                B2B marketing automation market (HubSpot, Salesforce, Marketo, ActiveCampaign).
              </p>
              <p className="text-xs text-muted-foreground italic">
                Source: Statista, Grand View Research (2024).
              </p>
            </div>

            {/* SAM */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                SAM (Serviceable Addressable Market)
              </p>
              <p className="text-5xl font-bold text-foreground">💰 $2.4B</p>
              <p className="text-sm text-muted-foreground">
                Positioning, messaging, and funnel optimization software segment — includes content AI, CRM, and conversion tools.
              </p>
              <p className="text-xs text-muted-foreground italic">
                Estimated by carving 16% of global B2B marketing software revenue from Gartner, G2Crowd data.
              </p>
            </div>

            {/* SOM */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                SOM (Serviceable Obtainable Market)
              </p>
              <p className="text-5xl font-bold text-foreground">💰 €178M</p>
              <p className="text-sm text-muted-foreground">
                ~100K SaaS founders & B2B marketers in US/EU using landing page or marketing tools × €149/month (Flowtusk entry pricing).
              </p>
              <p className="text-xs text-muted-foreground italic">
                Derived from Crunchbase + LinkedIn Sales Navigator (2025 SaaS ecosystem).
              </p>
            </div>

            {/* Adoption metric */}
            <Card className="p-4 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
              <p className="text-sm text-center leading-relaxed">
                🧮 <span className="font-bold gradient-text">5% adoption = €750K MRR</span>
              </p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                At €149/month, assuming penetration across 5K teams actively building funnels or go-to-market pages.
              </p>
            </Card>
          </div>

          {/* Right Column - Why We Win */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold gradient-text mb-6">
              Why We Win
            </h3>

            {/* Time to value */}
            <Card className="p-5 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🕐</div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time to value</p>
                  <p className="text-lg font-bold text-foreground">
                    <span className="gradient-text">10 minutes</span> → launch-ready clarity vs 4–6 weeks with consultants
                  </p>
                </div>
              </div>
            </Card>

            {/* Cost */}
            <Card className="p-5 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">💸</div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="text-lg font-bold text-foreground">
                    <span className="gradient-text">€149/month</span> vs €50K one-time positioning agency deck
                  </p>
                </div>
              </div>
            </Card>

            {/* Export flexibility */}
            <Card className="p-5 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🔁</div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Export flexibility</p>
                  <p className="text-lg font-bold text-foreground">
                    <span className="gradient-text">Publish anywhere</span> (Webflow, Notion, Slides, API) vs locked PDFs
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 8: Business Model
function BusinessModelSlide() {
  const tiers = [
    {
      name: "Starter",
      price: "€99/month",
      description: "3 personas · Basic exports (Google Slides, PDF)"
    },
    {
      name: "Professional",
      price: "€149/month",
      description: "Unlimited personas · All export formats (Slides, Notion, LinkedIn, Email) · Team collaboration"
    },
    {
      name: "Agency",
      price: "€299/month",
      description: "White-label · Client management · API + custom integrations"
    }
  ];

  return (
    <Slide slideNumber={8}>
      <div className="space-y-8">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          High-margin SaaS with strong unit economics and clear path to profitability
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Pricing Tiers */}
          <div className="space-y-4">
            {tiers.map((tier) => (
              <Card key={tier.name} className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <span className="text-2xl font-bold gradient-text">
                    {tier.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </Card>
            ))}
          </div>

          {/* Right: Unit Economics */}
          <div className="space-y-4">
            {/* Top Row: CAC and LTV */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CAC</p>
                <p className="text-4xl font-bold gradient-text">€50</p>
                <p className="text-xs text-muted-foreground mt-2">(Primarily via founder communities, Product Hunt, and organic SEO)</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">LTV</p>
                <p className="text-4xl font-bold gradient-text">€1,788</p>
                <p className="text-xs text-muted-foreground mt-2">(12-month average retention × ARPU €149/month)</p>
              </Card>
            </div>

            {/* Bottom Row: LTV:CAC and Gross Margin */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">LTV:CAC</p>
                <p className="text-4xl font-bold gradient-text">35:1</p>
                <p className="text-xs text-muted-foreground mt-2">Ultra-efficient early growth driven by organic inbound + AI differentiation</p>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gross Margin</p>
                <p className="text-4xl font-bold gradient-text">85%</p>
                <p className="text-xs text-muted-foreground mt-2">AI inference cost ≈ €20/month per active customer</p>
              </Card>
            </div>

            {/* ARR Growth Chart */}
            <Card className="p-6">
              <h4 className="text-sm font-bold text-foreground mb-4">ARR Growth Projection (3 Years)</h4>
              <div className="flex items-end justify-between gap-4 h-32">
                <div className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#8b5cf6] rounded-t mt-auto" style={{ height: '25%' }}></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">€180K</p>
                    <p className="text-xs text-muted-foreground">Year 1</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#8b5cf6] rounded-t mt-auto" style={{ height: '60%' }}></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">€720K</p>
                    <p className="text-xs text-muted-foreground">Year 2</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="w-full bg-gradient-to-t from-[#7c3aed] to-[#8b5cf6] rounded-t mt-auto" style={{ height: '100%' }}></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">€1.8M</p>
                    <p className="text-xs text-muted-foreground">Year 3</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Note */}
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-bold text-foreground">Why this matters:</span> Flowtusk scales like a content platform, not an agency. High margin, recurring usage, and export integrations make every customer a long-term compounder.
          </p>
        </Card>
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          We own the top-right quadrant: Strategic positioning intelligence + Export flexibility
        </h2>

        {/* 2x2 Quadrant Grid */}
        <div className="relative">
          {/* Grid Container */}
          <div className="grid grid-cols-2 gap-1">
            {/* Top Left */}
            <Card className="p-8 bg-muted/30 min-h-[200px] flex flex-col justify-center border border-muted-foreground/20">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Jasper / Copy.ai</h3>
                <p className="text-sm text-muted-foreground">Generic AI copywriting</p>
                <p className="text-sm text-muted-foreground">No positioning strategy</p>
              </div>
            </Card>

            {/* Top Right */}
            <Card className="p-8 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 min-h-[200px] flex flex-col justify-center border border-muted-foreground/20">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Clearbit / Data Tools</h3>
                <p className="text-sm text-muted-foreground">Firmographic data only</p>
                <p className="text-sm text-muted-foreground">No strategic insights</p>
              </div>
            </Card>

            {/* Bottom Left */}
            <Card className="p-8 bg-muted/30 min-h-[200px] flex flex-col justify-center border border-muted-foreground/20">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">Positioning Consultants</h3>
                <p className="text-sm text-muted-foreground">€15K-50K per engagement</p>
                <p className="text-sm text-muted-foreground">Locked PDF deliverable</p>
              </div>
            </Card>

            {/* Bottom Right - Flowtusk */}
            <Card className="p-8 bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 min-h-[200px] flex flex-col justify-center relative border-2 border-purple-600 dark:border-purple-500">
              <div className="space-y-3 text-center">
                <h3 className="text-2xl font-bold gradient-text">Flowtusk</h3>
                <p className="text-sm font-medium text-foreground">Strategic positioning intelligence</p>
                <p className="text-sm font-medium text-foreground">Export to anywhere</p>
                <p className="text-sm font-bold gradient-text">€149/month</p>
              </div>
            </Card>
          </div>

          {/* Axis Labels */}
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-muted-foreground uppercase tracking-wide">
            Focus
          </div>
          <div className="absolute left-0 -bottom-12 right-0 text-center text-sm text-muted-foreground uppercase tracking-wide">
            ← Low Export Flexibility — High Export Flexibility →
          </div>
          <div className="absolute left-2 top-2 text-xs text-muted-foreground">
            Low Focus, Low Export
          </div>
          <div className="absolute right-2 top-2 text-xs text-muted-foreground">
            Low Focus, High Export
          </div>
          <div className="absolute left-2 bottom-2 text-xs text-muted-foreground">
            High Focus, Low Export
          </div>
          <div className="absolute right-2 bottom-2 text-xs gradient-text font-semibold">
            High Focus, High Export
          </div>
        </div>

        {/* Our Moat */}
        <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
          <h3 className="text-lg font-bold text-center mb-4">Our Moat</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <Brain className="h-8 w-8 gradient-text mx-auto" />
              <p className="text-sm font-medium">B2B Positioning Expertise</p>
            </div>
            <div className="space-y-2">
              <Bot className="h-8 w-8 gradient-text mx-auto" />
              <p className="text-sm font-medium">AI-Powered Intelligence</p>
            </div>
            <div className="space-y-2">
              <Download className="h-8 w-8 gradient-text mx-auto" />
              <p className="text-sm font-medium">Multi-Format Export Flexibility</p>
            </div>
          </div>
        </Card>
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Proven founder with deep B2B positioning expertise and track record
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-12">
          {/* Left: Founder Profile */}
          <div className="col-span-2 space-y-6">
            {/* Photo Placeholder */}
            <Card className="p-12 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 flex flex-col items-center justify-center space-y-4">
              <Users className="h-24 w-24 gradient-text" />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold gradient-text">
                  Founder Photo
                </p>
                <p className="text-xs text-muted-foreground">
                  Professional headshot
                </p>
              </div>
            </Card>

            {/* Name & Title */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Md Hasan Shahriar</h3>
              <p className="text-lg gradient-text font-medium">Founder & CEO</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold gradient-text">10+</div>
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
          </div>

          {/* Right: Experience Timeline */}
          <div className="col-span-3 space-y-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Experience Timeline</h3>
            
            <div className="space-y-6">
              {[
                {
                  period: "2014-2016",
                  title: "Started at Nordea Bank",
                  description: "Intern in marketing department, learned B2B financial services positioning"
                },
                {
                  period: "2016-2020",
                  title: "B2B Marketing Specialist",
                  description: "Led campaigns for enterprise clients including KONE and TietoEvry"
                },
                {
                  period: "2020-2024",
                  title: "Positioning Consultant",
                  description: "Independent consultant helping B2B SaaS companies articulate positioning. Generated €61K YTD revenue working with Zipli, Arkken, and others"
                },
                {
                  period: "2025",
                  title: "Founded Flowtusk",
                  description: "Building the positioning copilot to scale expertise and help 1000s of founders"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] mt-2 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold gradient-text uppercase tracking-wide">
                      {item.period}
                    </div>
                    <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Expertise */}
            <div className="pt-6 border-t">
              <h4 className="text-sm font-bold text-foreground mb-3">Core Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "B2B SaaS Positioning",
                  "ICP Development",
                  "Value Proposition Design",
                  "Messaging Strategy",
                  "Enterprise Marketing"
                ].map((skill, idx) => (
                  <Badge key={idx} className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900">
                    <span className="gradient-text font-semibold">{skill}</span>
                  </Badge>
                ))}
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
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

