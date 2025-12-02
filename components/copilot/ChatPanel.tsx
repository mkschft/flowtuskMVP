"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/lib/design-studio-mock-data";
import { cn } from "@/lib/utils";
import { GenerationProgress } from "@/components/copilot/GenerationProgress";
import { SystemUpdateCard } from "@/components/copilot/SystemUpdateCard";
import { ThinkingIndicator } from "@/components/copilot/ThinkingIndicator";
import { ConversationalMessage } from "@/components/copilot/ConversationalMessage";

type ChatPanelProps = {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  projectName: string;
  isStreaming?: boolean;
  regenerationCount?: number;
  maxRegenerations?: number;
  generationSteps?: Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>;
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

  // Parse message type and metadata
  const parseMessageType = (content: string): {
    type: 'generation-progress' | 'system-update' | 'conversational' | 'user';
    metadata: { updates?: string[]; message?: string }
  } => {
    if (content === '__GENERATION_PROGRESS__' || content === '__UPDATE_PROGRESS__') {
      return { type: 'generation-progress', metadata: {} };
    }

    if (content.startsWith('__MANIFEST_UPDATED__')) {
      try {
        // Try to parse JSON after marker
        const jsonStr = content.replace('__MANIFEST_UPDATED__', '').trim();
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          return {
            type: 'system-update',
            metadata: {
              updates: parsed.updates || [],
              message: parsed.message || "Applied your changes"
            }
          };
        }
      } catch {
        // If parsing fails, return default system update
        return { type: 'system-update', metadata: { updates: [], message: "Applied your changes" } };
      }
      return { type: 'system-update', metadata: { updates: [], message: "Applied your changes" } };
    }

    // Default to conversational
    return { type: 'conversational', metadata: {} };
  };

  return (
    <div className="w-full md:w-[420px] flex flex-col bg-background h-full">
      <Card className="relative overflow-hidden border-0 md:border-r flex flex-col h-full rounded-none">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => {
            // Parse message type
            const { type, metadata } = parseMessageType(message.content);
            const originalContent = message.content;

            // Count function calls for status indicator
            const functionCallMatches = originalContent.match(/__FUNCTION_CALL__/g);
            const functionCallCount = functionCallMatches ? functionCallMatches.length : 0;

            // Clean display content
            const displayContent = originalContent
              // remove manifest update markers and their JSON
              .replace(/__MANIFEST_UPDATED__[\s\S]*?(?=\n\n|$)/g, "")
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
            if (type === 'generation-progress') {
              const allComplete = generationSteps.every(s => s.status === 'complete');

              // Only show if there are steps to display
              if (generationSteps.length === 0) return null;

              return (
                <div key={idx} className="w-full">
                  <GenerationProgress steps={generationSteps} allComplete={allComplete} />
                </div>
              );
            }

            // Render SystemUpdateCard for manifest updates
            if (type === 'system-update') {
              return (
                <div key={idx} className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <SystemUpdateCard updates={metadata.updates} message={metadata.message} />
                </div>
              );
            }

            // User messages (keep existing styling)
            if (message.role === "user") {
              return (
                <div key={idx} className="flex gap-3 justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 bg-purple-100 text-foreground ml-auto"
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {displayContent || message.content}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              );
            }

            // AI conversational messages with enhanced formatting
            return (
              <div
                key={idx}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>

                <div className="flex flex-col gap-2 max-w-[80%]">
                  <ConversationalMessage content={displayContent || "Applied your requested changes."} />

                  {/* Quick Action Buttons for AI confirmation questions */}
                  {idx === messages.length - 1 &&
                    !isStreaming &&
                    (displayContent.toLowerCase().includes("would you like") ||
                      displayContent.toLowerCase().includes("shall i") ||
                      displayContent.toLowerCase().includes("proceed with") ||
                      displayContent.toLowerCase().includes("implement these") ||
                      displayContent.toLowerCase().includes("do you want")) && (
                      <div className="flex gap-2">
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
              </div>
            );
          })}

          {/* AI Streaming Indicator */}
          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <ThinkingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 md:p-4 border-t bg-background pb-safe">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to adjust colors, fonts, layout..."
              className="flex-1 h-11 md:h-10"
              disabled={isStreaming || regenerationCount >= maxRegenerations}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming || regenerationCount >= maxRegenerations}
              size="icon"
              className="shrink-0 h-11 w-11 md:h-10 md:w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <p className="text-xs text-muted-foreground hidden sm:block flex-1 truncate">
              Try: "Show me the landing page" or "Change the brand colors"
            </p>
            <p className={cn(
              "text-xs font-medium whitespace-nowrap flex items-center gap-1",
              regenerationCount >= maxRegenerations
                ? "text-orange-600"
                : "text-muted-foreground"
            )}>
              <span className="hidden sm:inline">{regenerationCount}/{maxRegenerations} uses</span>
              <span className="sm:hidden">{regenerationCount}/{maxRegenerations}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

