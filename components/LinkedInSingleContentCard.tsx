"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MessageSquare, FileText, Mail, Sparkles } from "lucide-react";

type LinkedInSingleContentProps = {
  content: string;
  type: 'post' | 'profile_bio' | 'inmail';
  hashtags?: string[];
  callToAction?: string;
  sourceFactIds?: string[];
  personaTitle: string;
};

export function LinkedInSingleContentCard({
  content,
  type,
  hashtags = [],
  callToAction,
  sourceFactIds = [],
  personaTitle,
}: LinkedInSingleContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let fullContent = content;
    if (hashtags.length > 0) {
      fullContent += `\n\n${hashtags.join(' ')}`;
    }
    if (callToAction) {
      fullContent += `\n\n${callToAction}`;
    }
    
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'post':
        return {
          icon: <MessageSquare className="h-5 w-5" />,
          title: 'LinkedIn Post',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          emoji: '📝',
        };
      case 'profile_bio':
        return {
          icon: <FileText className="h-5 w-5" />,
          title: 'Profile Bio',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950/30',
          borderColor: 'border-purple-200 dark:border-purple-800',
          emoji: '👤',
        };
      case 'inmail':
        return {
          icon: <Mail className="h-5 w-5" />,
          title: 'InMail Message',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          emoji: '✉️',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Card className={`border-2 ${config.borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 ${config.bgColor} border-b ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.emoji}</span>
            <div>
              <h3 className="font-bold text-lg">{config.title}</h3>
              <p className="text-xs text-muted-foreground">
                For: <span className="font-semibold text-foreground">{personaTitle}</span>
              </p>
            </div>
          </div>
          {sourceFactIds.length > 0 && (
            <Badge variant="outline" className="font-mono">
              ✓ {sourceFactIds.length} fact{sourceFactIds.length > 1 ? 's' : ''} cited
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Main Content */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {callToAction && (
            <div className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Call to Action:
                  </p>
                  <p className="text-sm">{callToAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="font-semibold">{content.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {type === 'post' ? 'Hashtags' : type === 'profile_bio' ? 'Bio Length' : 'Words'}
              </p>
              <p className="font-semibold">
                {type === 'post' ? hashtags.length : content.split(' ').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Evidence</p>
              <p className="font-semibold">{sourceFactIds.length}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button
            onClick={handleCopy}
            className={`flex-1 bg-gradient-to-r ${config.color} hover:opacity-90`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>

        {/* Usage Tips */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            {type === 'post' && (
              <>
                💡 <strong>Best practices:</strong> Post between 1pm-3pm on Tuesday-Thursday for maximum engagement. 
                Keep it under 1300 characters for optimal visibility.
              </>
            )}
            {type === 'profile_bio' && (
              <>
                💡 <strong>Pro tip:</strong> Update your profile bio regularly to reflect current focus. 
                Use the first 2 sentences wisely—they appear in search results.
              </>
            )}
            {type === 'inmail' && (
              <>
                💡 <strong>InMail tip:</strong> Keep subject under 30 characters. 
                Personalize the opening line with something specific about their profile.
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

