"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ValuePropTable } from "./ValuePropTable";
import { CompetitivePositioning } from "./sections/CompetitivePositioning";
import { MessagingVariations } from "./sections/MessagingVariations";
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
import type { BrandManifest } from "@/lib/types/brand-manifest";
import { getPrimaryColor, getSecondaryColor, getTextGradientStyle, getLightShade } from "@/lib/utils/color-utils";
import { useState } from "react";

type ValuePropCanvasProps = {
  project: DesignProject;
  persona: ICP;
  manifest?: BrandManifest | null;
};

export function ValuePropCanvas({ project, persona, manifest }: ValuePropCanvasProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Prioritize manifest over project/props for single source of truth
  const valueProp = manifest?.strategy?.valueProp || project.valueProp;
  const manifestPersona = manifest?.strategy?.persona;

  // Get dynamic colors from manifest
  const primaryColor = getPrimaryColor(manifest);
  const secondaryColor = getSecondaryColor(manifest);
  const textGradientStyle = getTextGradientStyle(manifest);
  const lightPrimaryBg = getLightShade(primaryColor, 0.1);
  const lightPrimaryRing = getLightShade(primaryColor, 0.2);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Use manifest persona data with fallback to props
  const personaName = manifestPersona?.name || persona?.persona_name || "Your Customer";
  const personaRole = manifestPersona?.role || persona?.persona_role || "Decision Maker";
  const personaCompany = manifestPersona?.company || persona?.persona_company || "Target Company";
  const personaLocation = manifestPersona?.location 
    ? `${manifestPersona.location}, ${manifestPersona.country || ''}` 
    : persona ? `${persona.location}, ${persona.country}` : "Your Market";

  // Get brand name
  const brandName = manifest?.brandName || personaCompany || "Your Company";

  // Use value prop headline (set from variations), with fallbacks
  const personaValueProp = valueProp?.headline ||
    valueProp?.benefits?.[0] ||
    "Value proposition";

  // Generate avatar using professional style with persona name as seed
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(personaName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Use fit_score from persona data, with fallback
  const fitScore = persona.fit_score || 92;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Strategic Foundation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is your brand's source of truth. Changes here will affect your <strong>Identity</strong>, <strong>Components</strong>, and <strong>Previews</strong>.
              Ask the AI to refine your messaging for different audiences.
            </p>
          </div>
        </div>
      </div>

      {/* Persona Card with Avatar */}
      <Card className="p-6 bg-background border relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${lightPrimaryBg} 0%, ${getLightShade(secondaryColor, 0.05)} 100%)`
          }}
        />

        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Persona Avatar"
                className="w-20 h-20 rounded-full ring-2 ring-offset-2 ring-offset-background bg-white"
                style={{
                  filter: 'contrast(1.2)',
                  borderColor: lightPrimaryRing,
                  boxShadow: `0 0 0 2px ${lightPrimaryRing}`
                }}
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
                <Badge
                  className="shrink-0"
                  style={{
                    backgroundColor: lightPrimaryBg,
                    color: primaryColor,
                  }}
                >
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
              <h1
                className="text-3xl sm:text-4xl font-bold select-none"
                style={textGradientStyle}
              >
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
              icon: <Target className="w-5 h-5" style={{ color: primaryColor }} />,
              label: "Who",
              content: valueProp.targetAudience,
            },
            {
              icon: <Zap className="w-5 h-5" style={{ color: primaryColor }} />,
              label: "Pain",
              content: valueProp.problem,
            },
            {
              icon: <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />,
              label: "Solution",
              content: valueProp.solution,
            },
            {
              icon: <Rocket className="w-5 h-5" style={{ color: primaryColor }} />,
              label: "Why Us",
              content: valueProp.outcome,
            },
          ]}
        />
      </Card>

      {/* Messaging Variations */}
      <MessagingVariations manifest={manifest} valueProp={valueProp} />

      {/* Key Benefits */}
      <Card className="p-6 bg-background border">
        <h3 className="font-bold text-lg mb-4">Key Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {valueProp.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border group relative hover:bg-muted transition-colors"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: lightPrimaryBg }}
              >
                <Check className="w-3 h-3" style={{ color: primaryColor }} />
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

      {/* Competitive Positioning */}
      <CompetitivePositioning manifest={manifest} brandName={brandName} />
    </div>
  );
}

