"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CheckCircle2, Clock, Users, Target } from "lucide-react";

export function CaseStudy() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Real Customer Success
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              See how KONE transformed their marketing with customer clarity
            </p>
          </div>

          {/* Case Study Card */}
          <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="p-8 md:p-12">
              {/* Company Header */}
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg mr-6">
                  <div className="text-2xl font-bold text-blue-600">K</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">KONE</h3>
                  <p className="text-gray-600">Elevator & Escalator Solutions</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                    Enterprise Customer
                  </Badge>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-gray-700 italic mb-8 leading-relaxed">
                &ldquo;Flowtusk saved us 3-4 days of discovery work every project. We went from generic messaging 
                to targeted campaigns that actually convert. Our lead quality improved dramatically.&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center mb-8">
                <Avatar className="w-12 h-12 mr-4">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    MK
                  </div>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">Marketing Director</div>
                  <div className="text-gray-600">KONE Corporation</div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">3-4 days</div>
                  <div className="text-sm text-gray-600">Time saved per project</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
                  <div className="text-sm text-gray-600">Leads generated in 2 weeks</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">3x</div>
                  <div className="text-sm text-gray-600">Higher lead quality</div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">What KONE achieved:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Faster campaign development",
                    "More targeted messaging",
                    "Better lead qualification",
                    "Improved conversion rates"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-4">
              Ready to get similar results for your business?
            </p>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-semibold">
              Start your success story today
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
