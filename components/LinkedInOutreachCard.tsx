"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Check, 
  Download,
  MessageSquare,
  Clock,
  TrendingUp,
  User,
  Sparkles
} from "lucide-react";

type LinkedInMessage = {
  id: string;
  step: number;
  type: 'connection' | 'follow-up-1' | 'follow-up-2';
  title: string;
  timing: string;
  characterCount: number;
  message: string;
  personalizationTips: string[];
  expectedResponse: string;
};

type LinkedInOutreachData = {
  messages: LinkedInMessage[];
  overallStrategy: string;
  keyTakeaways: string[];
};

type LinkedInOutreachCardProps = {
  data: LinkedInOutreachData;
  personaTitle: string;
};

export function LinkedInOutreachCard({ data, personaTitle }: LinkedInOutreachCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(data.messages[0]?.id || null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const messageIcons = {
    connection: <User className="h-4 w-4" />,
    'follow-up-1': <MessageSquare className="h-4 w-4" />,
    'follow-up-2': <TrendingUp className="h-4 w-4" />
  };

  const messageColors = {
    connection: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-100 dark:bg-blue-950',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700'
    },
    'follow-up-1': {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-100 dark:bg-purple-950',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700'
    },
    'follow-up-2': {
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-100 dark:bg-pink-950',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-300 dark:border-pink-700'
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-lg">LinkedIn Outreach Sequence</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            For: <span className="font-semibold text-foreground">{personaTitle}</span>
          </p>
        </div>

        {/* Strategy Overview */}
        <div className="p-4 bg-muted/30 border-b">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Outreach Strategy
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.overallStrategy}
          </p>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3">
          {data.messages.map((message, idx) => {
            const colors = messageColors[message.type];
            const isExpanded = expandedId === message.id;

            return (
              <Card
                key={message.id}
                className={`border-2 ${colors.border} overflow-hidden transition-all`}
              >
                {/* Message Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : message.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <div className={colors.text}>
                        {messageIcons[message.type]}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Step {message.step}
                        </Badge>
                        <h4 className="font-semibold text-sm">{message.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {message.timing}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.characterCount} characters
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(message.message, message.id);
                    }}
                  >
                    {copiedId === message.id ? (
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
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-4 bg-muted/20">
                    {/* Message Text */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Message:
                      </p>
                      <div className="p-3 rounded-lg border bg-background">
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {message.message}
                        </p>
                      </div>
                    </div>

                    {/* Personalization Tips */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        💡 Personalization Tips:
                      </p>
                      <div className="space-y-1">
                        {message.personalizationTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <span className="mt-0.5">→</span>
                            <span className="text-muted-foreground">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expected Response */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Expected Response Rate:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.expectedResponse}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Key Takeaways */}
        <div className="p-4 border-t bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
          <h4 className="text-sm font-semibold mb-2">🎯 Key Takeaways</h4>
          <div className="space-y-1">
            {data.keyTakeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                <span className="text-muted-foreground">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const allMessages = data.messages
                .map(m => `=== ${m.title} (${m.timing}) ===\n\n${m.message}`)
                .join('\n\n---\n\n');
              handleCopy(allMessages, 'all');
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
                Copy All Messages
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const csv = [
                'Step,Type,Timing,Message,Tips',
                ...data.messages.map(m => 
                  `${m.step},"${m.title}","${m.timing}","${m.message.replace(/"/g, '""')}","${m.personalizationTips.join('; ')}"`
                )
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'linkedin-outreach-sequence.csv';
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

