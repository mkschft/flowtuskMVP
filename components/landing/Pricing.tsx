"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "€9",
      period: "/mo",
      description: "Perfect for solo entrepreneurs and small teams",
      features: [
        "3 personas per website",
        "Standard templates",
        "Email sequences",
        "LinkedIn posts",
        "Landing page templates",
        "Google Slides export",
        "Plain text export",
        "Basic support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "€49",
      period: "/mo",
      description: "Best for growing businesses and marketing teams",
      features: [
        "Unlimited personas",
        "All templates",
        "Advanced value props",
        "Priority support",
        "Team collaboration",
        "Custom branding",
        "API access",
        "Advanced analytics"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Teams",
      price: "€149",
      period: "/mo",
      description: "For large organizations and agencies",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "API access",
        "White-label options",
        "Custom integrations",
        "Dedicated support",
        "Advanced reporting",
        "Custom training"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
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
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/app">
                    {plan.cta}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          {/* Bottom Message */}
          <div className="text-center mt-12">
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
