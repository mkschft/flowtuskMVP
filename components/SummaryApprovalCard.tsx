"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, RefreshCw } from "lucide-react";

interface SummaryApprovalCardProps {
  summary: string;
  details?: string;
  onContinue: () => void;
  onRegenerate?: () => void;
  continueButtonText?: string;
  regenerateButtonText?: string;
  isLoading?: boolean;
  showRegenerateButton?: boolean;
}

export function SummaryApprovalCard({
  summary,
  details,
  onContinue,
  onRegenerate,
  continueButtonText = "Continue →",
  regenerateButtonText = "Regenerate",
  isLoading = false,
  showRegenerateButton = true,
}: SummaryApprovalCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="border-l-4 border-l-purple-500 overflow-hidden">
      <div className="relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />

        <div className="relative p-6 space-y-4">
          {/* Icon */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Analysis Complete</h3>
          </div>

          {/* Summary Text with markdown support */}
          <div className="text-sm leading-relaxed whitespace-pre-line space-y-2">
            {summary.split('**').map((part, i) =>
              i % 2 === 0 ? (
                <span key={i}>{part}</span>
              ) : (
                <strong key={i} className="font-semibold text-foreground">{part}</strong>
              )
            )}
          </div>

          {/* Optional expandable details */}
          {details && (
            <div className="border-t pt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                />
                <span>{showDetails ? 'Hide details' : 'Show details'}</span>
              </button>

              {showDetails && (
                <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {details}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={onContinue}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                continueButtonText
              )}
            </Button>

            {showRegenerateButton && onRegenerate && (
              <Button
                onClick={onRegenerate}
                disabled={isLoading}
                variant="outline"
                className="px-6"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {regenerateButtonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
