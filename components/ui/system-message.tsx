"use client"

import { cn } from "@/lib/utils"
import { Info, Loader2 } from "lucide-react"
import React from "react"

export type SystemMessageProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  variant?: "action" | "loading" | "success"
}

export function SystemMessage({
  children,
  variant = "action",
  icon,
  className,
  ...props
}: SystemMessageProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <span className="text-lg">✅</span>
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm",
        className
      )}
      {...props}
    >
      <div className="shrink-0 mt-0.5">
        {icon || getDefaultIcon()}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
