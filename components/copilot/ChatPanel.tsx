"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/design-studio-mock-data";
import { cn } from "@/lib/utils";
import { GenerationProgress } from "@/components/copilot/GenerationProgress";

type ChatPanelProps = {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  projectName: string;
  isStreaming?: boolean;
  regenerationCount?: number;
  maxRegenerations?: number;
  generationSteps?: Array<{id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete'}>;
};

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  projectName, 
  isStreaming = false,
  regenerationCount = 0,
  maxRegenerations = 4,
  generationSteps = []
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-[420px] flex flex-col border-r bg-background h-full">
      <Card className="relative overflow-hidden border-0 border-r-2 flex flex-col h-full rounded-none">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => {
            // Strip any code blocks, function calls, and JSON
            const originalContent = message.content;
            
            // Count function calls for status indicator
            const functionCallMatches = originalContent.match(/__FUNCTION_CALL__/g);
            const functionCallCount = functionCallMatches ? functionCallMatches.length : 0;
            
            // Clean display content
            const displayContent = originalContent
              // remove function call markers and their JSON
              .replace(/__FUNCTION_CALL__[\s\S]*?(?=\n\n|$)/g, "")
              // remove fenced blocks
              .replace(/```[\s\S]*?```/g, "")
              // remove bare JSON objects that include an "updates" key
              .replace(/\{[\s\S]*?\"updates\"[\s\S]*?\}/g, "")
              // collapse excessive blank lines
              .replace(/\n{3,}/g, "\n\n")
              .trim();
            
            // Skip rendering if only function calls (no human-readable content)
            if (!displayContent && functionCallCount > 0) {
              return null;
            }
            
            // Render GenerationProgress component for special markers
            if (originalContent === '__GENERATION_PROGRESS__' || originalContent === '__UPDATE_PROGRESS__') {
              const allComplete = generationSteps.every(s => s.status === 'complete');
              
              // Only show if there are steps to display
              if (generationSteps.length === 0) return null;
              
              return (
                <div key={idx} className="w-full">
                  <GenerationProgress steps={generationSteps} allComplete={allComplete} />
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-foreground ml-auto"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {displayContent || (message.role === "ai" ? "Applied your requested changes." : message.content)}
                  </p>
                  
                  {/* Quick Action Buttons for AI confirmation questions */}
                  {message.role === "ai" && 
                   idx === messages.length - 1 && 
                   !isStreaming &&
                   (displayContent.toLowerCase().includes("would you like") ||
                    displayContent.toLowerCase().includes("shall i") ||
                    displayContent.toLowerCase().includes("proceed with") ||
                    displayContent.toLowerCase().includes("implement these") ||
                    displayContent.toLowerCase().includes("do you want")) && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => {
                          onSendMessage("Yes, proceed");
                        }}
                        className="flex-1"
                      >
                        Yes, proceed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSendMessage("No, let me clarify");
                        }}
                        className="flex-1"
                      >
                        No, clarify
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Streaming Indicator */}
          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div 
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
                    style={{ animationDelay: "0ms" }} 
                  />
                  <div 
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
                    style={{ animationDelay: "150ms" }} 
                  />
                  <div 
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
                    style={{ animationDelay: "300ms" }} 
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to adjust colors, fonts, layout..."
              className="flex-1"
              disabled={isStreaming || regenerationCount >= maxRegenerations}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming || regenerationCount >= maxRegenerations}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Try: "Show me the landing page" or "Change the brand colors"
            </p>
            <p className={cn(
              "text-xs font-medium",
              regenerationCount >= maxRegenerations 
                ? "text-orange-600 dark:text-orange-400" 
                : "text-muted-foreground"
            )}>
              {regenerationCount}/{maxRegenerations} uses
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

