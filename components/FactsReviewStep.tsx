"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Edit3, Sparkles, AlertCircle } from "lucide-react";
import { type FactsJSON } from "@/lib/prompt-templates";

interface FactsReviewStepProps {
  factsJson: FactsJSON;
  onApprove: (editedFactsJson: FactsJSON) => void;
  onEdit?: () => void;
  isLoading?: boolean;
}

export function FactsReviewStep({ factsJson, onApprove, onEdit, isLoading = false }: FactsReviewStepProps) {
  const [editedFacts, setEditedFacts] = useState(factsJson.facts);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFactEdit = (index: number, newText: string) => {
    const updated = [...editedFacts];
    updated[index] = { ...updated[index], text: newText };
    setEditedFacts(updated);
  };

  const handleApprove = () => {
    const updatedFactsJson = {
      ...factsJson,
      facts: editedFacts,
    };
    onApprove(updatedFactsJson);
  };

  const factsCount = editedFacts.length;
  const hasChanges = JSON.stringify(editedFacts) !== JSON.stringify(factsJson.facts);

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Review Generated Brand Facts
          </h3>
          <Badge variant="secondary">{factsCount} Facts</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          We've generated {factsCount} brand facts from your idea. Review and edit them to ensure accuracy before continuing to ICP generation.
        </p>
      </div>

      {/* Brand Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Brand Name</p>
            <p className="text-sm font-semibold">{factsJson.brand?.name || "Untitled"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Target Region</p>
            <p className="text-sm font-semibold">{factsJson.targetMarket?.primaryRegion || "Global"}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Brand Tones</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {factsJson.brand?.tones.map((tone, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tone}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="font-medium text-yellow-900 dark:text-yellow-200">Generated from your input</p>
          <p className="text-yellow-700 dark:text-yellow-400 mt-1">
            These facts are AI-generated based on your idea description. Review and validate them before launching any campaigns.
          </p>
        </div>
      </div>

      {/* Facts List */}
      <ScrollArea className="h-96 pr-4">
        <div className="space-y-3">
          {editedFacts.map((fact, idx) => (
            <div
              key={fact.id}
              className="p-4 border rounded-lg space-y-2 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Fact {idx + 1}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                  disabled={isLoading}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {editingIndex === idx ? "Done" : "Edit"}
                </Button>
              </div>

              {editingIndex === idx ? (
                <Textarea
                  value={fact.text}
                  onChange={(e) => handleFactEdit(idx, e.target.value)}
                  rows={3}
                  className="text-sm"
                  disabled={isLoading}
                />
              ) : (
                <p className="text-sm">{fact.text}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {(fact as any).source || fact.page}
                </Badge>
                <span className="text-xs">•</span>
                <span className="truncate">{fact.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={handleApprove}
          className="flex-1"
          disabled={isLoading}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {hasChanges ? "Save Changes & Continue" : "Approve & Continue to ICPs"}
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            disabled={isLoading}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Idea
          </Button>
        )}
      </div>

      {/* Helper Text */}
      {hasChanges && (
        <p className="text-xs text-center text-muted-foreground">
          You've made {JSON.stringify(editedFacts) !== JSON.stringify(factsJson.facts) ? 'changes' : 'no changes'} to the generated facts
        </p>
      )}
    </Card>
  );
}
