"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";

export function CompetitiveEdge() {
  const competitors = [
    {
      name: "Consultant",
      description: "Brand consultants",
      features: {
        "Customer Clarity": true,
        "Campaign Templates": false,
        "Speed": false,
        "Export Ready": false
      }
    },
    {
      name: "HubSpot",
      description: "Marketing platform",
      features: {
        "Customer Clarity": false,
        "Campaign Templates": true,
        "Speed": true,
        "Export Ready": true
      }
    },
    {
      name: "Jasper",
      description: "AI content generator",
      features: {
        "Customer Clarity": false,
        "Campaign Templates": true,
        "Speed": true,
        "Export Ready": false
      }
    },
    {
      name: "Unbounce",
      description: "Landing page builder",
      features: {
        "Customer Clarity": false,
        "Campaign Templates": true,
        "Speed": true,
        "Export Ready": true
      }
    },
    {
      name: "Flowtusk",
      description: "Customer clarity + templates",
      features: {
        "Customer Clarity": true,
        "Campaign Templates": true,
        "Speed": true,
        "Export Ready": true
      },
      highlight: true
    }
  ];

  const features = [
    "Customer Clarity",
    "Campaign Templates",
    "Speed",
    "Export Ready"
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              We Own the B2B Funnel + Clarity Intersection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              While others focus on either customer insights OR campaign templates, 
              we&apos;re the only platform that does both.
            </p>
          </div>

          {/* Comparison Table */}
          <Card className="overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-6 font-semibold text-gray-900">Solution</th>
                    {features.map((feature) => (
                      <th key={feature} className="text-center p-6 font-semibold text-gray-900 min-w-[140px]">
                        {feature}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor, index) => (
                    <tr 
                      key={index}
                      className={`border-b hover:bg-gray-50/50 transition-colors ${
                        competitor.highlight ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          {competitor.highlight && (
                            <Star className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <div className={`font-semibold ${
                              competitor.highlight ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {competitor.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {competitor.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      {features.map((feature) => (
                        <td key={feature} className="text-center p-6">
                          {competitor.features[feature as keyof typeof competitor.features] ? (
                            <div className="flex justify-center">
                              <Badge 
                                variant={competitor.highlight ? "default" : "secondary"}
                                className={competitor.highlight 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                                }
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Yes
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                                <X className="h-3 w-3 mr-1" />
                                No
                              </Badge>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom Message */}
          <div className="text-center mt-12">
            <Card className="inline-block p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">The only platform that does both</h4>
                  <p className="text-sm text-gray-600">Customer clarity + campaign templates in one place</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
