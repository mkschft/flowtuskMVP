"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check, Copy, Loader2 } from "lucide-react";

type ValuePropVariation = {
  id: string;
  style: string;
  text: string;
  useCase: string;
  emoji: string;
  sourceFactIds?: string[];
};

type IntegratedValuePropPreviewProps = {
  variations: ValuePropVariation[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  onConfirm: () => void;
  personaTitle: string;
};

export function IntegratedValuePropPreview({
  variations,
  currentIndex,
  onNavigate,
  onConfirm,
  personaTitle,
}: IntegratedValuePropPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentVariation = variations[currentIndex];
  const totalVariations = variations.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentVariation.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalVariations - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const getStyleColor = (style: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      "Pain-First": {
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-200 dark:border-red-800",
      },
      "Benefit-First": {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
      },
      "Social Proof": {
        bg: "bg-green-50 dark:bg-green-950/30",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-200 dark:border-green-800",
      },
      "Question Hook": {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
      },
      "Urgency": {
        bg: "bg-orange-50 dark:bg-orange-950/30",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-200 dark:border-orange-800",
      },
    };
    return colors[style] || colors["Benefit-First"];
  };

  const styleColors = getStyleColor(currentVariation.style);

  return (
    <Card className={`border-2 ${styleColors.border} overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 ${styleColors.bg} border-b ${styleColors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentVariation.emoji}</span>
            <div>
              <h3 className={`font-bold text-lg ${styleColors.text}`}>
                {currentVariation.style}
              </h3>
              <p className="text-xs text-muted-foreground">
                Use for: {currentVariation.useCase}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono">
            {currentIndex + 1} of {totalVariations}
          </Badge>
        </div>
      </div>

      {/* Value Prop Content */}
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Preview for: <span className="font-semibold text-foreground">{personaTitle}</span>
          </p>
          <blockquote className="border-l-4 pl-4 py-2 text-lg leading-relaxed" style={{ borderLeftColor: styleColors.text.includes('red') ? '#ef4444' : styleColors.text.includes('blue') ? '#3b82f6' : styleColors.text.includes('green') ? '#22c55e' : styleColors.text.includes('purple') ? '#a855f7' : '#f97316' }}>
            {currentVariation.text}
          </blockquote>
        </div>

        {/* Evidence Badge */}
        {currentVariation.sourceFactIds && currentVariation.sourceFactIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Badge variant="outline" className="font-mono">
              ✓ {currentVariation.sourceFactIds.length} fact{currentVariation.sourceFactIds.length > 1 ? 's' : ''} cited
            </Badge>
          </div>
        )}

        {/* Navigation & Actions */}
        <div className="flex flex-col gap-3">
          {/* Navigation Row */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === totalVariations - 1}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Action Row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setIsLoading(true);
                onConfirm();
              }}
              disabled={isLoading}
              className="flex-[2] bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating positioning package...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Value Proposition
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

