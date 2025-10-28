"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Check, 
  Download,
  Mail,
  Clock,
  Target,
  Sparkles,
  ChevronDown,
  TrendingUp
} from "lucide-react";

type EmailMessage = {
  id: string;
  step: number;
  type: 'intro' | 'value' | 'social-proof' | 'urgency' | 'breakup';
  dayNumber: number;
  subjectLines: string[];
  body: string;
  cta: string;
  openRateBenchmark: string;
  replyRateBenchmark: string;
  tips: string[];
};

type EmailSequenceData = {
  emails: EmailMessage[];
  sequenceGoal: string;
  bestPractices: string[];
  expectedOutcome: string;
};

type EmailSequenceCardProps = {
  data: EmailSequenceData;
  personaTitle: string;
};

export function EmailSequenceCard({ data, personaTitle }: EmailSequenceCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(data.emails[0]?.id || null);
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, number>>({});

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const emailTypeColors = {
    intro: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
    value: { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
    'social-proof': { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-100 dark:bg-pink-950', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700' },
    urgency: { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
    breakup: { gradient: 'from-gray-500 to-slate-500', bg: 'bg-gray-100 dark:bg-gray-950', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-700' }
  };

  const emailTypeLabels = {
    intro: 'Cold Intro',
    value: 'Value Prop',
    'social-proof': 'Social Proof',
    urgency: 'Urgency',
    breakup: 'Break-up Email'
  };

  const getFullEmail = (email: EmailMessage, subjectIdx: number = 0) => {
    return `Subject: ${email.subjectLines[subjectIdx]}\n\n${email.body}\n\n${email.cta}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="border-2 border-pink-200 dark:border-pink-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <h3 className="font-bold text-lg">Email Nurture Sequence</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            For: <span className="font-semibold text-foreground">{personaTitle}</span>
          </p>
        </div>

        {/* Sequence Goal */}
        <div className="p-4 bg-muted/30 border-b">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sequence Goal
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.sequenceGoal}
          </p>
        </div>

        {/* Email Timeline */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Timeline</span>
            <Badge variant="outline" className="text-xs">{data.emails.length} emails over {data.emails[data.emails.length - 1]?.dayNumber} days</Badge>
          </div>

          {/* Visual Timeline */}
          <div className="relative pl-4 pb-4">
            <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
            
            {data.emails.map((email, idx) => {
              const colors = emailTypeColors[email.type];
              const isExpanded = expandedId === email.id;
              const selectedSubject = selectedSubjects[email.id] || 0;

              return (
                <div key={email.id} className="relative mb-4 last:mb-0">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[18px] top-3 w-3 h-3 rounded-full border-2 border-background bg-gradient-to-r ${colors.gradient}`} />
                  
                  <Card className={`border-2 ${colors.border} ml-4`}>
                    {/* Email Header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}>
                          <Mail className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              Day {email.dayNumber}
                            </Badge>
                            <span className="font-semibold text-sm">
                              {emailTypeLabels[email.type]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {email.subjectLines[selectedSubject]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(getFullEmail(email, selectedSubject), email.id);
                          }}
                        >
                          {copiedId === email.id ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t p-4 space-y-4 bg-muted/20">
                        {/* Subject Line Variations */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Subject Line Options (A/B/C):
                          </p>
                          <div className="space-y-2">
                            {email.subjectLines.map((subject, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedSubjects(prev => ({ ...prev, [email.id]: idx }))}
                                className={`w-full p-2 rounded-lg border text-left text-sm transition-all ${
                                  selectedSubject === idx 
                                    ? `${colors.border} bg-muted` 
                                    : 'border-border hover:border-muted-foreground/50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant={selectedSubject === idx ? "default" : "outline"} className="text-xs">
                                    {String.fromCharCode(65 + idx)}
                                  </Badge>
                                  <span>{subject}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Email Body */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Email Body:
                          </p>
                          <div className="p-3 rounded-lg border bg-background">
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {email.body}
                            </p>
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-semibold">{email.cta}</p>
                            </div>
                          </div>
                        </div>

                        {/* Benchmarks */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 rounded-lg border bg-background">
                            <p className="text-xs text-muted-foreground mb-1">Open Rate Target</p>
                            <p className="text-sm font-semibold">{email.openRateBenchmark}</p>
                          </div>
                          <div className="p-2 rounded-lg border bg-background">
                            <p className="text-xs text-muted-foreground mb-1">Reply Rate Target</p>
                            <p className="text-sm font-semibold">{email.replyRateBenchmark}</p>
                          </div>
                        </div>

                        {/* Tips */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            💡 Optimization Tips:
                          </p>
                          <div className="space-y-1">
                            {email.tips.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="mt-0.5">→</span>
                                <span className="text-muted-foreground">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Practices */}
        <div className="p-4 border-t bg-gradient-to-r from-pink-500/5 to-rose-500/5">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Best Practices
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {data.bestPractices.map((practice, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="text-pink-600 dark:text-pink-400 mt-0.5">✓</span>
                <span className="text-muted-foreground">{practice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-1">Expected Outcome</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.expectedOutcome}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const allEmails = data.emails
                .map((email, idx) => {
                  const subjectIdx = selectedSubjects[email.id] || 0;
                  return `=== Day ${email.dayNumber}: ${emailTypeLabels[email.type]} ===\n\n${getFullEmail(email, subjectIdx)}`;
                })
                .join('\n\n---\n\n');
              handleCopy(allEmails, 'all');
            }}
          >
            {copiedId === 'all' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied All
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy All Emails
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const csv = [
                'Day,Type,Subject Line,Body,CTA,Open Rate Target,Reply Rate Target',
                ...data.emails.map(email => {
                  const subjectIdx = selectedSubjects[email.id] || 0;
                  return `${email.dayNumber},"${emailTypeLabels[email.type]}","${email.subjectLines[subjectIdx]}","${email.body.replace(/"/g, '""')}","${email.cta}","${email.openRateBenchmark}","${email.replyRateBenchmark}"`;
                })
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'email-nurture-sequence.csv';
              a.click();
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}

