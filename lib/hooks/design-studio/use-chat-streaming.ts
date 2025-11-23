import { useState, useCallback } from "react";
import type { ChatMessage, DesignProject } from "@/lib/design-studio-mock-data";
import type { CopilotWorkspaceData, PositioningDesignAssets } from "@/lib/types/design-assets";
import React from "react"; // Added for React.Dispatch type

type ToastType = "success" | "info" | "download" | "link";

const MAX_REGENERATIONS = 4;

export function useChatStreaming(
    flowId: string,
    icpId: string,
    workspaceData: CopilotWorkspaceData | null,
    designAssets: PositioningDesignAssets | null,
    currentProject: DesignProject | null,
    chatMessages: ChatMessage[],
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    onUpdate: (response: string) => void,
    onToast: (message: string, type: ToastType) => void
) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [regenerationCount, setRegenerationCount] = useState(0);
    const [isChatVisible, setIsChatVisible] = useState(true);

    const handleSendMessage = useCallback(async (message: string) => {
        if (regenerationCount >= MAX_REGENERATIONS) {
            onToast("Regeneration limit reached. Refresh to start a new conversation.", "info");
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
                    flowId,
                    icpId,
                    context: workspaceData?.persona ? {
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
                    onToast("Regeneration limit reached!", "info");
                } else {
                    onToast("Failed to get response. Please try again.", "info");
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
                onToast("Failed to read response. Please try again.", "info");
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
                onUpdate(aiResponse);
            } else {
                console.warn("⚠️ [Chat] Empty response from AI");
            }

            setRegenerationCount(prev => prev + 1);
        } catch (error) {
            console.error("Chat error:", error);
            onToast("Something went wrong. Please try again.", "info");
        } finally {
            setIsStreaming(false);
        }
    }, [chatMessages, currentProject, regenerationCount, flowId, icpId, workspaceData, designAssets, onToast, onUpdate]);

    return {
        isStreaming,
        regenerationCount,
        isChatVisible,
        setIsChatVisible,
        handleSendMessage
    };
}
