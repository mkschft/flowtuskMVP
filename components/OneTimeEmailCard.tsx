"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Copy, 
  Check,
  Download,
  Lightbulb,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";

type OneTimeEmailData = {
  subjectLines: {
    A: string;
    B: string;
    C: string;
  };
  emailBody: string;
  cta: string;
  tips: string[];
  benchmarks: {
    openRate: string;
    replyRate: string;
    conversionRate: string;
  };
};

type OneTimeEmailCardProps = {
  data: OneTimeEmailData;
  personaTitle: string;
};

export function OneTimeEmailCard({ data, personaTitle }: OneTimeEmailCardProps) {
  const [copiedSubject, setCopiedSubject] = useState<string | null>(null);
  const [copiedBody, setCopiedBody] = useState(false);

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(text);
        setTimeout(() => setCopiedSubject(null), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const exportToCSV = () => {
    const csvContent = `Subject Line A,${data.subjectLines.A}
Subject Line B,${data.subjectLines.B}
Subject Line C,${data.subjectLines.C}
Email Body,"${data.emailBody.replace(/"/g, '""')}"
CTA,${data.cta}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-time-email-${personaTitle.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-lg">One-Time Email</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCSV}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Perfect for announcements or quick outreach to your <span className="font-semibold text-foreground">{personaTitle}</span>
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Subject Line Variations */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Subject Line Variations (A/B/C Test)
          </h4>
          <div className="grid gap-3">
            {Object.entries(data.subjectLines).map(([variant, subject]) => (
              <div key={variant} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                  {variant}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject.length} characters
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(subject, 'subject')}
                  className="h-8 w-8 p-0"
                >
                  {copiedSubject === subject ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Email Body */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            Email Body
          </h4>
          <div className="p-4 rounded-lg bg-muted/30 border">
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {data.emailBody}
              </p>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  {data.emailBody.split(' ').length} words
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(data.emailBody, 'body')}
                  className="h-8"
                >
                  {copiedBody ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Body
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Call to Action
          </h4>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {data.cta}
            </p>
          </div>
        </div>

        {/* Benchmarks */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            Expected Performance
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-blue-600">{data.benchmarks.openRate}</div>
              <div className="text-xs text-muted-foreground">Open Rate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-green-600">{data.benchmarks.replyRate}</div>
              <div className="text-xs text-muted-foreground">Reply Rate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-purple-600">{data.benchmarks.conversionRate}</div>
              <div className="text-xs text-muted-foreground">Conversion</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            Optimization Tips
          </h4>
          <div className="space-y-2">
            {data.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
