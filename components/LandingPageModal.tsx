"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, ChevronDown, Download, FileCode } from "lucide-react";
import { useCopyToClipboard } from "@/lib/use-copy-to-clipboard";

type LandingPageModalProps = {
  onClose: () => void;
};

export function LandingPageModal({ onClose }: LandingPageModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const heroSection = {
    h1: "Automate Your Accounting Firm's Workflows in 30 Days",
    subheading: "Save 40% of your time on admin tasks. Used by 500+ mid-market firms.",
    primaryCTA: "Start Free Trial →",
    secondaryCTA: "Watch 3-Min Demo",
  };

  const valueProps = [
    {
      icon: "⚡",
      title: "40% Time Savings",
      description: "Stop spending 15+ hours/week on manual tasks",
    },
    {
      icon: "🔗",
      title: "All-in-One Integration",
      description: "QuickBooks + Excel + CRM in one platform",
    },
    {
      icon: "📈",
      title: "Scale Without Hiring",
      description: "Handle 30% more clients with your current team",
    },
  ];

  const socialProof = {
    headline: "Trusted by 500+ Accounting Firms",
    testimonials: [
      {
        quote: "We saved $45K in the first year and handle 30% more clients.",
        author: "Sarah Chen",
        title: "Managing Partner, Chen & Associates CPAs",
      },
      {
        quote: "Cut our admin time in half. Game changer for our firm.",
        author: "Michael Torres",
        title: "Founder, Torres & Partners",
      },
      {
        quote: "Finally, automation that actually works for accountants.",
        author: "Jennifer Kim",
        title: "Owner, Kim Tax Services",
      },
    ],
  };

  const pricing = {
    headline: "Simple, Transparent Pricing",
    plans: [
      {
        name: "Starter",
        price: "$299/mo",
        features: [
          "Up to 10 employees",
          "Core automation workflows",
          "Email support",
          "QuickBooks integration",
        ],
      },
      {
        name: "Growth",
        price: "$599/mo",
        badge: "Most Popular",
        features: [
          "Up to 25 employees",
          "Advanced automation",
          "Priority support",
          "Custom integrations",
          "Dedicated account manager",
        ],
      },
    ],
  };

  const faq = [
    {
      question: "How long does implementation take?",
      answer: "Most firms are fully set up within 30 days. Our onboarding team will guide you through each step.",
    },
    {
      question: "Do you integrate with QuickBooks?",
      answer: "Yes, we integrate with QuickBooks, Xero, and 50+ other accounting tools.",
    },
    {
      question: "What if I need help?",
      answer: "All plans include email support. Growth plan customers get priority support and a dedicated account manager.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, no long-term contracts. Cancel anytime with 30 days notice.",
    },
  ];

  const exportHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heroSection.h1}</title>
</head>
<body>
  <h1>${heroSection.h1}</h1>
  <p>${heroSection.subheading}</p>
  <button>${heroSection.primaryCTA}</button>
  <button>${heroSection.secondaryCTA}</button>
  <!-- Add more sections here -->
</body>
</html>`;
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landing-page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">🌐 Landing Page Copy</DialogTitle>
            <DialogDescription>
              Complete landing page for accounting firm owners
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Hero Section - Always Visible */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">HERO SECTION</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copy(`${heroSection.h1}\n\n${heroSection.subheading}\n\n${heroSection.primaryCTA} | ${heroSection.secondaryCTA}`)
                  }
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    H1:
                  </p>
                  <p className="text-xl font-bold">{heroSection.h1}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Subheading:
                  </p>
                  <p className="text-base text-muted-foreground">
                    {heroSection.subheading}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    {heroSection.primaryCTA}
                  </Button>
                  <Button variant="outline">{heroSection.secondaryCTA}</Button>
                </div>
              </div>
            </Card>

            {/* Value Props - Always Visible */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">VALUE PROPOSITIONS (3 Columns)</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copy(
                      valueProps
                        .map((vp) => `${vp.icon} ${vp.title}\n${vp.description}`)
                        .join("\n\n")
                    )
                  }
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {valueProps.map((prop, idx) => (
                  <div key={idx} className="text-center p-4 rounded-lg bg-muted/50 border">
                    <div className="text-3xl mb-3">{prop.icon}</div>
                    <h4 className="font-bold mb-2">{prop.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {prop.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Social Proof - Collapsible */}
            <Collapsible
              open={expandedSection === "social"}
              onOpenChange={() =>
                setExpandedSection(expandedSection === "social" ? null : "social")
              }
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold text-left">SOCIAL PROOF SECTION</h3>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSection === "social" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    <h4 className="text-xl font-bold text-center mb-6">
                      {socialProof.headline}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {socialProof.testimonials.map((testimonial, idx) => (
                        <Card key={idx} className="p-4 bg-muted/30">
                          <p className="text-sm italic mb-3">"{testimonial.quote}"</p>
                          <div className="text-xs">
                            <p className="font-semibold">{testimonial.author}</p>
                            <p className="text-muted-foreground">{testimonial.title}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Pricing - Collapsible */}
            <Collapsible
              open={expandedSection === "pricing"}
              onOpenChange={() =>
                setExpandedSection(expandedSection === "pricing" ? null : "pricing")
              }
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold text-left">PRICING SECTION</h3>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSection === "pricing" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    <h4 className="text-xl font-bold text-center mb-6">
                      {pricing.headline}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                      {pricing.plans.map((plan, idx) => (
                        <Card
                          key={idx}
                          className={`p-6 ${
                            plan.badge
                              ? "border-2 border-purple-500 shadow-lg"
                              : ""
                          }`}
                        >
                          {plan.badge && (
                            <div className="text-xs font-semibold text-purple-600 mb-2">
                              {plan.badge}
                            </div>
                          )}
                          <h5 className="text-xl font-bold mb-2">{plan.name}</h5>
                          <p className="text-3xl font-bold mb-4">{plan.price}</p>
                          <ul className="space-y-2">
                            {plan.features.map((feature, fIdx) => (
                              <li key={fIdx} className="text-sm flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button className="w-full mt-6">Choose {plan.name}</Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* FAQ - Collapsible */}
            <Collapsible
              open={expandedSection === "faq"}
              onOpenChange={() =>
                setExpandedSection(expandedSection === "faq" ? null : "faq")
              }
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold text-left">FAQ SECTION</h3>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSection === "faq" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    {faq.map((item, idx) => (
                      <div key={idx} className="border-b pb-4 last:border-0">
                        <h5 className="font-semibold mb-2">{item.question}</h5>
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={exportHTML} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <FileCode className="w-4 h-4 mr-2" />
              Download HTML
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

