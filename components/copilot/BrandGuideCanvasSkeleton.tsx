"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Type, Image as ImageIcon, MessageSquare } from "lucide-react";

export function BrandGuideCanvasSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Colors Section */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Color Palette</h3>
        </div>

        <div className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Primary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Secondary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Accent
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Typography</h3>
        </div>

        <div className="space-y-6">
          {['Heading', 'Body'].map((category, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category}
              </h4>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Logo Variations */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Logo Variations</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* Tone of Voice */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Tone of Voice</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </Card>

      {/* Brand Personality */}
      <Card className="p-6 bg-background border">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Brand Personality</h3>
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Generating Message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Generating your brand guide with AI...</span>
        </div>
      </div>
    </div>
  );
}
