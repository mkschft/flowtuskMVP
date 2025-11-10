"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/design-studio/ChatPanel";
import { CanvasArea } from "@/components/design-studio/CanvasArea";
import type { ChatMessage } from "@/lib/design-studio-mock-data";
import { mockProjects } from "@/lib/design-studio-mock-data";

export type TabType = "value-prop" | "brand" | "style" | "landing";

export function DesignStudioWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>("value-prop");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    mockProjects.saas.chatHistory
  );

  // Using SaaS project as default
  const currentProject = mockProjects.saas;

  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };
    
    setChatMessages((prev) => [...prev, userMessage]);

    // Pattern matching for mock responses
    setTimeout(() => {
      let aiResponse = "";
      let switchTab: TabType | null = null;

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("color") || lowerMessage.includes("brand guide")) {
        aiResponse = "I've updated the brand colors for you. Check out the Brand Guide tab to see the changes! 🎨";
        switchTab = "brand";
      } else if (lowerMessage.includes("landing") || lowerMessage.includes("page")) {
        aiResponse = "Here's your landing page preview. I've designed it based on your brand guidelines. Take a look! 🚀";
        switchTab = "landing";
      } else if (lowerMessage.includes("value prop") || lowerMessage.includes("messaging")) {
        aiResponse = "I've refined your value proposition. The messaging should really resonate with your target audience now. ✨";
        switchTab = "value-prop";
      } else if (lowerMessage.includes("component") || lowerMessage.includes("style")) {
        aiResponse = "Here's your complete style guide with all the UI components. Everything is consistent and ready to use! 📐";
        switchTab = "style";
      } else if (lowerMessage.includes("more") && (lowerMessage.includes("modern") || lowerMessage.includes("innovative") || lowerMessage.includes("playful"))) {
        aiResponse = "Great! I've adjusted the design to feel more modern and innovative. The colors are more vibrant now. 🌟";
        switchTab = "brand";
      } else {
        aiResponse = "Got it! I'm working on that for you. Let me know if you'd like me to adjust anything else. 💡";
      }

      const aiMessage: ChatMessage = {
        role: "ai",
        content: aiResponse,
      };

      setChatMessages((prev) => [...prev, aiMessage]);

      if (switchTab) {
        setTimeout(() => setActiveTab(switchTab), 500);
      }
    }, 800);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left: Chat Panel - Fixed Width */}
      <ChatPanel
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        projectName={currentProject.name}
      />

      {/* Right: Canvas Area - Takes remaining space */}
      <CanvasArea
        project={currentProject}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

