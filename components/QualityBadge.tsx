'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { QualityScore } from '@/lib/quality-scorer';

interface QualityBadgeProps {
  qualityScore?: QualityScore;
  className?: string;
  showDetails?: boolean;
}

export function QualityBadge({ qualityScore, className, showDetails = true }: QualityBadgeProps) {
  if (!qualityScore) {
    return null;
  }

  const { grade, totalScore, issues, details } = qualityScore;

  const getBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'default'; // Green
      case 'B':
        return 'secondary'; // Blue
      case 'C':
      case 'F':
        return 'outline'; // Yellow/warning
      default:
        return 'secondary';
    }
  };

  const getIcon = (grade: string) => {
    switch (grade) {
      case 'A':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'B':
        return <Info className="h-3 w-3" />;
      case 'C':
      case 'F':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLabel = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'High Quality';
      case 'B':
        return 'Good Quality';
      case 'C':
        return 'Basic Quality';
      case 'F':
        return 'Needs Improvement';
      default:
        return 'Quality Score';
    }
  };

  const scorePercentage = Math.round(totalScore * 100);

  if (!showDetails) {
    return (
      <Badge variant={getBadgeVariant(grade)} className={className}>
        <span className="flex items-center gap-1">
          {getIcon(grade)}
          Grade {grade}
        </span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getBadgeVariant(grade)} className={`cursor-help ${className || ''}`}>
            <span className="flex items-center gap-1">
              {getIcon(grade)}
              {getLabel(grade)} ({scorePercentage}%)
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-2">
            <div className="font-semibold">Quality Breakdown</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Evidence: {Math.round(qualityScore.breakdown.hasEvidence * 100)}%</div>
              <div>Citations: {details.citationCount} facts</div>
              <div>No Generics: {Math.round(qualityScore.breakdown.noGenerics * 100)}%</div>
              <div>Has Metrics: {details.metricsFound ? 'Yes' : 'No'}</div>
            </div>
            {issues.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="font-semibold text-xs mb-1">Issues:</div>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {issues.slice(0, 3).map((issue, i) => (
                    <li key={i} className="text-muted-foreground">{issue}</li>
                  ))}
                  {issues.length > 3 && (
                    <li className="text-muted-foreground">+{issues.length - 3} more...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

