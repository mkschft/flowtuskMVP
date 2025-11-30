import { useState, useCallback, useEffect, useRef } from "react";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { PositioningDesignAssets } from "@/lib/types/design-assets";
import type { UiValueProp } from "./use-workspace-data";

export function useManifest(
    flowId: string,
    designAssets: PositioningDesignAssets | null,
    setUiValueProp: (vp: UiValueProp) => void
) {
    const [manifest, setManifest] = useState<BrandManifest | null>(null);
    const pollingStoppedRef = useRef(false);
    const hasLoadedRef = useRef(false);
    const isLoadingRef = useRef(false);

    const loadManifest = useCallback(async (skipIfNoAssets = false) => {
        // Prevent duplicate concurrent loads
        if (isLoadingRef.current) {
            console.log('⏭️ [Manifest] Already loading, skipping duplicate request');
            return;
        }

        try {
            isLoadingRef.current = true;

            // Skip if tab is not visible to save resources
            if (typeof document !== 'undefined' && document.hidden) {
                isLoadingRef.current = false;
                return;
            }

            // Skip if design assets don't exist yet (prevents failed migration attempts)
            if (skipIfNoAssets && !designAssets?.generation_state?.brand) {
                console.log('⏭️ [Manifest] Skipping - design assets not generated yet');
                isLoadingRef.current = false;
                return;
            }

            const url = `/api/brand-manifest?flowId=${flowId}`;

            const res = await fetch(url);

            if (res.ok) {
                const { manifest: loadedManifest } = await res.json();
                if (loadedManifest) {
                    // Update when lastUpdated changes (version is static at 1.0)
                    setManifest(prev => {
                        if (!prev || prev.lastUpdated !== loadedManifest.lastUpdated) {
                            console.log('✅ [Manifest] Updated @', loadedManifest.lastUpdated);

                            // Keep UI value prop in sync with manifest (only if it actually changed)
                            const newVp = {
                                headline: loadedManifest.strategy?.valueProp?.headline || '',
                                subheadline: loadedManifest.strategy?.valueProp?.subheadline || '',
                                problem: loadedManifest.strategy?.valueProp?.problem || '',
                                solution: loadedManifest.strategy?.valueProp?.solution || '',
                                outcome: loadedManifest.strategy?.valueProp?.outcome || '',
                                benefits: loadedManifest.strategy?.valueProp?.benefits || [],
                                targetAudience: loadedManifest.strategy?.valueProp?.targetAudience || ''
                            };
                            
                            // Only update if manifest actually has value prop data (prevents overwriting with empty)
                            if (newVp.headline || newVp.problem || newVp.solution) {
                                setUiValueProp(newVp);
                            }
                            
                            return loadedManifest;
                        }
                        return prev;
                    });
                }
            } else if (res.status === 404) {
                console.log('ℹ️ [Manifest] Not found (will be created after brand generation)');
            }
        } catch (err) {
            console.error("❌ [Manifest] Error loading manifest:", err);
        } finally {
            isLoadingRef.current = false;
        }
    }, [flowId, setUiValueProp]); // Removed designAssets from deps to prevent re-triggers

    // Initial load only once (not when designAssets changes)
    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadManifest(true);
        }
    }, [flowId]); // Only depend on flowId, not loadManifest callback

    // Separate effect to check if we should load manifest when designAssets becomes available
    useEffect(() => {
        // If manifest hasn't loaded yet and designAssets is now available, try loading
        if (!manifest && designAssets?.generation_state?.brand && !isLoadingRef.current) {
            console.log('🔄 [Manifest] DesignAssets available, loading manifest...');
            loadManifest(false);
        }
    }, [designAssets?.generation_state?.brand, manifest, loadManifest]);

    // Poll for manifest updates ONLY when generation is in progress
    // Stop polling once all components are generated
    useEffect(() => {
        // If we've already stopped polling, don't restart it
        if (pollingStoppedRef.current) {
            return;
        }

        const generationState = designAssets?.generation_state || { brand: false, style: false, landing: false };
        
        // Check if brand guide actually has data (not just the flag)
        const hasBrandData = manifest && (
            (manifest.identity?.tone?.keywords?.length ?? 0) > 0 ||
            (manifest.identity?.logo?.variations?.length ?? 0) > 0 ||
            (manifest.identity?.colors?.accent?.length ?? 0) > 0
        );
        
        // Only poll if generation is still in progress
        const allComplete = generationState.brand && hasBrandData && generationState.style && generationState.landing;
        
        if (allComplete) {
            console.log('✅ [Manifest] All generation complete - stopping polling permanently');
            pollingStoppedRef.current = true;
            return;
        }
        
        // Don't start polling if manifest hasn't loaded yet
        if (!manifest) {
            return;
        }
        
        // Poll every 30s only when generation is in progress
        const interval = setInterval(() => {
            // Prevent polling if already loading
            if (isLoadingRef.current) {
                return;
            }

            // Double-check before polling - if complete, stop immediately
            const currentState = designAssets?.generation_state || { brand: false, style: false, landing: false };
            const currentHasBrandData = manifest && (
                (manifest.identity?.tone?.keywords?.length ?? 0) > 0 ||
                (manifest.identity?.logo?.variations?.length ?? 0) > 0 ||
                (manifest.identity?.colors?.accent?.length ?? 0) > 0
            );
            const currentAllComplete = currentState.brand && currentHasBrandData && currentState.style && currentState.landing;
            
            if (currentAllComplete) {
                console.log('✅ [Manifest] Generation completed during polling - stopping now');
                pollingStoppedRef.current = true;
                clearInterval(interval);
                return;
            }
            
            loadManifest(false);
        }, 30000);
        
        return () => clearInterval(interval);
    }, [designAssets?.generation_state, manifest, loadManifest]); // More specific deps

    return {
        manifest,
        setManifest,
        reload: () => loadManifest(false)
    };
}
