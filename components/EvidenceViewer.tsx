'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, ExternalLink, FileText } from 'lucide-react';
import type { FactsJSON } from '@/lib/prompt-templates';

interface EvidenceViewerProps {
  sourceFactIds?: string[];
  facts: FactsJSON['facts'];
  className?: string;
}

export function EvidenceViewer({ sourceFactIds, facts, className }: EvidenceViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sourceFactIds || sourceFactIds.length === 0) {
    return null;
  }

  // Find the actual facts referenced
  const referencedFacts = sourceFactIds
    .map(id => facts.find(f => f.id === id))
    .filter((fact): fact is NonNullable<typeof fact> => fact !== undefined);

  if (referencedFacts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 mr-1" />
        ) : (
          <ChevronRight className="h-3 w-3 mr-1" />
        )}
        <FileText className="h-3 w-3 mr-1" />
        View Evidence ({referencedFacts.length} {referencedFacts.length === 1 ? 'fact' : 'facts'})
      </Button>

      {isExpanded && (
        <Card className="mt-2 border-l-4 border-l-primary/20">
          <CardContent className="p-3 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Based on these facts from your website:
            </div>
            {referencedFacts.map((fact, index) => (
              <div
                key={fact.id}
                className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-sm"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed">{fact.text}</p>
                  {fact.page && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span>From: {fact.page}</span>
                    </div>
                  )}
                  {fact.evidence && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Show source quote
                      </summary>
                      <p className="mt-1 pl-3 border-l-2 border-muted italic">
                        "{fact.evidence}"
                      </p>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

