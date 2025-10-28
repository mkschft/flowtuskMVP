"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle, Target, MessageSquare, Users } from "lucide-react";

export function ProblemSection() {
  const painPoints = [
    {
      icon: Target,
      title: "Generic landing pages",
      description: "One-size-fits-all messaging that doesn't resonate with your actual customers",
      result: "Low conversions"
    },
    {
      icon: MessageSquare,
      title: "Random LinkedIn posts",
      description: "Posting content without knowing who you're talking to or what they care about",
      result: "No engagement"
    },
    {
      icon: Users,
      title: "Email sequences that don't resonate",
      description: "Sending generic emails to everyone instead of personalized messages",
      result: "Deleted"
    },
    {
      icon: AlertTriangle,
      title: "Building for everyone",
      description: "Trying to appeal to all customers instead of focusing on your ideal audience",
      result: "No focus"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              You&apos;re building for everyone.{" "}
              <span className="text-red-600">That&apos;s why nothing works.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Most B2B companies struggle with the same fundamental problem: they don&apos;t know who they&apos;re really selling to.
            </p>
          </div>

          {/* Pain Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {painPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <Card 
                  key={index}
                  className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-red-200 bg-red-50/30"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">{point.title}</h3>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {point.description}
                  </p>
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    → {point.result}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-4">
              Sound familiar? You&apos;re not alone. But there&apos;s a better way.
            </p>
            <div className="inline-flex items-center text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Keep reading to see how we solve this
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
