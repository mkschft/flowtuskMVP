import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CaseStudy } from "@/components/landing/CaseStudy";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CompetitiveEdge } from "@/components/landing/CompetitiveEdge";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Problem Section */}
        <ProblemSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Case Study */}
        <CaseStudy />

        {/* Features Grid */}
        <FeaturesGrid />

        {/* Competitive Edge */}
        <CompetitiveEdge />

        {/* Pricing */}
        <Pricing />

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}