"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  Check, 
  Copy,
  ArrowRight,
  MapPin,
  Sparkles
} from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import { useState } from "react";

type ValuePropCanvasProps = {
  project: DesignProject;
};

export function ValuePropCanvas({ project }: ValuePropCanvasProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { valueProp } = project;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Mock persona data
  const personaName = "Sarah Chen";
  const personaRole = "Managing Partner";
  const personaCompany = "Chen & Associates CPAs (12 employees)";
  const personaLocation = "Austin, Texas, United States";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Persona Card with Avatar */}
      <Card className="p-6 bg-background border-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${project.name}Profile&backgroundColor=transparent&strokeColor=000000`}
                alt="Persona Avatar"
                className="w-20 h-20 rounded-full ring-2 ring-purple-200 dark:ring-purple-800 ring-offset-2 ring-offset-background bg-white"
                style={{ filter: 'contrast(1.2)' }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
            </div>

            {/* Persona Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {personaName}
                  </h2>
                  <p className="text-base text-muted-foreground">
                    {personaRole}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {personaCompany}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ICP Match: 92%
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {personaLocation}
              </div>
            </div>
          </div>

          {/* Value Prop Messaging */}
          <div className="space-y-4 pt-4 border-t">
            <Badge className="mb-2">Hero Messaging</Badge>
            <div className="group relative">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {valueProp.headline}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(valueProp.headline, "headline")}
              >
                {copiedId === "headline" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="group relative">
              <p className="text-base text-muted-foreground">
                {valueProp.subheadline}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(valueProp.subheadline, "subheadline")}
              >
                {copiedId === "subheadline" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Pains & Gains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pains */}
        <Card className="p-6 border-2 border-red-200 dark:border-red-800 bg-background">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-xl">Pains</h3>
          </div>
          
          <div className="space-y-4">
            {/* Problem Statement */}
            <div className="group relative p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-foreground leading-relaxed font-medium mb-2">
                Current State
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {valueProp.problem}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(valueProp.problem, "problem")}
              >
                {copiedId === "problem" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Pain Points List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Specific Pain Points
              </p>
              {[
                "15+ hours weekly on manual tasks",
                "Difficulty hiring qualified staff",
                "Manual data entry leading to errors",
                "Scattered client communication"
              ].map((pain, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm flex-1">{pain}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => handleCopy(pain, `pain-${idx}`)}
                  >
                    {copiedId === `pain-${idx}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Gains */}
        <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-background">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-xl">Gains</h3>
          </div>
          
          <div className="space-y-4">
            {/* Outcome Statement */}
            <div className="group relative p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <p className="text-sm text-foreground leading-relaxed font-medium mb-2">
                Desired Outcome
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {valueProp.outcome}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(valueProp.outcome, "outcome")}
              >
                {copiedId === "outcome" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Benefits List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Key Benefits
              </p>
              {valueProp.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm flex-1">{benefit}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => handleCopy(benefit, `benefit-${idx}`)}
                  >
                    {copiedId === `benefit-${idx}` ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Solution How */}
      <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-background group relative">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg">How It Works</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {valueProp.solution}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleCopy(valueProp.solution, "solution")}
        >
          {copiedId === "solution" ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </Card>

      {/* Target Audience */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-pink-600" />
          <h3 className="font-bold text-lg">Target Audience</h3>
        </div>
        <div className="group relative">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {valueProp.targetAudience}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleCopy(valueProp.targetAudience, "audience")}
          >
            {copiedId === "audience" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* CTA Suggestions */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Suggested CTAs</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {valueProp.ctaSuggestions.map((cta, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="gap-2"
              onClick={() => handleCopy(cta, `cta-${idx}`)}
            >
              {cta}
              {copiedId === `cta-${idx}` ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

