"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingFlowsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function LoadingFlowDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function LoadingChatSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <Card className={`p-4 max-w-[70%] ${i % 2 === 0 ? "bg-primary/10" : ""}`}>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[80%]" />
          </Card>
        </div>
      ))}
    </div>
  );
}

export default LoadingFlowsSkeleton;

