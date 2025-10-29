"use client";

import { useState, useEffect } from "react";
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
  Image,
  Bot,
  BarChart3,
  Triangle,
  GitBranch,
  Monitor,
  Download
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
      <div className="text-center space-y-8">
        {/* Logo/Brand */}
        <div className="inline-block">
          <div className="text-6xl font-bold gradient-text mb-4">
            Flowtusk
          </div>
          <p className="text-xl text-muted-foreground">
            The Shortcut from Brand to Funnel
          </p>
        </div>

        {/* Main Tagline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight">
          Vibe create your B2B funnel<br />
          <span className="gradient-text">in minutes not weekends</span>
        </h1>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>October 2025</span>
          <Circle className="h-1 w-1 fill-current" />
          <span>Series Seed</span>
          <Circle className="h-1 w-1 fill-current" />
          <span>B2B SaaS</span>
        </div>
      </div>
    </Slide>
  );
}

// Slide 2: Problem
function ProblemSlide() {
  const problems = [
    {
      title: "Inconsistent messaging",
      description: "Different pitch on website, deck, LinkedIn, sales calls",
      barWidth: "w-3/5"
    },
    {
      title: "No clear ICP",
      description: '"We sell to everyone" or vague gut feelings about customers',
      barWidth: "w-3/5"
    },
    {
      title: "Wasted time",
      description: "3-6 weeks to articulate positioning, often still unclear",
      barWidth: "w-3/5"
    },
    {
      title: "Expensive solutions",
      description: "Positioning consultants charge €15K-50K for a PDF deck",
      barWidth: "w-3/5"
    }
  ];

  return (
    <Slide slideNumber={2}>
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-sm">
            Problem
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-4xl">
            Founders and marketers don&apos;t know who they&apos;re selling to—or how to talk about it
          </h2>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-5 gap-8">
          {/* Left Column - Problem Items */}
          <div className="col-span-3 space-y-6">
            {problems.map((problem, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 min-w-fit">
                    {problem.title}
                  </h3>
                  <div className={`h-2 rounded-full bg-purple-500 ${problem.barWidth}`} />
                </div>
                <p className="text-sm text-muted-foreground pl-0">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column - Illustration Placeholder */}
          <div className="col-span-2 flex items-center">
            <div className="w-full h-full min-h-[300px] border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-xl bg-purple-50/30 dark:bg-purple-950/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Image className="h-16 w-16 text-pink-500 dark:text-pink-400" />
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                  Illustration: Positioning Chaos
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Split-screen visualization showing chaotic sticky notes, scattered whiteboard ideas, and tangled messaging on the left vs. clean, organized positioning document with clear personas and value props on the right. Conveys the before/after transformation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 p-6 rounded-r-lg">
          <p className="text-lg italic text-foreground mb-2">
            &quot;We&apos;ve pivoted 3 times this year. Our website still talks about our old product.&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            — SaaS Founder, Helsinki
          </p>
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
          2025: GenAI has transformed content creation, but positioning intelligence is still manual
        </h2>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Content AI is commoditized */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Content AI is commoditized</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-15">
              Jasper, Copy.ai, ChatGPT write copy—but they don&apos;t know WHO you&apos;re selling to
            </p>
          </div>

          {/* Data tools give numbers */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Data tools give numbers, not strategy</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-15">
              Clearbit provides firmographics, not positioning insights
            </p>
          </div>

          {/* The gap */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Triangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">The gap</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-15">
              No tool bridges strategic positioning + tactical execution
            </p>
          </div>

          {/* The opportunity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground">The opportunity</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-15">
              &quot;Vibe-creating&quot; for positioning—just like Bolt.new did for coding
            </p>
          </div>
        </div>

        {/* Middle statement */}
        <div className="bg-muted/50 py-6 px-8 rounded-lg">
          <p className="text-xl font-medium text-center text-foreground">
            The same transformation that happened to coding is ready to happen to positioning.
          </p>
        </div>

        {/* Bottom illustration placeholder */}
        <div className="border-2 border-dashed border-pink-400 dark:border-pink-600 rounded-xl bg-pink-50/30 dark:bg-pink-950/20 p-8 flex flex-col items-center justify-center space-y-4">
          <GitBranch className="h-12 w-12 text-pink-500 dark:text-pink-400" />
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-pink-700 dark:text-pink-300">
              Illustration: Evolution Timeline
            </h4>
            <p className="text-xs text-muted-foreground max-w-3xl">
              Timeline graphic showing progression: Manual positioning with consultants (2020) → Generic AI copy tools (2023) → Positioning Copilot (2025). Use arrows and visual milestones to show the gap that Flowtusk fills.
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
      description: "Paste your website URL"
    },
    {
      number: 2,
      title: "Analysis",
      description: "AI scrapes site, analyzes messaging, identifies market positioning"
    },
    {
      number: 3,
      title: "Personas",
      description: "3 detailed customer profiles appear with visual cards"
    },
    {
      number: 4,
      title: "Value Props",
      description: "For each persona, see tailored messaging, pain points addressed, objections handled"
    },
    {
      number: 5,
      title: "Export",
      description: "Download as pitch deck, copy to Notion, generate LinkedIn posts, create email templates"
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
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
            <div className="w-full h-full min-h-[400px] border-2 border-dashed border-pink-400 dark:border-pink-600 rounded-xl bg-pink-50/30 dark:bg-pink-950/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Monitor className="h-16 w-16 text-pink-500 dark:text-pink-400" />
              <div className="space-y-2">
                <h4 className="font-semibold text-pink-700 dark:text-pink-300">
                  Product Screenshot
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                  Interface showing beautiful persona cards with photos, pain points, goals, and objections. Below, export options panel with buttons for Google Slides, Notion, LinkedIn, Email Templates. Clean, modern UI with purple-pink gradient accents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 5: Before/After (Real Examples)
function BeforeAfterSlide() {
  return (
    <Slide slideNumber={5}>
      <div className="space-y-12">
        <div className="space-y-4">
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Proof
          </Badge>
          <h2 className="text-5xl font-bold">
            How This <span className="gradient-text">Changes Your Workflow</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <Card className="p-8 border-2 border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10">
            <h3 className="text-2xl font-bold mb-6 text-red-700 dark:text-red-400">
              ❌ Before Flowtusk
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Day 1-2:</span>
                <span>&quot;Who are our customers?&quot; → Workshop or guesswork</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Day 3-4:</span>
                <span>Write landing page → Generic, untargeted</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Day 5-6:</span>
                <span>Email sequence → Template-based</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Day 7-8:</span>
                <span>LinkedIn posts → Random ideas</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Day 9+:</span>
                <span>A/B test → Hope something works</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-red-300 dark:border-red-700">
              <p className="font-bold text-red-700 dark:text-red-400">
                Result: 2 weeks, inconsistent messaging, mediocre conversions
              </p>
            </div>
          </Card>

          {/* After */}
          <Card className="p-8 border-2 border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10">
            <h3 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-400">
              ✅ With Flowtusk
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Min 0:</span>
                <span className="font-bold">Paste website URL</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Min 5:</span>
                <span>&quot;You have 3 customer types: VP Sales, Head of Product, Marketing Manager&quot;</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Min 10:</span>
                <span>Email sequences ready (per persona, optimized)</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Min 15:</span>
                <span>LinkedIn templates ready</span>
              </div>
              <div className="flex gap-3">
                <span className="font-mono text-muted-foreground shrink-0">Min 20:</span>
                <span>Landing page + pitch deck + Twitter posts ready</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-green-300 dark:border-green-700">
              <p className="font-bold text-green-700 dark:text-green-400">
                Result: 20 minutes, consistent messaging, higher conversions
              </p>
            </div>
          </Card>
        </div>

        {/* Case Study */}
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💼</div>
            <div>
              <Badge className="mb-2">Real Case Study</Badge>
              <p className="text-lg font-medium leading-relaxed">
                &quot;KONE marketing team typically spent <span className="font-bold text-red-600">3-4 days</span> on discovery + messaging.
                With Flowtusk, they got persona clarity + templates in <span className="font-bold text-green-600">15 minutes</span>.
                Launched same day. First campaign: <span className="font-bold gradient-text">500 qualified leads in 2 weeks</span>.&quot;
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Slide>
  );
}

// Slide 6: MVP vs Vision
function MVPVisionSlide() {
  return (
    <Slide slideNumber={6}>
      <div className="space-y-12">
        <div className="space-y-4">
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            Roadmap
          </Badge>
          <h2 className="text-5xl font-bold leading-tight">
            Available <span className="gradient-text">Today</span> vs Coming Soon
          </h2>
          <p className="text-xl text-muted-foreground">
            Start creating campaigns today. Scale into full automation tomorrow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Available Today */}
          <Card className="p-8 border-2 border-green-200 dark:border-green-800 bg-green-50/20 dark:bg-green-950/10">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Available TODAY
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Website → Customer personas",
                "Beautiful ICP cards (share ready)",
                "Value prop generation (per persona)",
                "Email sequence templates",
                "LinkedIn outreach copy",
                "Google Slides templates",
                "Pitch deck templates",
                "X/Twitter post ideas",
                "Bio/positioning text",
                "Export everything (copy-paste)"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Coming Soon */}
          <Card className="p-8 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/10">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              Coming Q4/Q1
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Full landing page builder",
                "Automated email scheduling",
                "Multi-channel orchestration",
                "Analytics & performance tracking",
                "CRM integrations (HubSpot, Salesforce)",
                "A/B testing recommendations",
                "Team collaboration features",
                "API access"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Rocket className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Slide>
  );
}

// Slide 7: Market
function MarketSlide() {
  return (
    <Slide slideNumber={7}>
      <div className="space-y-12">
        <div className="space-y-4">
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            Market
          </Badge>
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">150K+ B2B founders</span><br />
            buying templates
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="p-8 text-center border-2">
            <div className="text-4xl font-bold gradient-text mb-2">$100B+</div>
            <div className="text-sm text-muted-foreground">TAM: B2B SaaS Market</div>
          </Card>
          <Card className="p-8 text-center border-2">
            <div className="text-4xl font-bold gradient-text mb-2">$15B</div>
            <div className="text-sm text-muted-foreground">SAM: Marketing Tools</div>
          </Card>
          <Card className="p-8 text-center border-2">
            <div className="text-4xl font-bold gradient-text mb-2">€300M</div>
            <div className="text-sm text-muted-foreground">SOM: Annual Opportunity</div>
          </Card>
        </div>

        {/* Why Now section */}
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
          <h3 className="text-2xl font-bold mb-4">Why Now?</h3>
          <ul className="space-y-3">
            {[
              "GenAI makes persona generation fast + reliable",
              "Founders want speed (not weeks of consulting)",
              "Everyone building go-to-market in weeks not months",
              "No integrated solution exists"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Slide>
  );
}

// Slide 8: Traction
function TractionSlide() {
  return (
    <Slide slideNumber={8}>
      <div className="space-y-12">
        <div className="space-y-4">
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Traction
          </Badge>
          <h2 className="text-5xl font-bold">
            Proof & <span className="gradient-text">Early Validation</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2">
            <div className="text-5xl font-bold gradient-text mb-2">€61K</div>
            <div className="text-lg font-medium mb-1">Consulting Revenue</div>
            <div className="text-sm text-muted-foreground">Proof founders want this</div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2">
            <div className="text-5xl font-bold gradient-text mb-2">150+</div>
            <div className="text-lg font-medium mb-1">Waitlist Signups</div>
            <div className="text-sm text-muted-foreground">Demand validation</div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2">
            <div className="text-5xl font-bold gradient-text mb-2">3</div>
            <div className="text-lg font-medium mb-1">Enterprise Pilots</div>
            <div className="text-sm text-muted-foreground">KONE, Zipli, Arkken</div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2">
            <div className="text-5xl font-bold gradient-text mb-2">✓</div>
            <div className="text-lg font-medium mb-1">MVP Complete</div>
            <div className="text-sm text-muted-foreground">All core features working</div>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Pilot Results</h3>
          <div className="grid gap-4">
            {[
              {
                company: "KONE",
                quote: "Saved 3-4 days per campaign. Faster, more targeted. 500 leads in 2 weeks.",
                metric: "500 leads"
              },
              {
                company: "Zipli",
                quote: "Email templates → 70% higher engagement than previous campaigns",
                metric: "70% ↑"
              },
              {
                company: "Arkken",
                quote: "Finally consistent messaging across LinkedIn, landing pages, and pitches",
                metric: "Consistent"
              }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 border-l-4 border-l-green-500">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">{item.company}</div>
                    <p className="text-sm text-muted-foreground italic">&quot;{item.quote}&quot;</p>
                  </div>
                  <Badge className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">{item.metric}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

// Slide 9: CTA
function CTASlide() {
  return (
    <Slide slideNumber={9}>
      <div className="text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-6xl md:text-7xl font-bold leading-tight">
            Ready to<br />
            <span className="gradient-text">Vibe Create Your Funnel?</span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            Website → Personas → Templates → Launch
          </p>
        </div>

        <div className="space-y-6">
          <Button 
            size="lg" 
            className="h-16 px-12 text-xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700"
          >
            <Rocket className="mr-3 h-6 w-6" />
            Try Flowtusk Now
          </Button>

          <div className="flex items-center justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>15 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Export everything</span>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t max-w-2xl mx-auto">
          <div className="text-lg text-muted-foreground">
            Contact: <span className="font-medium">hello@flowtusk.com</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            flowtusk.com • @flowtusk
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
    <BeforeAfterSlide key="beforeafter" />,
    <MVPVisionSlide key="mvp" />,
    <MarketSlide key="market" />,
    <TractionSlide key="traction" />,
    <CTASlide key="cta" />,
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
    <div className="relative w-full h-screen bg-background overflow-hidden">
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
                  ? 'w-8 bg-gradient-to-r from-pink-600 to-purple-600'
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

