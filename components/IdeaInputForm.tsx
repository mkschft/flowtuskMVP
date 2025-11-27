"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Sparkles, HelpCircle } from "lucide-react";
import { type IdeaInput } from "@/lib/prompt-templates";

interface IdeaInputFormProps {
  onSubmit: (data: IdeaInput) => void;
  onNeedHelp?: () => void;
  isLoading?: boolean;
}

export function IdeaInputForm({ onSubmit, onNeedHelp, isLoading = false }: IdeaInputFormProps) {
  const [idea, setIdea] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [problemStatement, setProblemStatement] = useState("");
  const [solutionHypothesis, setSolutionHypothesis] = useState("");
  const [brandVibe, setBrandVibe] = useState("");

  const ideaLength = idea.trim().length;
  const targetMarketLength = targetMarket.trim().length;

  const canSubmit = ideaLength >= 50 && ideaLength <= 500 && targetMarketLength > 0 && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit({
        idea: idea.trim(),
        targetMarket: targetMarket.trim(),
        problemStatement: problemStatement.trim() || undefined,
        solutionHypothesis: solutionHypothesis.trim() || undefined,
        brandVibe: brandVibe || undefined,
      });
    }
  };

  const getIdeaInputClassName = () => {
    if (ideaLength === 0) return "";
    if (ideaLength < 50) return "border-yellow-500 focus:border-yellow-500";
    if (ideaLength > 500) return "border-red-500 focus:border-red-500";
    return "border-green-500 focus:border-green-500";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Describe Your Startup Idea
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your product or service. Be specific about what you're building and who it's for.
        </p>
      </div>

      {/* Idea Description (Required) */}
      <div className="space-y-2">
        <label htmlFor="idea" className="text-sm font-medium">
          Startup Idea <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Example: 'AI-powered tax software for UK mid-market accounting firms that automates MTD VAT compliance and reduces filing time by 40%'"
          rows={4}
          className={getIdeaInputClassName()}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center text-xs">
          <span className={ideaLength < 50 ? "text-yellow-600" : ideaLength > 500 ? "text-red-600" : "text-green-600"}>
            {ideaLength < 50 && ideaLength > 0 && `${50 - ideaLength} more characters needed`}
            {ideaLength >= 50 && ideaLength <= 500 && "✓ Good length"}
            {ideaLength > 500 && `${ideaLength - 500} characters over limit`}
          </span>
          <span className="text-muted-foreground">{ideaLength}/500</span>
        </div>
      </div>

      {/* Target Market (Required) */}
      <div className="space-y-2">
        <label htmlFor="targetMarket" className="text-sm font-medium">
          Target Market <span className="text-red-500">*</span>
        </label>
        <Input
          id="targetMarket"
          value={targetMarket}
          onChange={(e) => setTargetMarket(e.target.value)}
          placeholder="Example: 'UK accounting firms, 10-50 employees, handling 100+ SMB clients'"
          className={targetMarketLength > 0 ? "border-green-500 focus:border-green-500" : ""}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Be specific: Include location, company size, industry, or other defining characteristics
        </p>
      </div>

      {/* Optional Fields Toggle */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowOptional(!showOptional)}
        className="w-full justify-between"
        disabled={isLoading}
      >
        <span className="text-sm">Optional: Add more details for better results</span>
        {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Optional Fields */}
      {showOptional && (
        <div className="space-y-4 pt-2 border-t">
          <div className="space-y-2">
            <label htmlFor="problemStatement" className="text-sm font-medium text-muted-foreground">
              Problem Statement (Optional)
            </label>
            <Textarea
              id="problemStatement"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Example: 'Manual tax calculations are time-consuming and error-prone, leading to compliance risks'"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="solutionHypothesis" className="text-sm font-medium text-muted-foreground">
              Solution Hypothesis (Optional)
            </label>
            <Textarea
              id="solutionHypothesis"
              value={solutionHypothesis}
              onChange={(e) => setSolutionHypothesis(e.target.value)}
              placeholder="Example: 'AI automation can reduce tax prep time by 40% while ensuring 100% compliance'"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brandVibe" className="text-sm font-medium text-muted-foreground">
              Brand Vibe (Optional)
            </label>
            <Select value={brandVibe} onValueChange={setBrandVibe} disabled={isLoading}>
              <SelectTrigger id="brandVibe">
                <SelectValue placeholder="Select a brand personality..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional & Trustworthy</SelectItem>
                <SelectItem value="playful">Playful & Approachable</SelectItem>
                <SelectItem value="innovative">Innovative & Modern</SelectItem>
                <SelectItem value="minimalist">Minimalist & Clean</SelectItem>
                <SelectItem value="bold">Bold & Energetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Brand System...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Brand System
            </>
          )}
        </Button>

        {onNeedHelp && (
          <Button
            type="button"
            variant="outline"
            onClick={onNeedHelp}
            disabled={isLoading}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Need Help?
          </Button>
        )}
      </div>

      {/* Helpful Tips */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-medium">💡 Tips for Best Results:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Include specific metrics or benefits (e.g., "40% time savings")</li>
          <li>Mention your target market size and location</li>
          <li>Describe what makes your solution unique</li>
          <li>Add context about the problem you're solving</li>
        </ul>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Example:</strong> "AI-powered sprint planning tool for remote FinTech teams (20-50 employees) that auto-generates user stories from Slack conversations, reducing planning meetings by 60%"
          </p>
        </div>
      </div>
    </form>
  );
}
