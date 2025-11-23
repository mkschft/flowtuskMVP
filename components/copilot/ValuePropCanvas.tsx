"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ValuePropTable } from "./ValuePropTable";
import {
  Check,
  Copy,
  MapPin,
  Sparkles,
  Target,
  Zap,
  CheckCircle,
  Rocket
} from "lucide-react";
import type { DesignProject } from "@/lib/design-studio-mock-data";
import type { ICP } from "@/lib/types/database";
import { useState } from "react";

type ValuePropCanvasProps = {
  project: DesignProject;
  persona: ICP;
};

export function ValuePropCanvas({ project, persona }: ValuePropCanvasProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { valueProp } = project;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Use actual persona data
  const personaName = persona.persona_name;
  const personaRole = persona.persona_role;
  const personaCompany = persona.persona_company;
  const personaLocation = `${persona.location}, ${persona.country}`;

  // Use value prop headline (set from variations), with fallbacks
  const personaValueProp = valueProp.headline ||
    valueProp.benefits?.[0] ||
    "Value proposition";

  // Generate avatar using professional style with persona name as seed
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(personaName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Use fit_score from persona data, with fallback
  const fitScore = persona.fit_score || 92;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Persona Card with Avatar */}
      <Card className="p-6 bg-background border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Persona Avatar"
                className="w-20 h-20 rounded-full ring-2 ring-purple-200 dark:ring-purple-800 ring-offset-2 ring-offset-background bg-white"
                style={{ filter: 'contrast(1.2)' }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border border-background" />
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
                  ICP Match: {fitScore}%
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
            <Badge className="mb-2">Key Pain Point</Badge>
            <div className="group relative">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {personaValueProp}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(personaValueProp, "headline")}
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

      {/* Value Prop Table */}
      <Card className="p-6 bg-background border">
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-1">Value Proposition Framework</h3>
          <p className="text-sm text-muted-foreground">
            Click any row to copy the content
          </p>
        </div>
        <ValuePropTable
          rows={[
            {
              icon: <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
              label: "Who",
              content: valueProp.targetAudience,
            },
            {
              icon: <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
              label: "Pain",
              content: valueProp.problem,
            },
            {
              icon: <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
              label: "Solution",
              content: valueProp.solution,
            },
            {
              icon: <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
              label: "Why Us",
              content: valueProp.outcome,
            },
          ]}
        />
      </Card>

      {/* Key Benefits */}
      <Card className="p-6 bg-background border">
        <h3 className="font-bold text-lg mb-4">Key Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {valueProp.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border group relative hover:bg-muted transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
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
      </Card>
    </div>
  );
}

