"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Users, MapPin, Briefcase, Target, FileText, Mail, Linkedin, Lightbulb } from "lucide-react";
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

interface ValuePropVariation {
  id: string;
  style: string;
  text: string;
  useCase?: string;
  emoji?: string;
  sourceFactIds?: string[];
}

interface ValuePropData {
  variables?: any[];
  variations: ValuePropVariation[];
}

interface EmailData {
  subjectLines?: any;
  emailBody?: string;
  body?: string;
  sourceFactIds?: string[];
}

interface LinkedInData {
  content?: string;
  type?: string;
  sourceFactIds?: string[];
}

interface ExpandedResultsProps {
  icps: ICP[];
  valuePropData?: ValuePropData;
  emailData?: EmailData;
  linkedInData?: LinkedInData;
  factsJson?: FactsJSON;
  onICPSelect: (icp: ICP) => void;
  onExport?: (format: string) => void;
}

export function ExpandedResults({
  icps,
  valuePropData,
  emailData,
  linkedInData,
  factsJson,
  onICPSelect,
  onExport,
}: ExpandedResultsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'icps' | 'assets'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resolveEvidence = (factIds: string[] | undefined): Fact[] => {
    if (!factIds || !factsJson?.facts) return [];
    return factIds
      .map(id => factsJson.facts.find(f => f.id === id))
      .filter(Boolean) as Fact[];
  };

  const hasAssets = valuePropData || emailData || linkedInData;

  return (
    <div className="w-full space-y-6">
      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="icps">ICPs Only</TabsTrigger>
          <TabsTrigger value="assets" disabled={!hasAssets}>Assets Only</TabsTrigger>
        </TabsList>

        {/* All Content */}
        <TabsContent value="all" className="space-y-8 mt-6">
          {/* ICPs Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Customer Profiles ({icps.length})
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {icps.map((icp, idx) => (
                <ICPCard
                  key={icp.id}
                  icp={icp}
                  rank={idx + 1}
                  factsJson={factsJson}
                  onSelect={() => onICPSelect(icp)}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
            </div>
          </div>

          {/* Assets Section */}
          {hasAssets && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Assets
              </h3>
              <AssetsGrid
                valuePropData={valuePropData}
                emailData={emailData}
                linkedInData={linkedInData}
                factsJson={factsJson}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            </div>
          )}
        </TabsContent>

        {/* ICPs Only */}
        <TabsContent value="icps" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {icps.map((icp, idx) => (
              <ICPCard
                key={icp.id}
                icp={icp}
                rank={idx + 1}
                factsJson={factsJson}
                onSelect={() => onICPSelect(icp)}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            ))}
          </div>
        </TabsContent>

        {/* Assets Only */}
        <TabsContent value="assets" className="space-y-4 mt-6">
          <AssetsGrid
            valuePropData={valuePropData}
            emailData={emailData}
            linkedInData={linkedInData}
            factsJson={factsJson}
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ICP Card Component
function ICPCard({ 
  icp, 
  rank, 
  factsJson, 
  onSelect, 
  onCopy, 
  copiedId 
}: { 
  icp: ICP; 
  rank: number; 
  factsJson?: FactsJSON; 
  onSelect: () => void; 
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const evidenceFacts = icp.evidence && factsJson
    ? icp.evidence.map(id => factsJson.facts.find(f => f.id === id)).filter(Boolean) as Fact[]
    : [];

  const icpMarkdown = `# ${icp.title}\n\n${icp.description}\n\n**Persona:** ${icp.personaName}\n**Role:** ${icp.personaRole}\n**Company:** ${icp.personaCompany}`;

  return (
    <Card className="p-4 space-y-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Badge variant={rank === 1 ? 'default' : 'secondary'} className="text-xs">
          #{rank} {rank === 1 && '(Primary)'}
        </Badge>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-1">{icp.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2">{icp.description}</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span className="truncate">{icp.personaName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="w-3.5 h-3.5" />
          <span className="truncate">{icp.personaRole}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{icp.location}, {icp.country}</span>
        </div>
      </div>

      {evidenceFacts.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            {evidenceFacts.length} evidence source{evidenceFacts.length !== 1 && 's'}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => onCopy(icpMarkdown, icp.id)}
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1.5"
        >
          {copiedId === icp.id ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </Button>
        <Button
          onClick={onSelect}
          variant="default"
          size="sm"
          className="flex-1 text-xs"
        >
          Select
        </Button>
      </div>
    </Card>
  );
}

// Assets Grid Component
function AssetsGrid({
  valuePropData,
  emailData,
  linkedInData,
  factsJson,
  onCopy,
  copiedId,
}: {
  valuePropData?: ValuePropData;
  emailData?: EmailData;
  linkedInData?: LinkedInData;
  factsJson?: FactsJSON;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Value Props */}
      {valuePropData?.variations && valuePropData.variations.map((variation) => (
        <AssetCard
          key={variation.id}
          id={variation.id}
          title={`${variation.emoji || '✨'} ${variation.style}`}
          content={variation.text}
          type="Value Prop"
          sourceFactIds={variation.sourceFactIds}
          factsJson={factsJson}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      ))}

      {/* Email */}
      {emailData && (
        <AssetCard
          id="email"
          title="📧 Email Template"
          content={emailData.emailBody || emailData.body || ''}
          type="Email"
          sourceFactIds={emailData.sourceFactIds}
          factsJson={factsJson}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      )}

      {/* LinkedIn */}
      {linkedInData && (
        <AssetCard
          id="linkedin"
          title="💼 LinkedIn Post"
          content={linkedInData.content || ''}
          type="LinkedIn"
          sourceFactIds={linkedInData.sourceFactIds}
          factsJson={factsJson}
          onCopy={onCopy}
          copiedId={copiedId}
        />
      )}
    </div>
  );
}

// Asset Card Component
function AssetCard({
  id,
  title,
  content,
  type,
  sourceFactIds,
  factsJson,
  onCopy,
  copiedId,
}: {
  id: string;
  title: string;
  content: string;
  type: string;
  sourceFactIds?: string[];
  factsJson?: FactsJSON;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const evidenceCount = sourceFactIds?.length || 0;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
        <Badge variant="outline" className="text-xs">{type}</Badge>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-4">
        {content}
      </p>

      {evidenceCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lightbulb className="w-3 h-3" />
          {evidenceCount} evidence source{evidenceCount !== 1 && 's'}
        </div>
      )}

      <Button
        onClick={() => onCopy(content, id)}
        variant="outline"
        size="sm"
        className="w-full text-xs gap-1.5"
      >
        {copiedId === id ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy
          </>
        )}
      </Button>
    </Card>
  );
}

