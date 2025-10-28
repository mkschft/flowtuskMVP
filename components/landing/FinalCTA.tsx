"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Play } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            Ready to Know Your Customers?
          </h2>

          {/* Subheading */}
          <p className="text-lg md:text-xl mb-6 opacity-90 leading-relaxed">
            Get customer clarity + ready-to-use templates in 15 minutes. 
            No credit card required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg h-auto"
              asChild
            >
              <Link href="/app">
                <Sparkles className="mr-2 h-6 w-6" />
                Vibe Create Your Funnel
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg h-auto"
              asChild
            >
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                View Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">15 min</div>
              <div className="text-sm opacity-80">Setup time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">3x</div>
              <div className="text-sm opacity-80">Better conversion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-sm opacity-80">Happy customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
