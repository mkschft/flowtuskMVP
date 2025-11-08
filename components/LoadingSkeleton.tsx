"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FlowListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function FlowContentSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ICPCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>

        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

export function ValuePropSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

