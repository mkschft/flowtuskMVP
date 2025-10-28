"use client";

import { Card } from "@/components/ui/card";
import { Globe, Brain, Users, Wand2, Download, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Globe,
      title: "URL Input",
      description: "Paste your website URL and we'll crawl and analyze your content, messaging, and visual identity"
    },
    {
      number: 2,
      icon: Brain,
      title: "AI Analysis",
      description: "Our AI extracts customer insights, pain points, and identifies your ideal customer profiles"
    },
    {
      number: 3,
      icon: Users,
      title: "ICP Cards",
      description: "Get detailed customer personas with demographics, goals, challenges, and LinkedIn profiles"
    },
    {
      number: 4,
      icon: Wand2,
      title: "Value Props",
      description: "Generate personalized value propositions and messaging variations for each customer segment"
    },
    {
      number: 5,
      icon: Download,
      title: "Export Templates",
      description: "Download ready-to-use content for emails, LinkedIn, landing pages, and pitch decks"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Website → Clarity → Templates → Launch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From website analysis to ready-to-use marketing materials in 5 simple steps. 
              No guesswork, no generic templates.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="relative">
                  <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    {/* Step Number */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-medium text-gray-900 mb-3 text-lg">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </Card>

                  {/* Arrow (except for last step) */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
              <Globe className="h-5 w-5 mr-2" />
              Try it now - takes 2 minutes
            </div>
            <p className="text-sm text-gray-500 mt-2">
              No signup required • Free to try
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
