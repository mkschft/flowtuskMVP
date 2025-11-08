"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface PromptIteratorProps {
  flowId: string;
  currentICP: ICP;
  onRegenerate: (prompt: string, newICP: ICP) => void;
  isLoading?: boolean;
}

const QUICK_SUGGESTIONS = [
  { label: "More technical", emoji: "⚙️" },
  { label: "Enterprise-focused", emoji: "🏢" },
  { label: "Cost-conscious", emoji: "💰" },
  { label: "Startup-friendly", emoji: "🚀" },
];

interface ValidationResult {
  ok: boolean;
  error?: string;
}

function validatePrompt(prompt: string): ValidationResult {
  const trimmed = prompt.trim();
  
  if (!trimmed) {
    return { ok: false, error: "Prompt cannot be empty" };
  }
  
  if (trimmed.length < 5) {
    return { ok: false, error: "Prompt too short (minimum 5 characters)" };
  }
  
  if (trimmed.length > 500) {
    return { ok: false, error: "Prompt too long (maximum 500 characters)" };
  }
  
  return { ok: true };
}

export function PromptIterator({
  flowId,
  currentICP,
  onRegenerate,
  isLoading = false,
}: PromptIteratorProps) {
  const [prompt, setPrompt] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setValidationError(null);
  };

  const handleRegenerate = () => {
    const validation = validatePrompt(prompt);
    
    if (!validation.ok) {
      setValidationError(validation.error || "Invalid prompt");
      return;
    }
    
    // Call parent handler - in actual implementation, this would make API call
    // For now, we're just passing the prompt up
    onRegenerate(prompt, currentICP);
    
    // Clear prompt after successful submission
    setPrompt("");
    setValidationError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRegenerate();
    }
  };

  const charCount = prompt.length;
  const maxChars = 500;
  const isNearLimit = charCount > maxChars * 0.8;
  const isOverLimit = charCount > maxChars;

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Refine this profile</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {currentICP.title}
        </Badge>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion.label}
              onClick={() => handleSuggestionClick(suggestion.label)}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-xs gap-1.5"
            >
              <span>{suggestion.emoji}</span>
              {suggestion.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Textarea
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe how you'd like to refine this profile... e.g., 'Make this more technical' or 'Focus on enterprise customers'"
          disabled={isLoading}
          className={cn(
            "min-h-[100px] resize-none",
            validationError && "border-destructive focus-visible:ring-destructive"
          )}
        />
        
        {/* Character Count & Validation */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {validationError && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationError}
              </span>
            )}
            {!validationError && prompt.length > 0 && prompt.length < 5 && (
              <span className="text-muted-foreground">
                Type at least 5 characters
              </span>
            )}
          </div>
          <span className={cn(
            "text-muted-foreground",
            isNearLimit && "text-amber-600",
            isOverLimit && "text-destructive font-medium"
          )}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">⌘</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Enter</kbd>
          {' '}to submit
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={isLoading || !prompt.trim() || isOverLimit}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      {/* Optional: Iteration History */}
      {showHistory && (
        <div className="pt-4 border-t border-border space-y-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Iteration History
          </button>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="text-xs">Previous iterations will appear here</p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Be specific about what you want to change. Examples: "Target smaller companies", "Focus on different pain points", "More enterprise-level features"
        </p>
      </div>
    </Card>
  );
}

