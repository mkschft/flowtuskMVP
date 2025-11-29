"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Globe, FileSearch, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisProgressProps {
  currentStep: 'fetching' | 'extracting' | 'generating' | 'finalizing';
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
}

const STEP_CONFIG = {
  fetching: {
    label: 'Reading your website...',
    description: 'Understanding your product',
    icon: Globe,
    progressRange: [0, 20],
    color: 'text-blue-500',
  },
  extracting: {
    label: 'Gathering key details...',
    description: 'Finding what makes you unique',
    icon: FileSearch,
    progressRange: [20, 60],
    color: 'text-purple-500',
  },
  generating: {
    label: 'Finding your ideal customers...',
    description: 'Identifying people who'll love your product',
    icon: Brain,
    progressRange: [60, 95],
    color: 'text-pink-500',
  },
  finalizing: {
    label: 'Here's what we found!',
    description: 'Preparing your results',
    icon: Sparkles,
    progressRange: [95, 100],
    color: 'text-green-500',
  },
};

export function AnalysisProgress({ 
  currentStep, 
  progress, 
  estimatedTimeRemaining 
}: AnalysisProgressProps) {
  const stepConfig = STEP_CONFIG[currentStep];
  const Icon = stepConfig.icon;

  // Calculate which steps are complete, current, and pending
  const steps: Array<keyof typeof STEP_CONFIG> = ['fetching', 'extracting', 'generating', 'finalizing'];
  const currentStepIndex = steps.indexOf(currentStep);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
      {/* Main Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={cn("relative", stepConfig.color)}>
            <Icon className="w-8 h-8" />
            <Loader2 className="w-8 h-8 animate-spin absolute inset-0" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {stepConfig.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {stepConfig.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress}% complete
            </span>
            {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
              <span className="text-muted-foreground">
                ~{formatTime(estimatedTimeRemaining)} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const config = STEP_CONFIG[step];
          const StepIcon = config.icon;
          const isComplete = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
                isCurrent && "bg-muted/50",
                isComplete && "opacity-60"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                isComplete && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/20",
                isPending && "bg-muted"
              )}>
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <StepIcon className={cn(
                    "w-4 h-4",
                    isCurrent ? config.color : "text-muted-foreground"
                  )} />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  isComplete && "line-through text-muted-foreground",
                  isCurrent && "text-foreground",
                  isPending && "text-muted-foreground"
                )}>
                  {config.label}
                </p>
              </div>
              {isCurrent && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Reassuring Message */}
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <span className="text-primary font-medium">AI is analyzing your market...</span>
          <br />
          This usually takes 45-60 seconds. Hang tight!
        </p>
      </div>
    </Card>
  );
}

