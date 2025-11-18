"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, Check, CheckCircle2 } from "lucide-react";
import type { ThinkingStep } from "@/app/app/types";

interface ThinkingBlockProps {
  thinking: ThinkingStep[];
  onCancel?: () => void;
}

export function ThinkingBlock({ thinking, onCancel }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const totalTime = thinking.reduce((sum, s) => sum + (s.duration || 0), 0);
  const allComplete = thinking.every(s => s.status === 'complete');
  const hasError = thinking.some(s => s.status === 'error');
  const isRunning = thinking.some(s => s.status === 'running');
  const runningStep = thinking.find(s => s.status === 'running');
  
  // Update elapsed time every 500ms for running steps
  useEffect(() => {
    if (!isRunning || !runningStep?.startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - runningStep.startTime!;
      setElapsedTime(elapsed);
    }, 500);
    
    return () => clearInterval(interval);
  }, [isRunning, runningStep?.startTime]);
  
  const completedSteps = thinking.filter(s => s.status === 'complete').length;
  const progress = (completedSteps / thinking.length) * 100;
  
  return (
    <Card className="border-l-4 border-l-purple-500">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {hasError ? (
            <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
              <span className="text-red-600 dark:text-red-400">✗</span>
            </div>
          ) : allComplete ? (
            <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
            </div>
          )}
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-medium">
              {hasError ? 'Error occurred' : allComplete ? 'Analysis complete' : 'Thinking...'}
            </div>
            <div className="text-xs text-muted-foreground">
              {completedSteps} / {thinking.length} steps
              {totalTime > 0 && ` • ${(totalTime / 1000).toFixed(1)}s`}
              {isRunning && elapsedTime > 0 && ` • ${(elapsedTime / 1000).toFixed(0)}s elapsed`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onCancel && isRunning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="h-7 px-2 text-xs"
              asChild
            >
              <span role="button" tabIndex={0}>
                Cancel
              </span>
            </Button>
          )}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {/* Progress bar */}
      {isRunning && (
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          {thinking.map(step => (
            <div key={step.id} className="flex items-start gap-2">
              <div className="mt-1 shrink-0">
                {step.status === 'complete' && (
                  <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {step.status === 'running' && (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600 dark:text-purple-400" />
                )}
                {step.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full bg-muted border-2 border-muted-foreground/20" />
                )}
                {step.status === 'error' && (
                  <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                    <span className="text-xs text-red-600 dark:text-red-400">✗</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{step.label}</span>
                  {step.duration && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(step.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                {step.substeps && step.substeps.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {step.substeps.map((substep, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1">→</span>
                        <span>{substep}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
