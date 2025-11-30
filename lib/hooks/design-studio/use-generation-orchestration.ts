import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/design-studio-mock-data";
import type { CopilotWorkspaceData, PositioningDesignAssets } from "@/lib/types/design-assets";
import type { BrandManifest } from "@/lib/types/brand-manifest";

export function useGenerationOrchestration(
    icpId: string,
    flowId: string,
    workspaceData: CopilotWorkspaceData | null,
    designAssets: PositioningDesignAssets | null,
    manifest: BrandManifest | null,
    generationSteps: Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>,
    setGenerationSteps: React.Dispatch<React.SetStateAction<Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>>>,
    loadWorkspaceData: () => Promise<void>,
    loadManifest: (skip?: boolean) => Promise<void>,
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
    // Generation states
    const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
    const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);
    const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
    const [isGeneratingLanding, setIsGeneratingLanding] = useState(false);

    // Track if generation has been triggered to prevent infinite loops
    const generationTriggeredRef = useRef(false);

    const generateStyleGuide = useCallback(async () => {
        console.log('🎨 [Design Studio] Starting style guide generation...');
        setIsGeneratingStyle(true);

        // Update step to loading
        setGenerationSteps(prev => prev.map(s =>
            s.id === 'style' ? { ...s, status: 'loading' as const } : s
        ));

        try {
            const styleRes = await fetch('/api/brand-manifest/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ icpId, flowId, section: 'style' })
            });

            if (styleRes.ok) {
                // Load manifest to get updated data (no need to reload workspace - manifest update handles it)
                await loadManifest(false);
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
    }, [icpId, flowId, loadManifest]);

    const generateStrategyContent = useCallback(async () => {
        console.log('🎨 [Design Studio] Starting strategy content generation...');
        setIsGeneratingStrategy(true);

        // Update step to loading
        setGenerationSteps(prev => prev.map(s =>
            s.id === 'strategy' ? { ...s, status: 'loading' as const } : s
        ));

        try {
            const strategyRes = await fetch('/api/brand-manifest/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ icpId, flowId, section: 'strategy' })
            });

            if (strategyRes.ok) {
                // Load manifest to get updated data
                await loadManifest(false);
                console.log('✅ [Design Studio] Strategy content generated');

                // Update step to complete
                setGenerationSteps(prev => prev.map(s =>
                    s.id === 'strategy' ? { ...s, status: 'complete' as const } : s
                ));
            } else {
                console.error('❌ [Design Studio] Strategy content generation failed');
            }
        } catch (err) {
            console.error('❌ [Design Studio] Strategy content generation error:', err);
        } finally {
            setIsGeneratingStrategy(false);
        }
    }, [icpId, flowId, loadManifest]);

    const generateLandingPage = useCallback(async () => {
        console.log('🎨 [Design Studio] Starting landing page generation...');
        setIsGeneratingLanding(true);

        // Update step to loading
        setGenerationSteps(prev => prev.map(s =>
            s.id === 'landing' ? { ...s, status: 'loading' as const } : s
        ));

        try {
            const landingRes = await fetch('/api/brand-manifest/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ icpId, flowId, section: 'landing' })
            });

            if (landingRes.ok) {
                // Load manifest to get updated data (no need to reload workspace - manifest update handles it)
                await loadManifest(false);
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
    }, [icpId, flowId, loadManifest]);

    // Background generation orchestration
    const triggerBackgroundGeneration = useCallback(async () => {
        if (!workspaceData) return;

        const hasDesignAssets = designAssets !== null;
        const generationState = designAssets?.generation_state || { brand: false, style: false, strategy: false, landing: false };

        // 🔍 Check if brand guide actually has data (not just the flag)
        const hasBrandData = (manifest?.identity?.tone?.keywords?.length ?? 0) > 0 ||
            (manifest?.identity?.logo?.variations?.length ?? 0) > 0 ||
            (manifest?.identity?.colors?.accent?.length ?? 0) > 0;

        // 🔍 Check if strategy content has data
        const hasStrategyData = (manifest?.strategy?.competitivePositioning?.competitors?.length ?? 0) > 0 ||
            (manifest?.strategy?.messagingVariations?.length ?? 0) > 0;

        const needsBrandGeneration = !generationState.brand || (!!manifest && !hasBrandData);
        const needsStrategyGeneration = !generationState.strategy || (!!manifest && !hasStrategyData);

        // Initialize generation steps based on current state
        // Labels match tab names: Strategy, Identity, Components, Previews
        const steps = [
            {
                id: 'brand',
                label: 'Identity',
                icon: '🎨',
                status: (generationState.brand && hasBrandData) ? 'complete' as const : 'pending' as const
            },
            {
                id: 'style',
                label: 'Components',
                icon: '✨',
                status: generationState.style ? 'complete' as const : 'pending' as const
            },
            {
                id: 'strategy',
                label: 'Strategy',
                icon: '📊',
                status: (generationState.strategy && hasStrategyData) ? 'complete' as const : 'pending' as const
            },
            {
                id: 'landing',
                label: 'Previews',
                icon: '🚀',
                status: generationState.landing ? 'complete' as const : 'pending' as const
            }
        ];

        setGenerationSteps(steps);

        const needsGeneration = needsBrandGeneration || !generationState.style || needsStrategyGeneration || !generationState.landing;

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

        // If all assets already generated with actual data, nothing to do
        if (generationState.brand && hasBrandData && generationState.style && generationState.strategy && hasStrategyData && generationState.landing) {
            console.log('✅ [Design Studio] All design assets already generated with data');
            return;
        }

        // Step 1: Generate Brand Guide (if not exists OR if data is missing)
        if (needsBrandGeneration) {
            console.log('🎨 [Design Studio] Starting brand guide generation...',
                generationState.brand ? '(re-generating due to missing data)' : '(first generation)');
            setIsGeneratingBrand(true);

            // Update step to loading
            setGenerationSteps(prev => prev.map(s =>
                s.id === 'brand' ? { ...s, status: 'loading' as const } : s
            ));

            try {
                const brandRes = await fetch('/api/brand-manifest/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ icpId, flowId, section: 'brand' })
                });

                if (brandRes.ok) {
                    console.log('✅ [Design Studio] Brand guide generated');

                    // Update step to complete
                    setGenerationSteps(prev => prev.map(s =>
                        s.id === 'brand' ? { ...s, status: 'complete' as const } : s
                    ));

                    // Load manifest now that brand guide exists (this will update designAssets via applyManifestUpdate)
                    console.log('🔄 [Design Studio] Loading brand manifest after generation...');
                    await loadManifest(false);

                    // Step 2: Generate Style Guide (sequential)
                    await generateStyleGuide();

                    // Step 3: Generate Strategy Content (sequential) - NEW!
                    await generateStrategyContent();

                    // Step 4: Generate Landing Page (sequential)
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
            // Brand already exists, generate remaining steps sequentially
            if (!generationState.style) {
                await generateStyleGuide();
            }
            if (needsStrategyGeneration) {
                await generateStrategyContent();
            }
            if (!generationState.landing) {
                await generateLandingPage();
            }
        }
    }, [workspaceData, designAssets, manifest, icpId, flowId, loadManifest, setChatMessages, generateStyleGuide, generateStrategyContent, generateLandingPage]);

    // Trigger background generation after workspace data loads (only once)
    useEffect(() => {
        if (!workspaceData) return;

        // If brand is supposedly generated, wait for manifest to be loaded too
        const brandGenerated = designAssets?.generation_state?.brand;
        if (brandGenerated && !manifest) {
            return;
        }

        if (!generationTriggeredRef.current) {
            generationTriggeredRef.current = true;
            triggerBackgroundGeneration();
        }
    }, [workspaceData, designAssets, manifest, triggerBackgroundGeneration]);

    return {
        isGeneratingBrand,
        isGeneratingStyle,
        isGeneratingStrategy,
        isGeneratingLanding,
        triggerBackgroundGeneration
    };
}
