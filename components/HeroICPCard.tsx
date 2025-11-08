"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, ChevronDown, MapPin, Users, Briefcase, Target, Lightbulb } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Fact {
  id: string;
  text: string;
  evidence: string;
  page?: string;
}

interface FactsJSON {
  facts: Fact[];
  [key: string]: any;
}

interface ICP {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
  goals: string[];
  demographics: string;
  personaName: string;
  personaRole: string;
  personaCompany: string;
  location: string;
  country: string;
  evidence?: string[];
}

interface HeroICPCardProps {
  icp: ICP;
  factsJson?: FactsJSON;
  onCopy: () => void;
  onShare: () => void;
  onViewAll: () => void;
}

export function HeroICPCard({ icp, factsJson, onCopy, onShare, onViewAll }: HeroICPCardProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Resolve evidence fact IDs to actual fact objects
  const resolveEvidence = (factIds: string[] | undefined): Fact[] => {
    if (!factIds || !factsJson?.facts) return [];
    return factIds
      .map(id => factsJson.facts.find(f => f.id === id))
      .filter(Boolean) as Fact[];
  };

  const evidenceFacts = resolveEvidence(icp.evidence);
  const displayedEvidence = evidenceFacts.slice(0, 3); // Show top 3 evidence items

  const handleCopy = () => {
    // Copy full ICP as markdown
    const markdown = `# ${icp.title}

${icp.description}

**Persona:** ${icp.personaName}
**Role:** ${icp.personaRole}
**Company:** ${icp.personaCompany}
**Location:** ${icp.location}, ${icp.country}

## Demographics
${icp.demographics}

## Top Pain Points
${icp.painPoints.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Top Goals
${icp.goals.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join('\n')}

## Evidence
${evidenceFacts.map((f, i) => `${i + 1}. "${f.evidence}" (${f.page || 'homepage'})`).join('\n')}
`;

    navigator.clipboard.writeText(markdown);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    onCopy();
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
      {/* Gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="relative p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                Primary Customer Profile
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {icp.title}
              </h2>
            </div>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg">
            {icp.description}
          </p>
        </div>

        {/* Persona Card */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{icp.personaName}</p>
              <p className="text-sm text-muted-foreground">{icp.personaRole}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{icp.personaCompany}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{icp.location}, {icp.country}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {icp.demographics}
          </p>
        </div>

        {/* Pain Points & Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pain Points */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="w-4 h-4 text-destructive" />
              Top Pain Points
            </div>
            <ul className="space-y-1.5">
              {icp.painPoints.slice(0, 3).map((pain, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="w-4 h-4 text-primary" />
              Top Goals
            </div>
            <ul className="space-y-1.5">
              {icp.goals.slice(0, 3).map((goal, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evidence Section */}
        {displayedEvidence.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Why this profile?
            </div>
            <div className="space-y-2">
              {displayedEvidence.map((fact) => (
                <div 
                  key={fact.id}
                  className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md p-3"
                >
                  <button
                    onClick={() => setExpandedEvidence(expandedEvidence === fact.id ? null : fact.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground/90 italic line-clamp-2">
                        "{fact.evidence}"
                      </p>
                      <ChevronDown 
                        className={cn(
                          "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
                          expandedEvidence === fact.id && "transform rotate-180"
                        )}
                      />
                    </div>
                  </button>
                  {expandedEvidence === fact.id && (
                    <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-900/40">
                      <p className="text-xs text-muted-foreground mb-1">
                        Full context:
                      </p>
                      <p className="text-sm text-foreground/80">
                        {fact.text}
                      </p>
                      {fact.page && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {fact.page}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {evidenceFacts.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{evidenceFacts.length - 3} more evidence sources
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            {copySuccess ? "Copied!" : "Copy"}
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={onViewAll}
            variant="default"
            size="sm"
            className="gap-2 ml-auto"
          >
            View All ICPs
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Copy Success Toast */}
        {copySuccess && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            Copied to clipboard!
          </div>
        )}
      </div>
    </Card>
  );
}

