"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";

export function LandingCanvasSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <Card className="p-8 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-purple-600 animate-pulse" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5 mx-auto" />
          <div className="flex gap-3 justify-center mt-6">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <Card className="p-6 bg-background border-2">
        <Skeleton className="h-6 w-32 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </Card>

      {/* Social Proof */}
      <Card className="p-6 bg-background border-2">
        <Skeleton className="h-6 w-32 mb-6" />

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 border">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </Card>

      {/* Pricing (Optional) */}
      <Card className="p-6 bg-background border-2">
        <Skeleton className="h-6 w-24 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-lg bg-muted/30 border space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-32" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <Card className="p-6 bg-background border-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-4 w-32" />
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Generating Message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Generating your landing page with AI...</span>
        </div>
      </div>
    </div>
  );
}
