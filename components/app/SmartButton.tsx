"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { generationManager } from "@/lib/generation-manager";

export interface SmartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: string;
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  loadingText?: string;
  conversationId?: string;
}

export const SmartButton: React.FC<SmartButtonProps> = ({ 
  action, 
  onClick, 
  children, 
  disabled: propDisabled,
  loadingText = "Generating...",
  conversationId,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const isActionDisabled = (action: string): boolean => {
    if (!conversationId) return false;
    
    // Check if generation is in progress
    if (generationManager.isGenerating(action, {})) {
      return true;
    }
    
    // Check if already completed (for certain actions)
    if (['value-prop', 'email', 'linkedin', 'landing'].includes(action)) {
      return generationManager.isCompleted(action, {});
    }
    
    return false;
  };

  // Move isDisabled calculation up before handleClick
  const isDisabled = propDisabled || isActionDisabled(action) || isLoading;

  const handleClick = async () => {
    if (isActionDisabled(action) || isLoading || propDisabled) return;
    
    setIsLoading(true);
    
    try {
      await onClick();
    } catch (error) {
      console.error(`SmartButton error for ${action}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      className={`${props.className || ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
