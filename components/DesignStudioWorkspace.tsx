"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/design-studio/ChatPanel";
import { CanvasArea } from "@/components/design-studio/CanvasArea";
import { ToastContainer } from "@/components/design-studio/Toast";
import { ShareModal } from "@/components/design-studio/ShareModal";
import type { ChatMessage } from "@/lib/design-studio-mock-data";
import { mockProjects } from "@/lib/design-studio-mock-data";
import type { ToastProps } from "@/components/design-studio/Toast";

export type TabType = "value-prop" | "brand" | "style" | "landing";

export function DesignStudioWorkspace() {
  const [activeTab, setActiveTab] = useState<TabType>("value-prop");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    mockProjects.saas.chatHistory
  );
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Using SaaS project as default
  const currentProject = mockProjects.saas;

  const addToast = (message: string, type: "success" | "info" | "download" | "link" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleExport = (format: string, message: string) => {
    addToast(message, "download");
    setTimeout(() => {
      addToast(`✓ ${format} export completed`, "success");
    }, 1500);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

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
    <>
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
          onExport={handleExport}
          onShare={handleShare}
        />
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onCopy={addToast}
        projectName={currentProject.name}
      />
    </>
  );
}

