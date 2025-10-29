"use client";

import React, { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CoachMark - Inline onboarding tooltip
 *
 * Displays contextual help for first-time users
 * Dismissible and stores state in localStorage
 */

interface CoachMarkProps {
  id: string; // Unique ID for localStorage persistence
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  autoShow?: boolean; // Show automatically on first render
  onDismiss?: () => void;
}

export function CoachMark({
  id,
  title,
  description,
  placement = "bottom",
  className,
  autoShow = true,
  onDismiss,
}: CoachMarkProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this coach mark
    const dismissed = localStorage.getItem(`coach-mark-${id}-dismissed`);

    if (!dismissed && autoShow) {
      // Show after a slight delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [id, autoShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`coach-mark-${id}-dismissed`, "true");
    onDismiss?.();
  };

  if (!isVisible) return null;

  const placementClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div
      className={cn(
        "absolute z-50 max-w-xs animate-in fade-in slide-in-from-top-2",
        placementClasses[placement],
        className
      )}
    >
      <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg p-4">
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-3 h-3 bg-gradient-to-br from-purple-500 to-indigo-600 rotate-45",
            placement === "bottom" && "top-0 left-6 -translate-y-1/2",
            placement === "top" && "bottom-0 left-6 translate-y-1/2",
            placement === "right" && "left-0 top-6 -translate-x-1/2",
            placement === "left" && "right-0 top-6 translate-x-1/2"
          )}
        />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="pr-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5" />
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">{description}</p>
          <button
            onClick={handleDismiss}
            className="mt-3 text-sm font-medium underline hover:no-underline"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline variant that appears as a small banner
 */
export function InlineCoachMark({
  id,
  title,
  description,
  className,
  onDismiss,
}: Omit<CoachMarkProps, "placement" | "autoShow">) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(`coach-mark-${id}-dismissed`);
    if (dismissed) {
      setIsVisible(false);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`coach-mark-${id}-dismissed`, "true");
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30",
        "border border-purple-200 dark:border-purple-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-1">
            {title}
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">{description}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </button>
      </div>
    </div>
  );
}
