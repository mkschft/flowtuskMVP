"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Brain, FileText, Globe, Zap } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const [websiteUrl, setWebsiteUrl] = useState("");

  const handleAnalyze = () => {
    if (websiteUrl.trim()) {
      window.location.href = `/app?url=${encodeURIComponent(websiteUrl)}`;
    }
  };

  const handleExample = (url: string) => {
    setWebsiteUrl(url);
    window.location.href = `/app?url=${encodeURIComponent(url)}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7c3aed]/20 to-[#8b5cf6]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#7c3aed]/20 to-[#8b5cf6]/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            60-Second ICP Analysis
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Any Website Into{" "}
            <span className="gradient-text">
              Customer Insights in 60 Seconds
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered ICP generator that analyzes competitor websites and creates shareable persona cards. <strong>No signup required to try.</strong>
          </p>

          {/* URL Input Section */}
          <Card className="max-w-2xl mx-auto p-2 mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="url"
                  placeholder="Paste any website URL (e.g., stripe.com)"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg border-0 focus-visible:ring-0 bg-transparent"
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={!websiteUrl.trim()}
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:from-[#6d32d1] hover:to-[#7c3aed] text-white font-semibold"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Free
              </Button>
            </div>
          </Card>

          {/* Example buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="text-sm text-gray-500">Try:</span>
            {['stripe.com', 'notion.so', 'linear.app'].map((example) => (
              <button
                key={example}
                onClick={() => handleExample(example)}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span><strong>247</strong> websites analyzed today</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⭐⭐⭐⭐⭐</span>
              <span><strong>4.9/5</strong> from founders</span>
            </div>
          </div>

          {/* 3-Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Globe className="h-7 w-7 gradient-text" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Paste Any Website URL</h3>
              <p className="text-sm text-gray-600">AI analyzes and extracts insights in seconds</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Brain className="h-7 w-7 gradient-text" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. AI Analyzes & Extracts</h3>
              <p className="text-sm text-gray-600">Evidence-based insights, not guesswork</p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-3">
                <FileText className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Get 3 ICP Cards</h3>
              <p className="text-sm text-gray-600">Shareable, downloadable, actionable</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
