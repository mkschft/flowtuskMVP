import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { DependableFeatures } from "./components/DependableFeatures";
import { Testimonial } from "./components/Testimonial";
import { Footer } from "./components/Footer";

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
