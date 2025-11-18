"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/copilot/ChatPanel";
import { CanvasArea } from "@/components/copilot/CanvasArea";
import { ToastContainer } from "@/components/copilot/Toast";
import { ShareModal } from "@/components/copilot/ShareModal";
import { ToolBar } from "@/components/copilot/ToolBar";
import { GenerationProgress } from "@/components/copilot/GenerationProgress";
import type { ChatMessage, DesignProject } from "@/lib/design-studio-mock-data";
import type { ToastProps } from "@/components/copilot/Toast";
import type {
  PositioningDesignAssets,
  CopilotWorkspaceData,
} from "@/lib/types/design-assets";

export type TabType = "value-prop" | "brand" | "style" | "landing";

const MAX_REGENERATIONS = 4;

// UI-friendly value prop structure (single source of truth)
type UiValueProp = {
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  outcome: string;
  benefits: string[];
  targetAudience: string;
};

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
  
  // UI state: flattened value prop for instant updates
  const [uiValueProp, setUiValueProp] = useState<UiValueProp | null>(null);
  
  const handleBackToConversations = () => {
    router.push(`/app?flowId=${flowId}`);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [generationSteps, setGenerationSteps] = useState<Array<{id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete'}>>([]);
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
  
  // Initialize UI value prop from database
  useEffect(() => {
    if (workspaceData) {
      setUiValueProp({
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
      });
    }
  }, [workspaceData]);
  
  // Trigger background generation after workspace loads
  useEffect(() => {
    if (workspaceData && !loading) {
      triggerBackgroundGeneration();
    }
  }, [workspaceData, loading]);
  
  // Debounced persistence: save UI changes to database after 2s of inactivity
  useEffect(() => {
    if (!uiValueProp || !workspaceData) return;
    
    const timeout = setTimeout(async () => {
      try {
        console.log('💾 [Design Studio] Auto-saving value prop changes...');
        // TODO: Implement /api/value-props/update endpoint
        // await fetch('/api/value-props/update', {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ icpId, flowId, ...uiValueProp })
        // });
        console.log('✅ [Design Studio] Value prop auto-saved');
      } catch (err) {
        console.error('❌ [Design Studio] Auto-save failed:', err);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [uiValueProp, icpId, flowId]);

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
    
    // Initialize generation steps based on current state
    const steps = [
      { 
        id: 'brand', 
        label: 'Brand Guide', 
        icon: '🎨', 
        status: generationState.brand ? 'complete' as const : 'pending' as const 
      },
      { 
        id: 'style', 
        label: 'Style Guide', 
        icon: '✨', 
        status: generationState.style ? 'complete' as const : 'pending' as const 
      },
      { 
        id: 'landing', 
        label: 'Landing Page', 
        icon: '🚀', 
        status: generationState.landing ? 'complete' as const : 'pending' as const 
      }
    ];
    
    setGenerationSteps(steps);
    
    const needsGeneration = !generationState.brand || !generationState.style || !generationState.landing;
    const allComplete = generationState.brand && generationState.style && generationState.landing;
    
    if (needsGeneration) {
      // Show welcome with progress component in chat
      setChatMessages(prev => {
        // Only show progress if chat is empty (initial load)
        if (prev.length > 0) {
          // If there's existing chat, don't reset - user is in a conversation
          return prev;
        }
        return [{
          role: 'ai',
          content: '__GENERATION_PROGRESS__'
        }];
      });
    } else {
      setChatMessages(prev => {
        // Only add welcome if chat is empty (initial load)
        if (prev.length > 0) return prev;
        return [{
          role: 'ai',
          content: 'Welcome back! All your design assets are ready. I can help you customize your brand, style guide, and landing page design.'
        }];
      });
    }
    
    // If all assets already generated, nothing to do
    if (generationState.brand && generationState.style && generationState.landing) {
      console.log('✅ [Design Studio] All design assets already generated');
      return;
    }
    
    // Step 1: Generate Brand Guide (if not exists)
    if (!generationState.brand) {
      console.log('🎨 [Design Studio] Starting brand guide generation...');
      setIsGeneratingBrand(true);
      
      // Update step to loading
      setGenerationSteps(prev => prev.map(s => 
        s.id === 'brand' ? { ...s, status: 'loading' as const } : s
      ));
      
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
          
          // Update step to complete
          setGenerationSteps(prev => prev.map(s => 
            s.id === 'brand' ? { ...s, status: 'complete' as const } : s
          ));
          
          // Step 2: Generate Style Guide (sequential)
          await generateStyleGuide();
          
          // Step 3: Generate Landing Page (sequential)
          await generateLandingPage();
        } else {
          console.error('❌ [Design Studio] Brand guide generation failed');
        }
      } catch (err) {
        console.error('❌ [Design Studio] Brand guide generation error:', err);
      } finally {
        setIsGeneratingBrand(false);
      }
    } else {
      // Brand already exists, generate style and landing sequentially
      if (!generationState.style) {
        await generateStyleGuide();
      }
      if (!generationState.landing) {
        await generateLandingPage();
      }
    }
  };
  
  const generateStyleGuide = async () => {
    console.log('🎨 [Design Studio] Starting style guide generation...');
    setIsGeneratingStyle(true);
    
    // Update step to loading
    setGenerationSteps(prev => prev.map(s => 
      s.id === 'style' ? { ...s, status: 'loading' as const } : s
    ));
    
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
        
        // Update step to complete
        setGenerationSteps(prev => prev.map(s => 
          s.id === 'style' ? { ...s, status: 'complete' as const } : s
        ));
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
    
    // Update step to loading
    setGenerationSteps(prev => prev.map(s => 
      s.id === 'landing' ? { ...s, status: 'loading' as const } : s
    ));
    
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
        
        // Update step to complete and mark all done
        setGenerationSteps(prev => prev.map(s => 
          s.id === 'landing' ? { ...s, status: 'complete' as const } : s
        ));
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
  // Use useMemo to recompute when uiValueProp or other dependencies change
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
        footer: { sections: [] },
      },
    };
  }, [workspaceData, uiValueProp, designAssets, chatMessages]);

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
    
    // Show preparing indicator for complex requests
    const isComplexRequest = message.toLowerCase().includes('change') || 
                            message.toLowerCase().includes('update') || 
                            message.toLowerCase().includes('location') ||
                            message.toLowerCase().includes('market');
    
    if (isComplexRequest) {
      // Add temporary loading message
      setChatMessages((prev) => [...prev, { 
        role: 'ai', 
        content: '⚡ Analyzing your request...' 
      }]);
    }

    try {
      // Filter out internal UI markers before sending to API
      const cleanMessages = [...chatMessages, userMessage]
        .filter(msg => {
          // Remove progress markers - these are internal UI state
          return msg.content !== '__GENERATION_PROGRESS__' && 
                 msg.content !== '__UPDATE_PROGRESS__';
        })
        .map(msg => ({
          role: msg.role === "ai" ? "assistant" : msg.role,
          content: msg.content
        }));
      
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: cleanMessages,
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

      if (!reader) {
        console.error("❌ [Chat] No reader available from response");
        addToast("Failed to read response. Please try again.", "info");
        setIsStreaming(false);
        return;
      }

      console.log("📖 [Chat] Starting to read stream...");
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("✅ [Chat] Stream complete", { responseLength: aiResponse.length });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // Update AI message in real-time
        setChatMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === "ai") {
            // Replace last AI message (could be loading indicator or partial response)
            return [...prev.slice(0, -1), { role: "ai", content: aiResponse }];
          }
          return [...prev, { role: "ai", content: aiResponse }];
        });
      }

      // Parse updates from AI response if JSON is present
      if (aiResponse.trim()) {
        parseAndApplyUpdates(aiResponse);
      } else {
        console.warn("⚠️ [Chat] Empty response from AI");
      }
      
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
        // Parse function call arguments (new structured format)
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
      if (!workspaceData || !designAssets) return;
      
      const updateType = updates.updateType || 'refinement';
      console.log(`🔄 [Design Studio] Applying ${updateType} updates`, updates);
      
      // Show progress steps for complex updates
      if (updateType === 'market_shift') {
        // Add progress indicator to chat (append to existing messages)
        setChatMessages((prev) => {
          // Check if last message already has progress marker
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.content.includes('__UPDATE_PROGRESS__')) {
            return prev; // Already showing progress
          }
          // Filter out any old progress markers and append new one
          const filtered = prev.filter(m => m.content !== '__UPDATE_PROGRESS__');
          return [...filtered, { role: 'ai', content: '__UPDATE_PROGRESS__' }];
        });
        
        // Use AI-provided steps or generate fallback steps
        let executionSteps;
        
        if (updates.executionSteps && updates.executionSteps.length > 0) {
          // Use AI-provided steps
          executionSteps = updates.executionSteps.map((step: any, idx: number) => ({
            id: `exec_${idx}`,
            label: step.step.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, ''), // Remove emoji for label
            icon: step.step.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '⚡', // Extract emoji or use default
            status: 'complete' as const
          }));
        } else {
          // Fallback: Auto-generate steps based on what changed
          const steps = [];
          
          if (updates.persona?.location || updates.persona?.country) {
            const loc = updates.persona.location || '';
            const country = updates.persona.country || '';
            steps.push({
              id: 'location',
              label: `Updating location to ${loc}${country ? ', ' + country : ''}`,
              icon: '🌍',
              status: 'complete' as const
            });
          }
          
          if (updates.persona?.name || updates.persona?.company) {
            steps.push({
              id: 'persona',
              label: 'Adapting persona to local market',
              icon: '👤',
              status: 'complete' as const
            });
          }
          
          if (updates.valueProp && Object.keys(updates.valueProp).length > 0) {
            steps.push({
              id: 'valueprop',
              label: 'Regenerating value proposition',
              icon: '🎯',
              status: 'complete' as const
            });
          }
          
          if (steps.length === 0) {
            // Generic fallback
            steps.push(
              { id: 'update1', label: 'Analyzing market context', icon: '🔍', status: 'complete' as const },
              { id: 'update2', label: 'Applying changes', icon: '✨', status: 'complete' as const }
            );
          }
          
          executionSteps = steps;
        }
        
        setGenerationSteps(executionSteps);
      }
      
      // Track what changed for comprehensive summary
      const changedFields: string[] = [];
      
      // === PERSONA UPDATES (for market_shift and other workflows) ===
      if (updates.persona) {
        setWorkspaceData((prev: any) => {
          if (!prev) return prev;
          
          const personaUpdates: any = {};
          if (updates.persona.name) {
            personaUpdates.persona_name = updates.persona.name;
            changedFields.push(`persona name to "${updates.persona.name}"`);
          }
          if (updates.persona.company) {
            personaUpdates.persona_company = updates.persona.company;
            changedFields.push(`company to "${updates.persona.company}"`);
          }
          if (updates.persona.location) {
            personaUpdates.location = updates.persona.location;
            changedFields.push(`location to "${updates.persona.location}"`);
          }
          if (updates.persona.country) {
            personaUpdates.country = updates.persona.country;
            changedFields.push(`country to "${updates.persona.country}"`);
          }
          
          return {
            ...prev,
            persona: {
              ...prev.persona,
              ...personaUpdates
            }
          };
        });
      }
      
      // Backwards compatibility: handle legacy flat location/country fields
      if (updates.location || updates.country) {
        setWorkspaceData((prev: any) => {
          if (!prev) return prev;
          const legacyUpdates: any = {};
          if (updates.location) {
            legacyUpdates.location = updates.location;
            changedFields.push(`location to "${updates.location}"`);
          }
          if (updates.country) {
            legacyUpdates.country = updates.country;
            changedFields.push(`country to "${updates.country}"`);
          }
          return {
            ...prev,
            persona: {
              ...prev.persona,
              ...legacyUpdates
            }
          };
        });
      }
      
      // === VALUE PROP UPDATES ===
      if (updates.valueProp) {
        const vp = updates.valueProp;
        setUiValueProp((prev: any) => {
          if (!prev) return prev;
          
          const vpUpdates: any = {};
          if (vp.headline) { vpUpdates.headline = vp.headline; changedFields.push('headline'); }
          if (vp.subheadline) { vpUpdates.subheadline = vp.subheadline; changedFields.push('subheadline'); }
          if (vp.problem) { vpUpdates.problem = vp.problem; changedFields.push('problem'); }
          if (vp.solution) { vpUpdates.solution = vp.solution; changedFields.push('solution'); }
          if (vp.outcome) { vpUpdates.outcome = vp.outcome; changedFields.push('outcome'); }
          if (vp.targetAudience) { vpUpdates.targetAudience = vp.targetAudience; changedFields.push('target audience'); }
          if (vp.benefits && Array.isArray(vp.benefits)) { vpUpdates.benefits = vp.benefits; changedFields.push('benefits'); }
          
          return { ...prev, ...vpUpdates };
        });
      }
      
      // Backwards compatibility: handle legacy flat value prop fields
      if (updates.targetAudience || updates.problem || updates.solution || updates.outcome || updates.benefits || updates.headline) {
        setUiValueProp((prev: any) => {
          if (!prev) return prev;
          
          const legacyVpUpdates: any = {};
          if (updates.headline) { legacyVpUpdates.headline = updates.headline; changedFields.push('headline'); }
          if (updates.subheadline) { legacyVpUpdates.subheadline = updates.subheadline; changedFields.push('subheadline'); }
          if (updates.problem) { legacyVpUpdates.problem = updates.problem; changedFields.push('problem'); }
          if (updates.solution) { legacyVpUpdates.solution = updates.solution; changedFields.push('solution'); }
          if (updates.outcome) { legacyVpUpdates.outcome = updates.outcome; changedFields.push('outcome'); }
          if (updates.targetAudience) { legacyVpUpdates.targetAudience = updates.targetAudience; changedFields.push('target audience'); }
          if (updates.benefits && Array.isArray(updates.benefits)) { legacyVpUpdates.benefits = updates.benefits; changedFields.push('benefits'); }
          
          return { ...prev, ...legacyVpUpdates };
        });
      }
      
      // === BRAND UPDATES ===
      if (updates.brandUpdates) {
        setDesignAssets((prev: any) => {
          if (!prev || !prev.brand_guide) return prev;
          const updated = { ...prev };

          if (updates.brandUpdates.colors && Array.isArray(updates.brandUpdates.colors)) {
            updates.brandUpdates.colors.forEach((hex: string, idx: number) => {
              if (updated.brand_guide.colors.primary[idx]) {
                updated.brand_guide.colors.primary[idx].hex = hex;
              }
            });
            changedFields.push('colors');
          }

          if (updates.brandUpdates.fonts) {
            if (updates.brandUpdates.fonts.heading) {
              const headingFont = updated.brand_guide.typography.find((t: any) => t.category === "heading");
              if (headingFont) headingFont.fontFamily = updates.brandUpdates.fonts.heading;
              changedFields.push('heading font');
            }
            if (updates.brandUpdates.fonts.body) {
              const bodyFont = updated.brand_guide.typography.find((t: any) => t.category === "body");
              if (bodyFont) bodyFont.fontFamily = updates.brandUpdates.fonts.body;
              changedFields.push('body font');
            }
          }

          return updated;
        });
      }
      
      // Backwards compatibility: handle legacy flat colors/fonts
      setDesignAssets((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev };
        let hasChanges = false;

        if (updates.colors && Array.isArray(updates.colors) && updated.brand_guide) {
          updates.colors.forEach((hex: string, idx: number) => {
            if (updated.brand_guide.colors.primary[idx]) {
              updated.brand_guide.colors.primary[idx].hex = hex;
            }
          });
          changedFields.push('colors');
          hasChanges = true;
        }

        if (updates.fonts && updated.brand_guide) {
          if (updates.fonts.heading) {
            const headingFont = updated.brand_guide.typography.find((t: any) => t.category === "heading");
            if (headingFont) headingFont.fontFamily = updates.fonts.heading;
            changedFields.push('heading font');
            hasChanges = true;
          }
          if (updates.fonts.body) {
            const bodyFont = updated.brand_guide.typography.find((t: any) => t.category === "body");
            if (bodyFont) bodyFont.fontFamily = updates.fonts.body;
            changedFields.push('body font');
            hasChanges = true;
          }
        }

        if (updates.headline && updated.landing_page) {
          updated.landing_page.hero.headline = updates.headline;
          hasChanges = true;
        }

        if (updates.subheadline && updated.landing_page) {
          updated.landing_page.hero.subheadline = updates.subheadline;
          hasChanges = true;
        }

        return hasChanges ? updated : prev;
      });
      
      // === SHOW COMPREHENSIVE UPDATE TOAST & SUMMARY ===
      if (changedFields.length > 0) {
        const uniqueFields = [...new Set(changedFields)];
        
        // Show toast notification
        if (updateType === 'market_shift') {
          addToast(`🌍 Market shift complete! Updated: ${uniqueFields.slice(0, 3).join(', ')}${uniqueFields.length > 3 ? '...' : ''}`, "success");
        } else if (uniqueFields.length > 3) {
          addToast(`✨ ${uniqueFields.length} elements updated successfully!`, "success");
        } else {
          addToast(`✓ Updated: ${uniqueFields.join(', ')}`, "success");
        }
        
        // Add summary message to chat for complex updates
        if (updateType === 'market_shift' && uniqueFields.length >= 3) {
          setTimeout(() => {
            setChatMessages((prev) => {
              // Check if we already added a summary
              const lastMsg = prev[prev.length - 1];
              if (lastMsg?.content.includes('✅ Updated:')) {
                return prev; // Summary already added
              }
              
              // Build comprehensive summary
              const summaryParts = [];
              if (updates.persona) {
                if (updates.persona.location || updates.persona.country) {
                  summaryParts.push(`✅ **Location**: ${updates.persona.location || ''}${updates.persona.country ? ', ' + updates.persona.country : ''}`);
                }
                if (updates.persona.name) {
                  summaryParts.push(`✅ **Persona**: ${updates.persona.name}${updates.persona.company ? ' at ' + updates.persona.company : ''}`);
                }
              }
              if (updates.valueProp && Object.keys(updates.valueProp).length > 0) {
                summaryParts.push(`✅ **Value Proposition**: Regenerated for new market`);
              }
              
              const summaryMessage = `\n\n**🎉 Update Complete!**\n\n${summaryParts.join('\n')}\n\n${updates.reasoning || 'Changes applied successfully.'}`;
              
              return [...prev, { role: 'ai', content: summaryMessage }];
            });
            
            // Clear progress steps after showing summary
            setTimeout(() => {
              setGenerationSteps([]);
            }, 500);
          }, 300);
        }
        
        // Switch to appropriate tab based on update type
        if (updateType === 'market_shift' || updates.valueProp || updates.targetAudience) {
          setTimeout(() => setActiveTab("value-prop"), 800);
        } else if (updateType === 'styling' || updates.brandUpdates) {
          setTimeout(() => setActiveTab("brand"), 500);
        }
      }
      
      console.log(`✅ [Design Studio] Applied updates:`, changedFields);
    } catch (error) {
      // Silently fail - not all responses will have JSON
      console.log("No structured updates found in response", error);
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
              generationSteps={generationSteps}
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

