"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type GenerationStep = {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'loading' | 'complete';
};

type GenerationProgressProps = {
  steps: GenerationStep[];
  allComplete?: boolean;
};

export function GenerationProgress({ steps, allComplete }: GenerationProgressProps) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const totalCount = steps.length;
  const progress = (completedCount / totalCount) * 100;
  
  return (
    <Card className="p-4 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            {allComplete ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {allComplete ? 'All assets ready' : 'Generating your design assets'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allComplete 
                ? 'Your complete design system is ready to customize.'
                : `${completedCount} of ${totalCount} completed`
              }
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {!allComplete && (
          <div className="w-full h-1.5 bg-muted/70 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400/80 to-purple-500/80 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="flex items-center gap-3 group"
            >
              {/* Status Icon */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                step.status === 'complete' 
                  ? 'bg-green-100 dark:bg-green-950' 
                  : step.status === 'loading'
                  ? 'bg-purple-100 dark:bg-purple-950'
                  : 'bg-muted'
              }`}>
                {step.status === 'complete' && (
                  <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                )}
                {step.status === 'loading' && (
                  <Loader2 className="w-3 h-3 text-purple-600 dark:text-purple-400 animate-spin" />
                )}
                {step.status === 'pending' && (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                )}
              </div>

              {/* Label */}
              <div className="flex items-center gap-2 flex-1">
                <span className={`text-sm font-medium transition-colors ${
                  step.status === 'complete' 
                    ? 'text-foreground' 
                    : step.status === 'loading'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Status Text */}
              <span className="text-xs text-muted-foreground">
                {step.status === 'complete' && 'Ready'}
                {step.status === 'loading' && 'Generating...'}
                {step.status === 'pending' && 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {allComplete && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Try: <span className="font-medium text-foreground">"Change the primary color"</span> or{' '}
              <span className="font-medium text-foreground">"Update the headline"</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
