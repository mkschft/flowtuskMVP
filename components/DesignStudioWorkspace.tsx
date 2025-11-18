"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/copilot/ChatPanel";
import { CanvasArea } from "@/components/copilot/CanvasArea";
import { ToastContainer } from "@/components/copilot/Toast";
import { ShareModal } from "@/components/copilot/ShareModal";
import { ToolBar } from "@/components/copilot/ToolBar";
import type { ChatMessage, DesignProject } from "@/lib/design-studio-mock-data";
import type { ToastProps } from "@/components/copilot/Toast";
import type {
  PositioningDesignAssets,
  CopilotWorkspaceData,
} from "@/lib/types/design-assets";

export type TabType = "value-prop" | "brand" | "style" | "landing";

const MAX_REGENERATIONS = 4;

type DesignStudioWorkspaceProps = {
  icpId: string;
  flowId: string;
};

export function DesignStudioWorkspace({ icpId, flowId }: DesignStudioWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("value-prop");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data from database
  const [workspaceData, setWorkspaceData] = useState<CopilotWorkspaceData | null>(null);
  const [designAssets, setDesignAssets] = useState<PositioningDesignAssets | null>(null);
  
  const handleBackToConversations = () => {
    router.push(`/app?flowId=${flowId}`);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: "Welcome to the Design Studio! I can help you customize your brand, style guide, and landing page design.",
    },
  ]);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(true);
  
  // Generation states
  const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
  const [isGeneratingLanding, setIsGeneratingLanding] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadWorkspaceData();
  }, [icpId, flowId]);
  
  // Trigger background generation after workspace loads
  useEffect(() => {
    if (workspaceData && !loading) {
      triggerBackgroundGeneration();
    }
  }, [workspaceData, loading]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Unified workspace fetch (single request)
      const wsRes = await fetch(`/api/workspace?icpId=${icpId}&flowId=${flowId}`);

      if (wsRes.ok) {
        const { icp, valueProp, designAssets: assets } = await wsRes.json();
        if (!icp) throw new Error("Persona not found");

        setWorkspaceData({ persona: icp, valueProp: valueProp || null, designAssets: assets || null });
        setDesignAssets(assets || null);
        setLoading(false);
        return;
      }

      // Fallback for compatibility: fetch the three endpoints separately
      console.warn('⚠️ [Design Studio] Workspace API fallback path');
      const icpResponse = await fetch(`/api/positioning-icps?id=${icpId}&flowId=${flowId}`);
      if (!icpResponse.ok) throw new Error("Failed to load persona data");
      const { icp } = await icpResponse.json();
      if (!icp) throw new Error("Persona not found");

      const valuePropResponse = await fetch(`/api/value-props?icpId=${icpId}&flowId=${flowId}`);
      const { valueProp } = await valuePropResponse.json();

      const designAssetsResponse = await fetch(`/api/design-assets?icpId=${icpId}&flowId=${flowId}`);
      const { designAssets: assets } = await designAssetsResponse.json();

      setWorkspaceData({ persona: icp, valueProp: valueProp || null, designAssets: assets || null });
      setDesignAssets(assets || null);
      setLoading(false);
    } catch (err) {
      console.error("❌ [Design Studio] Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
      setLoading(false);
    }
  };
  
  // Background generation orchestration
  const triggerBackgroundGeneration = async () => {
    if (!workspaceData) return;
    
    const hasDesignAssets = designAssets !== null;
    const generationState = designAssets?.generation_state || { brand: false, style: false, landing: false };
    
    console.log('🎨 [Design Studio] Generation state:', { hasDesignAssets, generationState });
    
    // If all assets already generated, nothing to do
    if (generationState.brand && generationState.style && generationState.landing) {
      console.log('✅ [Design Studio] All design assets already generated');
      return;
    }
    
    // Step 1: Generate Brand Guide (if not exists)
    if (!generationState.brand) {
      console.log('🎨 [Design Studio] Starting brand guide generation...');
      setIsGeneratingBrand(true);
      
      try {
        const brandRes = await fetch('/api/design-assets/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icpId, flowId, tab: 'brand' })
        });
        
        if (brandRes.ok) {
          const { designAssets: updatedAssets } = await brandRes.json();
          setDesignAssets(updatedAssets);
          console.log('✅ [Design Studio] Brand guide generated');
          
          // Update chat with success message
          setChatMessages(prev => [...prev, {
            role: 'ai',
            content: '🎨 Your brand guide is ready! Check the Brand Guide tab to see your custom colors, typography, and brand personality.'
          }]);
          
          // Step 2 & 3: Generate Style Guide and Landing Page in parallel
          Promise.all([
            generateStyleGuide(),
            generateLandingPage()
          ]);
        } else {
          console.error('❌ [Design Studio] Brand guide generation failed');
        }
      } catch (err) {
        console.error('❌ [Design Studio] Brand guide generation error:', err);
      } finally {
        setIsGeneratingBrand(false);
      }
    } else {
      // Brand already exists, generate style and landing in parallel
      Promise.all([
        !generationState.style && generateStyleGuide(),
        !generationState.landing && generateLandingPage()
      ]);
    }
  };
  
  const generateStyleGuide = async () => {
    console.log('🎨 [Design Studio] Starting style guide generation...');
    setIsGeneratingStyle(true);
    
    try {
      const styleRes = await fetch('/api/design-assets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icpId, flowId, tab: 'style' })
      });
      
      if (styleRes.ok) {
        const { designAssets: updatedAssets } = await styleRes.json();
        setDesignAssets(updatedAssets);
        console.log('✅ [Design Studio] Style guide generated');
        
        // Update chat
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: '✨ Your style guide is complete! See button variants, form styles, spacing, and shadows in the Style Guide tab.'
        }]);
      } else {
        console.error('❌ [Design Studio] Style guide generation failed');
      }
    } catch (err) {
      console.error('❌ [Design Studio] Style guide generation error:', err);
    } finally {
      setIsGeneratingStyle(false);
    }
  };
  
  const generateLandingPage = async () => {
    console.log('🎨 [Design Studio] Starting landing page generation...');
    setIsGeneratingLanding(true);
    
    try {
      const landingRes = await fetch('/api/design-assets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icpId, flowId, tab: 'landing' })
      });
      
      if (landingRes.ok) {
        const { designAssets: updatedAssets } = await landingRes.json();
        setDesignAssets(updatedAssets);
        console.log('✅ [Design Studio] Landing page generated');
        
        // Update chat
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: '🚀 Your landing page design is ready! Check the Landing tab to preview your hero section, features, and more.'
        }]);
      } else {
        console.error('❌ [Design Studio] Landing page generation failed');
      }
    } catch (err) {
      console.error('❌ [Design Studio] Landing page generation error:', err);
    } finally {
      setIsGeneratingLanding(false);
    }
  };

  // Build a DesignProject-like object for compatibility with existing components
  const currentProject: DesignProject | null = workspaceData ? {
    id: workspaceData.persona.id,
    name: workspaceData.persona.persona_company.split('(')[0].trim(),
    type: "saas",
    description: workspaceData.persona.description,
    chatHistory: chatMessages,
    valueProp: {
      headline: workspaceData.valueProp?.variations?.find(v => v.id === 'benefit-first')?.text || 
                workspaceData.persona.description,
      subheadline: workspaceData.valueProp?.summary?.mainInsight || 
                   `Transform how ${workspaceData.persona.title} solve their biggest challenges`,
      problem: workspaceData.persona.pain_points.join(", "),
      solution: workspaceData.valueProp?.summary?.approachStrategy || 
                `Tailored solutions designed specifically for ${workspaceData.persona.persona_company}`,
      outcome: workspaceData.valueProp?.summary?.expectedImpact || 
               `Proven results that help teams like yours achieve their goals faster`,
      benefits: workspaceData.valueProp?.variations?.map(v => v.text) || 
                workspaceData.persona.pain_points.map(p => `Solve: ${p}`),
      targetAudience: workspaceData.persona.title,
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
      footer: { sections: [] },
    },
  } : null;

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
          context: workspaceData ? {
            persona: {
              name: workspaceData.persona.persona_name,
              role: workspaceData.persona.persona_role,
              company: workspaceData.persona.persona_company,
              industry: workspaceData.persona.title || 'Business',
              location: workspaceData.persona.location,
              country: workspaceData.persona.country,
              painPoints: workspaceData.persona.pain_points,
              goals: workspaceData.persona.goals || [],
            },
            valueProp: workspaceData.valueProp ? {
              headline: currentProject?.valueProp.headline || '',
              subheadline: currentProject?.valueProp.subheadline || '',
              problem: currentProject?.valueProp.problem || '',
              solution: currentProject?.valueProp.solution || '',
              targetAudience: currentProject?.valueProp.targetAudience || '',
            } : undefined,
            brandGuide: designAssets?.brand_guide ? {
              colors: {
                primary: designAssets.brand_guide.colors.primary || [],
                secondary: designAssets.brand_guide.colors.secondary || [],
              },
              typography: designAssets.brand_guide.typography || [],
              toneOfVoice: designAssets.brand_guide.toneOfVoice || [],
            } : undefined,
            regenerationCount,
          } : { regenerationCount },
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
      // Check for function call format from new API
      const functionCallMatch = response.match(/__FUNCTION_CALL__(.+)/);
      let updates;
      
      if (functionCallMatch) {
        // Parse function call arguments
        const parsed = JSON.parse(functionCallMatch[1]);
        updates = parsed;
      } else {
        // Fallback: Look for legacy JSON format
        const jsonMatch = response.match(/\{[\s\S]*"updates"[\s\S]*\}/);
        if (!jsonMatch) return;
        
        const parsed = JSON.parse(jsonMatch[0]);
        updates = parsed.updates;
      }

      if (!updates) return;

      // Apply updates to project state
      // Note: This updates design assets, not the project directly
      if (!workspaceData || !designAssets) return;
      
      setDesignAssets((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev };

        if (updates.colors && Array.isArray(updates.colors) && updated.brand_guide) {
          // Update primary colors
          updates.colors.forEach((hex: string, idx: number) => {
            if (updated.brand_guide.colors.primary[idx]) {
              updated.brand_guide.colors.primary[idx].hex = hex;
            }
          });
          addToast("Colors updated! 🎨", "success");
          setTimeout(() => setActiveTab("brand"), 500);
        }

        if (updates.fonts && updated.brand_guide) {
          if (updates.fonts.heading) {
            const headingFont = updated.brand_guide.typography.find((t: any) => t.category === "heading");
            if (headingFont) headingFont.fontFamily = updates.fonts.heading;
          }
          if (updates.fonts.body) {
            const bodyFont = updated.brand_guide.typography.find((t: any) => t.category === "body");
            if (bodyFont) bodyFont.fontFamily = updates.fonts.body;
          }
          addToast("Fonts updated! ✨", "success");
        }

        if (updates.headline && updated.landing_page) {
          updated.landing_page.hero.headline = updates.headline;
          addToast("Headline updated!", "success");
        }

        if (updates.subheadline && updated.landing_page) {
          updated.landing_page.hero.subheadline = updates.subheadline;
          addToast("Subheadline updated!", "success");
        }

        return updated;
      });
    } catch (error) {
      // Silently fail - not all responses will have JSON
      console.log("No structured updates found in response");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Design Studio...</p>
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
          
          {/* Toolbar with Team & Actions */}
          <ToolBar activeTab={activeTab} onExport={handleExport} onShare={handleShare} />
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
            project={currentProject!}
            persona={workspaceData!.persona as any}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isGeneratingBrand={isGeneratingBrand}
            isGeneratingStyle={isGeneratingStyle}
            isGeneratingLanding={isGeneratingLanding}
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

