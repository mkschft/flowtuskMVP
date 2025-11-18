"use client";

import React from "react";
import { memoryManager } from "@/lib/memory-manager";

export const MemoryStatusIndicator: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const memory = memoryManager.getMemory(conversationId);
  const completedActions = memoryManager.getCompletedActions(conversationId);
  
  if (!memory || completedActions.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-lg max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Memory Active</span>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        <div>Completed: {completedActions.length} actions</div>
        <div>Last: {memory.userPreferences.lastAction || 'None'}</div>
      </div>
    </div>
  );
};
