import { Sparkles } from "lucide-react";

interface ThinkingIndicatorProps {
  text?: string;
}

export function ThinkingIndicator({ text = "Analyzing your request..." }: ThinkingIndicatorProps) {
  return (
    <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-600 animate-pulse flex-shrink-0" />
        <span className="font-medium text-purple-900 text-sm">
          {text}
        </span>
      </div>
      {/* Animated gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 rounded-full animate-shimmer bg-[length:200%_100%]" />
    </div>
  );
}
