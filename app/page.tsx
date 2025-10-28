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
import { createClient } from "@/lib/supabase/server";
import { ChatPageWrapper } from "@/components/ChatPageWrapper";

export default async function RootPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const user = data?.claims;

  // If user is authenticated, show the chat interface
  if (user) {
    return <ChatPageWrapper />;
  }

  // If user is not authenticated, show the landing page
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