"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ICPSkeleton() {
  return (
    <div className="rounded-lg border bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-4 space-y-3">
      {/* First row: Avatar, name, role, company, location */}
      <div className="flex items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback>
            <Skeleton className="size-10 rounded-full" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* Second row: Key Challenges */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>

      {/* Profiles found */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function CompanyDescriptionSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3 mb-4">
      <Skeleton className="h-4 w-40 mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

