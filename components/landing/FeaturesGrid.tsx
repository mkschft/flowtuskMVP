"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, Users, MessageSquare, Mail, Linkedin, FileText, Presentation, Twitter, User, Download, Unlock } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: Users,
      title: "3 ICP Cards",
      description: "Detailed customer personas with demographics, pain points, and goals"
    },
    {
      icon: MessageSquare,
      title: "Value Props per Persona",
      description: "Personalized messaging variations for each customer segment"
    },
    {
      icon: Mail,
      title: "Email Sequences",
      description: "Ready-to-send email campaigns tailored to each persona"
    },
    {
      icon: Linkedin,
      title: "LinkedIn Copy",
      description: "Engaging posts and outreach messages for social selling"
    },
    {
      icon: FileText,
      title: "Landing Page Templates",
      description: "High-converting landing pages with persona-specific messaging"
    },
    {
      icon: Presentation,
      title: "Google Slides Decks",
      description: "Professional pitch decks ready for client presentations"
    },
    {
      icon: Twitter,
      title: "Twitter/X Post Ideas",
      description: "Social media content that resonates with your target audience"
    },
    {
      icon: User,
      title: "Bio & Positioning Text",
      description: "Personal and company positioning statements for all channels"
    },
    {
      icon: Download,
      title: "Export Everything",
      description: "Download all content in multiple formats (PDF, DOCX, TXT)"
    },
    {
      icon: Unlock,
      title: "No Vendor Lock-in",
      description: "Own your content and data - export anytime, anywhere"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Everything You Need to Launch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From customer insights to ready-to-use marketing materials. 
              All the tools you need to launch targeted campaigns that convert.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <h3 className="font-medium text-gray-900 text-lg">
                          {feature.title}
                        </h3>
                        <CheckCircle2 className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Summary */}
          <div className="text-center mt-12">
            <Card className="inline-block p-6 bg-white shadow-lg">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10+</div>
                  <div className="text-sm text-gray-600">Content Types</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-gray-600">Export Formats</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">15 min</div>
                  <div className="text-sm text-gray-600">Setup Time</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
