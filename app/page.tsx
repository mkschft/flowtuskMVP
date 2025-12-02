import { Navigation } from "./landing/components/Navigation";
import { Hero } from "./landing/components/Hero";
import { HowItWorksSection } from "./landing/components/HowItWorksSection";
import { DependableFeatures } from "./landing/components/DependableFeatures";
import { Testimonial } from "./landing/components/Testimonial";
import { Footer } from "./landing/components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <main className="grow">
        <Hero />
        <HowItWorksSection />
        <DependableFeatures />
        <Testimonial />
      </main>
      <Footer />
    </>
  );
}
