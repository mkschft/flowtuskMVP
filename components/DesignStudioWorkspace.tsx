"use client";

import { useMemo, useEffect, useRef } from "react";
import { convertManifestToDesignAssets } from "@/lib/utils/manifest-updates";
import { useRouter } from "next/navigation";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/copilot/ChatPanel";
import { CanvasArea } from "@/components/copilot/CanvasArea";
import { ToastContainer } from "@/components/copilot/Toast";
import { ShareModal } from "@/components/copilot/ShareModal";
import { ToolBar } from "@/components/copilot/ToolBar";
import type { DesignProject, ChatMessage } from "@/lib/design-studio-mock-data";
import { exportElementAsImage, exportElementAsPDF } from "@/lib/export-utils";
import { useCopilotStore } from "@/lib/stores/use-copilot-store";

// Custom Hooks
import {
  useWorkspaceData,
  useManifest,
  useManifestHistory,
  useGenerationOrchestration,
  useChatStreaming,
  useManifestUpdates
} from "@/lib/hooks/design-studio";

export type TabType = "strategy" | "identity" | "components" | "previews";

type DesignStudioWorkspaceProps = {
  icpId: string;
  flowId: string;
};

export function DesignStudioWorkspace({ icpId, flowId }: DesignStudioWorkspaceProps) {
  const router = useRouter();

  // Zustand Store - All UI state managed here
  const {
    activeTab,
    setActiveTab,
    shareModalOpen,
    setShareModalOpen,
    toasts,
    addToast,
    removeToast,
    chatMessages,
    setChatMessages,
    generationSteps,
    setGenerationSteps,
  } = useCopilotStore();

  // --- Hooks ---

  // 1. Workspace Data
  const {
    workspaceData,
    designAssets,
    uiValueProp,
    setWorkspaceData,
    setDesignAssets,
    setUiValueProp,
    loading,
    error,
    reload: reloadWorkspace
  } = useWorkspaceData(icpId, flowId);

  // 2. Manifest
  const {
    manifest,
    setManifest,
    reload: reloadManifest
  } = useManifest(flowId, designAssets, setUiValueProp);

  // 3. History
  const {
    canUndo,
    canRedo,
    undo: handleUndo,
    redo: handleRedo,
    addToHistory
  } = useManifestHistory(manifest, setManifest, reloadWorkspace, addToast);

  // 4. Update Parsing (Bridge between Chat and State)
  const { parseAndApplyUpdates } = useManifestUpdates(
    workspaceData,
    designAssets,
    setWorkspaceData,
    setDesignAssets,
    setUiValueProp,
    setManifest,
    setChatMessages,
    setGenerationSteps,
    setActiveTab,
    addToast,
    addToHistory,
    reloadWorkspace,
    flowId,
    icpId
  );

  // 5. Project Data Mapping (Computed)
  const currentProject: DesignProject | null = useMemo(() => {
    if (!workspaceData || !uiValueProp) return null;

    return {
      id: workspaceData.persona.id,
      name: workspaceData.persona.persona_company.split('(')[0].trim(),
      type: "saas",
      description: workspaceData.persona.description,
      chatHistory: chatMessages,
      valueProp: {
        ...uiValueProp,
        ctaSuggestions: ["Get Started", "Learn More", "Try Free"],
      },
      brandGuide: designAssets?.brand_guide || {
        colors: { primary: [], secondary: [], accent: [], neutral: [] },
        typography: [],
        logoVariations: [],
        toneOfVoice: [],
        personalityTraits: [],
      },
      styleGuide: designAssets?.style_guide || {
        buttons: [],
        cards: [],
        formElements: [],
        spacing: [],
        borderRadius: [],
        shadows: [],
      },
      landingPage: designAssets?.landing_page || {
        navigation: { logo: "", links: [] },
        hero: { headline: "", subheadline: "", cta: { primary: "", secondary: "" } },
        features: [],
        socialProof: [],
        pricing: [],
        footer: { sections: [] },
      },
    };
  }, [workspaceData, uiValueProp, designAssets, chatMessages]);

  // 5.5 Sync manifest to designAssets when manifest changes (prevents flicker)
  // Only sync on initial load when designAssets is null - prevents flicker from re-syncing
  const hasSyncedRef = useRef(false);
  useEffect(() => {
    if (!manifest || !flowId || !icpId) return;

    // Only sync once on initial load (when designAssets is null)
    // This prevents flicker from re-syncing when manifest updates
    if (hasSyncedRef.current && designAssets) {
      return; // Already synced, don't re-sync
    }

    // Convert manifest to designAssets to keep UI in sync (only on initial load)
    const updatedDesignAssets = convertManifestToDesignAssets(
      manifest,
      flowId,
      icpId,
      designAssets
    );

    // Only update if designAssets is null (initial load) or if colors actually changed
    const currentColors = designAssets?.brand_guide?.colors?.primary?.[0]?.hex;
    const newColors = updatedDesignAssets.brand_guide?.colors?.primary?.[0]?.hex;

    if (!designAssets || currentColors !== newColors) {
      console.log('🔄 [Design Studio] Syncing manifest to designAssets (initial load)...', {
        oldColor: currentColors,
        newColor: newColors,
        isInitial: !designAssets
      });
      setDesignAssets({ ...updatedDesignAssets });
      hasSyncedRef.current = true;

      if (workspaceData) {
        setWorkspaceData({
          ...workspaceData,
          designAssets: { ...updatedDesignAssets }
        });
      }
    }
  }, [manifest, flowId, icpId, designAssets, workspaceData, setDesignAssets, setWorkspaceData]);

  // 6. Chat Streaming
  const {
    isStreaming,
    regenerationCount,
    isChatVisible,
    setIsChatVisible,
    handleSendMessage
  } = useChatStreaming(
    flowId,
    icpId,
    workspaceData,
    designAssets,
    currentProject,
    chatMessages,
    setChatMessages,
    parseAndApplyUpdates,
    addToast
  );

  // 7. Generation Orchestration
  const {
    isGeneratingBrand,
    isGeneratingStyle,
    isGeneratingLanding
  } = useGenerationOrchestration(
    icpId,
    flowId,
    workspaceData,
    designAssets,
    manifest,
    generationSteps,
    setGenerationSteps,
    reloadWorkspace,
    reloadManifest,
    setChatMessages
  );

  // Cleanup: Reset store when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      console.log('🧹 [Design Studio] Cleaning up - resetting copilot store');
      const { reset } = useCopilotStore.getState();
      reset();
    };
  }, []);

  // --- Event Handlers ---

  const handleBackToConversations = () => {
    router.push(`/app?flowId=${flowId}`);
  };

  const handleExport = async (format: string, message: string) => {
    const elementId = `canvas-${activeTab}`;
    const element = document.getElementById(elementId);

    if (!element) {
      addToast("Could not find content to export", "info");
      return;
    }

    try {
      addToast(message || `Exporting as ${format.toUpperCase()}...`, "download");

      if (format === 'png') {
        await exportElementAsImage(elementId, `${currentProject?.name || 'design'}-${activeTab}.png`);
      } else {
        await exportElementAsPDF(elementId, `${currentProject?.name || 'design'}-${activeTab}.pdf`);
      }

      addToast("Export complete!", "success");
    } catch (error) {
      console.error("Export failed:", error);
      addToast("Export failed. Please try again.", "info");
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  // --- Render ---

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Brand Canvas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentProject) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Failed to Load</h2>
          <p className="text-muted-foreground">{error || "Could not load workspace data"}</p>
          <Button onClick={handleBackToConversations} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen w-full">
        {/* Navigation Header with Back Button */}
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 border-b bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatVisible(!isChatVisible)}
            className="h-8 w-8 flex-shrink-0"
            title={isChatVisible ? "Hide chat panel" : "Show chat panel"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToConversations}
            className="gap-1.5 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Conversations</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex-1" />

          {/* Toolbar with Team & Actions */}
          <ToolBar
            activeTab={activeTab}
            onExport={handleExport}
            onShare={handleShare}
            flowId={flowId}
            workspaceData={workspaceData}
            designAssets={designAssets}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left: Chat Panel - Responsive Width with Slide Animation */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isChatVisible
                ? 'w-full md:w-[420px] opacity-100'
                : 'w-0 opacity-0'
            } overflow-hidden flex-shrink-0 md:relative absolute inset-0 md:inset-auto z-10 md:z-auto`}
          >
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              projectName={currentProject.name}
              isStreaming={isStreaming}
              regenerationCount={regenerationCount}
              maxRegenerations={4}
              generationSteps={generationSteps}
            />
          </div>

          {/* Right: Canvas Area - Takes remaining space */}
          <CanvasArea
            project={currentProject}
            persona={workspaceData!.persona as any}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isGeneratingBrand={isGeneratingBrand}
            isGeneratingStyle={isGeneratingStyle}
            isGeneratingLanding={isGeneratingLanding}
            manifest={manifest}
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
