"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CompactPersonaCard } from "@/components/CompactPersonaCard";
import { EmailContentModal } from "@/components/EmailContentModal";
import { LinkedInContentModal } from "@/components/LinkedInContentModal";
import { LandingPageModal } from "@/components/LandingPageModal";
import { AnimatePresence } from "motion/react";
import { Bot, User } from "lucide-react";

type ChatMessage = {
  role: "ai" | "user";
  content: string;
  timestamp?: string;
};

const mockChatHistory: ChatMessage[] = [
  {
    role: "user",
    content: "Analyze the accounting firm market for my SaaS product",
  },
  {
    role: "ai",
    content: "I'll analyze the accounting firm market for you. Let me gather insights about mid-sized accounting firm owners...",
  },
  {
    role: "user",
    content: "What are their main pain points?",
  },
  {
    role: "ai",
    content: "Based on my analysis, mid-sized accounting firm owners face several key challenges:\n\n• 15+ hours per week spent on admin tasks\n• Difficulty hiring qualified staff\n• Manual data entry errors\n• Scattered client communication",
  },
  {
    role: "user",
    content: "Generate the full ICP profile",
  },
  {
    role: "ai",
    content: "I've generated a comprehensive Ideal Customer Profile for you. Here's the summary with 92% match score →",
  },
];

export function PersonaWithChat() {
  const [activeModal, setActiveModal] = useState<'email' | 'linkedin' | 'landing' | null>(null);

  return (
    <div className="flex h-screen w-full">
      {/* Left: Chat Window - Fixed Width */}
      <div className="w-[420px] flex flex-col border-r">
        <Card className="relative overflow-hidden border-0 border-r-2 flex flex-col h-full rounded-none">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Persona Assistant</h3>
                <p className="text-xs text-muted-foreground">Analyzing your target market...</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockChatHistory.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-foreground ml-auto"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input Placeholder */}
          <div className="p-4 border-t bg-background">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-muted-foreground/20 text-muted-foreground text-sm">
              <span>Continue conversation...</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Preview Window - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Preview Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b bg-background">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-sm font-medium text-muted-foreground ml-2">Preview</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded bg-muted">Live</span>
          </div>
        </div>

        {/* Preview Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <CompactPersonaCard 
            onEmailClick={() => setActiveModal('email')}
            onLinkedInClick={() => setActiveModal('linkedin')}
            onLandingClick={() => setActiveModal('landing')}
          />
        </div>
      </div>

      {/* Modals - Only one visible at a time */}
      <AnimatePresence>
        {activeModal === 'email' && (
          <EmailContentModal 
            onClose={() => setActiveModal(null)}
          />
        )}
        
        {activeModal === 'linkedin' && (
          <LinkedInContentModal 
            onClose={() => setActiveModal(null)}
          />
        )}
        
        {activeModal === 'landing' && (
          <LandingPageModal 
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

