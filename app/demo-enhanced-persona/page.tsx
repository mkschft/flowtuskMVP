"use client";

import { EnhancedPersonaShowcase } from "@/components/EnhancedPersonaShowcase";

export default function DemoEnhancedPersonaPage() {
  const handlePersonalityChange = (traitId: string, value: number) => {
    console.log(`Personality trait ${traitId} changed to ${value}`);
  };

  const handleMotivationChange = (motivationId: string, weight: number) => {
    console.log(`Motivation ${motivationId} weight changed to ${weight}%`);
  };

  const handleRegenerate = async (persona: any) => {
    console.log("Regenerating with updated persona:", persona);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Regeneration complete!");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enhanced Persona Showcase
          </h1>
          <p className="text-muted-foreground">
            Interactive persona profile with personality sliders, motivations, and AI-powered insights
          </p>
        </div>

        <EnhancedPersonaShowcase
          onPersonalityChange={handlePersonalityChange}
          onMotivationChange={handleMotivationChange}
          onRegenerate={handleRegenerate}
          readOnly={false}
        />

        <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
          <h2 className="font-bold mb-2">Component Features:</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✅ Three-layer structure (Hero, Details, Insights Grid)</li>
            <li>✅ Interactive personality sliders (0-100)</li>
            <li>✅ Adjustable motivation weights with visual bars</li>
            <li>✅ Behavioral patterns organized by category</li>
            <li>✅ 4-column insights grid (Pain Points, Growth Opportunities, Value Props, Content)</li>
            <li>✅ Copyable content with hover actions</li>
            <li>✅ Priority badges (high/medium/low)</li>
            <li>✅ Expandable sections with show more/less</li>
            <li>✅ "Regenerate with New Adjustments" button</li>
            <li>✅ Fully responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

