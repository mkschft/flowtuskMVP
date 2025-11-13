"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Perfect for trying Flowtusk",
      features: [
        "3 analyses per month",
        "View ICP cards",
        "Download as PNG",
        "Flowtusk watermark",
        "Community support"
      ],
      cta: "Try Free Now",
      popular: false,
      link: "/app"
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For serious marketers and founders",
      features: [
        "Unlimited analyses",
        "PDF/Figma/Webflow export",
        "Remove watermark",
        "Advanced insights",
        "Priority support",
        "API access (coming soon)"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      link: "/checkout?plan=pro"
    },
    {
      name: "Lifetime Deal",
      price: "$290",
      period: "one-time",
      badge: "Limited",
      description: "Early adopter special - First 100 users",
      features: [
        "Everything in Pro",
        "Lifetime access",
        "Early adopter badge",
        "Influence roadmap",
        "Private Discord",
        "Future premium features"
      ],
      cta: "Claim Lifetime Deal",
      popular: false,
      link: "/checkout?plan=lifetime",
      urgent: true
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4 leading-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose the plan that fits your needs. All plans include our core features.
              No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative p-8 ${
                  plan.popular
                    ? 'border-2 border-blue-500 shadow-xl scale-105'
                    : 'border border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d32d1] hover:to-[#7c3aed]'
                      : (plan as any).urgent
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : ''
                  }`}
                  variant={plan.popular || (plan as any).urgent ? "default" : "outline"}
                >
                  <Link href={(plan as any).link || "/app"}>
                    {plan.cta}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          {/* Urgency Counter */}
          <div className="text-center mt-8">
            <div className="inline-block px-6 py-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <p className="text-sm font-semibold text-amber-900">
                ⚡ <strong>87/100</strong> lifetime deals claimed
              </p>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="text-center mt-8">
            <Card className="inline-block p-6 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">14-day free trial</h4>
                  <p className="text-sm text-gray-600">No credit card required • Cancel anytime</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
