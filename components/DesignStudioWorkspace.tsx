"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/copilot/ChatPanel";
import { CanvasArea } from "@/components/copilot/CanvasArea";
import { ToastContainer } from "@/components/copilot/Toast";
import { ShareModal } from "@/components/copilot/ShareModal";
import type { ChatMessage, DesignProject } from "@/lib/design-studio-mock-data";
import { mockProjects } from "@/lib/design-studio-mock-data";
import type { ToastProps } from "@/components/copilot/Toast";

export type TabType = "value-prop" | "brand" | "style" | "landing";

const MAX_REGENERATIONS = 4;

export function DesignStudioWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("value-prop");
  
  const handleBackToConversations = () => {
    // Navigate to /app and scroll to bottom after navigation
    router.push('/app');
    // Use setTimeout to ensure navigation completes before scrolling
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    mockProjects.saas.chatHistory
  );
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [project, setProject] = useState<DesignProject>(mockProjects.saas);
  const [isChatVisible, setIsChatVisible] = useState(true);

  // Using SaaS project as default
  const currentProject = project;

  const addToast = (message: string, type: "success" | "info" | "download" | "link" = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

  const handleSendMessage = useCallback(async (message: string) => {
    if (regenerationCount >= MAX_REGENERATIONS) {
      addToast("Regeneration limit reached. Refresh to start a new conversation.", "info");
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };
    
    setChatMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage].map(msg => ({
            role: msg.role === "ai" ? "assistant" : msg.role,
            content: msg.content
          })),
          project: {
            name: currentProject.name,
            colors: currentProject.brandGuide.colors.primary.map(c => c.hex),
            fonts: {
              heading: currentProject.brandGuide.typography.find(t => t.category === "heading")?.fontFamily,
              body: currentProject.brandGuide.typography.find(t => t.category === "body")?.fontFamily,
            }
          },
          regenerationCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitReached) {
          addToast("Regeneration limit reached!", "info");
        } else {
          addToast("Failed to get response. Please try again.", "info");
        }
        setIsStreaming(false);
        return;
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          aiResponse += chunk;

          // Update AI message in real-time
          setChatMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "ai") {
              return [...prev.slice(0, -1), { role: "ai", content: aiResponse }];
            }
            return [...prev, { role: "ai", content: aiResponse }];
          });
        }
      }

      // Parse updates from AI response if JSON is present
      parseAndApplyUpdates(aiResponse);
      
      setRegenerationCount(prev => prev + 1);
    } catch (error) {
      console.error("Chat error:", error);
      addToast("Something went wrong. Please try again.", "info");
    } finally {
      setIsStreaming(false);
    }
  }, [chatMessages, currentProject, regenerationCount]);

  const parseAndApplyUpdates = (response: string) => {
    try {
      // Look for JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*"updates"[\s\S]*\}/);
      if (!jsonMatch) return;

      const parsed = JSON.parse(jsonMatch[0]);
      const updates = parsed.updates;

      if (!updates) return;

      // Apply updates to project state
      setProject(prev => {
        const updated = { ...prev };

        if (updates.colors && Array.isArray(updates.colors)) {
          // Update primary colors
          updates.colors.forEach((hex: string, idx: number) => {
            if (updated.brandGuide.colors.primary[idx]) {
              updated.brandGuide.colors.primary[idx].hex = hex;
            }
          });
          addToast("Colors updated! 🎨", "success");
          setTimeout(() => setActiveTab("brand"), 500);
        }

        if (updates.fonts) {
          if (updates.fonts.heading) {
            const headingFont = updated.brandGuide.typography.find(t => t.category === "heading");
            if (headingFont) headingFont.fontFamily = updates.fonts.heading;
          }
          if (updates.fonts.body) {
            const bodyFont = updated.brandGuide.typography.find(t => t.category === "body");
            if (bodyFont) bodyFont.fontFamily = updates.fonts.body;
          }
          addToast("Fonts updated! ✨", "success");
        }

        if (updates.headline) {
          updated.valueProp.headline = updates.headline;
          updated.landingPage.hero.headline = updates.headline;
          addToast("Headline updated!", "success");
        }

        if (updates.subheadline) {
          updated.valueProp.subheadline = updates.subheadline;
          updated.landingPage.hero.subheadline = updates.subheadline;
          addToast("Subheadline updated!", "success");
        }

        return updated;
      });
    } catch (error) {
      // Silently fail - not all responses will have JSON
      console.log("No structured updates found in response");
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen w-full">
        {/* Navigation Header with Back Button */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatVisible(!isChatVisible)}
            className="h-8 w-8"
            title={isChatVisible ? "Hide chat panel" : "Show chat panel"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToConversations}
            className="gap-1.5"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Conversations
          </Button>
          <div className="flex-1" />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left: Chat Panel - Fixed Width with Slide Animation */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isChatVisible ? 'w-[420px] opacity-100' : 'w-0 opacity-0'
            } overflow-hidden flex-shrink-0`}
          >
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              projectName={currentProject.name}
              isStreaming={isStreaming}
              regenerationCount={regenerationCount}
              maxRegenerations={MAX_REGENERATIONS}
            />
          </div>

          {/* Right: Canvas Area - Takes remaining space */}
          <CanvasArea
            project={currentProject}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onExport={handleExport}
            onShare={handleShare}
          />

        </div>
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

