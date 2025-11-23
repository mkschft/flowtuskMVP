"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  Layers,
  BarChart3,
  Users,
  Settings,
  Star,
  ArrowRight,
  Check,
  Menu
} from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getTextGradientStyle, getGradientBgStyle, getLightShade } from "@/lib/utils/color-utils";

type LandingCanvasProps = {
  project: DesignProject;
  manifest?: BrandManifest | null;
};

// Icon mapping for features
const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
  layers: <Layers className="w-6 h-6" />,
  chart: <BarChart3 className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  settings: <Settings className="w-6 h-6" />,
  target: <Sparkles className="w-6 h-6" />,
  palette: <Sparkles className="w-6 h-6" />,
  monitor: <Layers className="w-6 h-6" />,
  book: <Layers className="w-6 h-6" />,
  image: <Sparkles className="w-6 h-6" />,
  refresh: <ArrowRight className="w-6 h-6" />,
};

export function LandingCanvas({ project, manifest }: LandingCanvasProps) {
  const { landingPage } = project;

  // Get dynamic colors from manifest
  const primaryColor = getPrimaryColor(manifest);
  const secondaryColor = getSecondaryColor(manifest);
  const textGradientStyle = getTextGradientStyle(manifest);
  const gradientBgStyle = getGradientBgStyle(manifest, "to-r");
  const lightPrimaryBg = getLightShade(primaryColor, 0.1);
  const lightSecondaryBg = getLightShade(secondaryColor, 0.1);

  // Safe access helpers
  const navigation = landingPage?.navigation || { logo: "", links: [] };
  const hero = landingPage?.hero || { headline: "", subheadline: "", cta: { primary: "", secondary: "" } };
  const features = landingPage?.features || [];
  const socialProof = landingPage?.socialProof || [];
  const pricing = landingPage?.pricing || [];
  const footer = landingPage?.footer || { sections: [] };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Browser Chrome */}
      <div className="rounded-lg border border-border bg-background shadow-2xl overflow-hidden">
        {/* Browser Bar */}
        <div className="h-10 px-4 flex items-center justify-between border-b bg-muted/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 px-3 bg-background rounded flex items-center text-xs text-muted-foreground">
              {project.name.toLowerCase().replace(/\s+/g, "")}.com
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Preview</Badge>
        </div>

        {/* Landing Page Content */}
        <div className="bg-background overflow-y-auto max-h-[800px]">
          {/* Navigation */}
          <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <div className="font-bold text-xl">{navigation.logo}</div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                {navigation.links.map((link, idx) => (
                  <a key={idx} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Log In</Button>
                <Button size="sm">Get Started</Button>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="container mx-auto px-6 py-20 text-center">
            <Badge className="mb-6" variant="secondary">
              ✨ New: AI-powered features
            </Badge>
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
              style={textGradientStyle}
            >
              {hero.headline}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2">
                {hero.cta.primary}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                {hero.cta.secondary}
              </Button>
            </div>

            {/* Hero Image Placeholder */}
            <div 
              className="mt-12 rounded-xl border border-border aspect-video flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${lightPrimaryBg} 0%, ${lightSecondaryBg} 100%)`
              }}
            >
              <div className="text-center">
                <Layers className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Product Screenshot</p>
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="border-y bg-muted/30 py-8">
            <div className="container mx-auto px-6">
              <p className="text-center text-sm text-muted-foreground mb-6">
                Trusted by leading companies
              </p>
              <div className="flex items-center justify-center gap-8 opacity-40">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-24 h-8 bg-muted rounded" />
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="container mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <Badge className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to help you work smarter and faster
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: lightPrimaryBg }}
                  >
                    {iconMap[feature.icon] || <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/30 py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <Badge className="mb-4">Testimonials</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Loved by teams everywhere
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {socialProof
                  .filter((item) => item.type === "testimonial")
                  .map((testimonial, idx) => (
                    <Card key={idx} className="p-6">
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm mb-4 italic">{testimonial.content}</p>
                    </Card>
                  ))}
              </div>

              {/* Stats */}
              <div className="mt-12 text-center">
                {socialProof
                  .filter((item) => item.type === "stat")
                  .map((stat, idx) => (
                    <p key={idx} className="text-lg font-semibold" style={{ color: primaryColor }}>
                      {stat.content}
                    </p>
                  ))}
              </div>
            </div>
          </section>

          {/* Pricing (if available) */}
          {pricing && pricing.length > 0 && (
            <section className="container mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <Badge className="mb-4">Pricing</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Simple, transparent pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose the plan that's right for you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {pricing.map((tier, idx) => (
                  <Card
                    key={idx}
                    className={`p-6 ${idx === 1 ? "border border-purple-500 shadow-lg relative" : ""
                      }`}
                  >
                    {idx === 1 && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <h3 className="font-bold text-xl mb-2">{tier.tier}</h3>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">{tier.price}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={idx === 1 ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section 
            className="text-white py-20"
            style={gradientBgStyle}
          >
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of teams already using {project.name}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary">
                  {hero.cta.primary}
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  {hero.cta.secondary}
                </Button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t bg-muted/30 py-12">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                {footer.sections.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="font-bold mb-3">{section.title}</h4>
                    <ul className="space-y-2">
                      {section.links.map((link, lIdx) => (
                        <li key={lIdx}>
                          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>© 2024 {project.name}. All rights reserved.</p>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-foreground">Privacy</a>
                  <a href="#" className="hover:text-foreground">Terms</a>
                  <a href="#" className="hover:text-foreground">Security</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

