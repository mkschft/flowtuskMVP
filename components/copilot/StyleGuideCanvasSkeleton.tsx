"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Square, FormInput, Ruler, Circle, Layers } from "lucide-react";

export function StyleGuideCanvasSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Buttons */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Square className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Buttons</h3>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      </Card>

      {/* Cards */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Cards</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>

      {/* Form Elements */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <FormInput className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Form Elements</h3>
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>

      {/* Spacing System */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Ruler className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Spacing System</h3>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* Border Radius */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Circle className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Border Radius</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <Skeleton className="h-3 w-16 mx-auto" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </Card>

      {/* Shadows */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Shadows</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </Card>

      {/* Generating Message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Generating your style guide with AI...</span>
        </div>
      </div>
    </div>
  );
}
