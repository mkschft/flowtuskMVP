"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, RefreshCw, Database } from "lucide-react";
import { useState } from "react";

interface SiteAlreadyScrapedCardProps {
  url: string;
  siteId: string;
  title: string;
  summary: string;
  createdAt: string;
  flowId?: string;
  onProceed?: (url: string, siteId: string, flowId?: string) => void;
  onUseSaved?: (siteId: string, flowId?: string) => void;
}

export function SiteAlreadyScrapedCard({
  url,
  siteId,
  title,
  summary,
  createdAt,
  flowId,
  onProceed,
  onUseSaved,
}: SiteAlreadyScrapedCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      if (onProceed) {
        onProceed(url, siteId, flowId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSaved = async () => {
    setIsProcessing(true);
    try {
      if (onUseSaved) {
        onUseSaved(siteId, flowId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <Card className="rounded-lg border p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted shrink-0">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">{title}</h3>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Scraped {formatDate(createdAt)}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {summary}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleProceed}
              disabled={isProcessing}
              className="flex-1 rounded-full text-xs h-8"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Proceed with Scraping
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleUseSaved}
              disabled={isProcessing}
              className="flex-1 rounded-full text-xs h-8"
            >
              <Database className="h-3.5 w-3.5 mr-1.5" />
              Use Saved Data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

