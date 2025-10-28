"use client";

import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote: "This saved us 3 days of discovery work every project. We went from generic messaging to targeted campaigns that actually convert.",
      author: "KONE Marketing Director",
      company: "KONE Corporation",
      avatar: "MK",
      rating: 5
    },
    {
      quote: "Our email engagement went from 2% to 7% because we finally knew who we were talking to. The persona insights were game-changing.",
      author: "Zipli CEO",
      company: "Zipli",
      avatar: "ZC",
      rating: 5
    },
    {
      quote: "We stopped arguing about positioning and started launching campaigns. Flowtusk gave us the clarity we needed to move fast.",
      author: "Arkken Founder",
      company: "Arkken",
      avatar: "AF",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Trusted by B2B Leaders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See what our customers say about their experience with Flowtusk
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom Stats */}
          <div className="text-center mt-16">
            <Card className="inline-block p-8 bg-white shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">3x</div>
                  <div className="text-sm text-gray-600">Average Improvement</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
