import { useState, useCallback, useEffect } from "react";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { PositioningDesignAssets } from "@/lib/types/design-assets";
import type { UiValueProp } from "./use-workspace-data";

export function useManifest(
    flowId: string,
    designAssets: PositioningDesignAssets | null,
    setUiValueProp: (vp: UiValueProp) => void
) {
    const [manifest, setManifest] = useState<BrandManifest | null>(null);

    const loadManifest = useCallback(async (skipIfNoAssets = false) => {
        try {
            // Skip if tab is not visible to save resources
            if (typeof document !== 'undefined' && document.hidden) return;

            // Skip if design assets don't exist yet (prevents failed migration attempts)
            if (skipIfNoAssets && !designAssets?.generation_state?.brand) {
                console.log('⏭️ [Manifest] Skipping - design assets not generated yet');
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

                            // Keep UI value prop in sync with manifest
                            setUiValueProp({
                                headline: loadedManifest.strategy?.valueProp?.headline || '',
                                subheadline: loadedManifest.strategy?.valueProp?.subheadline || '',
                                problem: loadedManifest.strategy?.valueProp?.problem || '',
                                solution: loadedManifest.strategy?.valueProp?.solution || '',
                                outcome: loadedManifest.strategy?.valueProp?.outcome || '',
                                benefits: loadedManifest.strategy?.valueProp?.benefits || [],
                                targetAudience: loadedManifest.strategy?.valueProp?.targetAudience || ''
                            });
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
        }
    }, [flowId, designAssets, setUiValueProp]);

    // Initial load & when deps change (e.g. designAssets loaded)
    useEffect(() => {
        loadManifest(true);
    }, [loadManifest]);

    // Poll for manifest updates (every 30s)
    useEffect(() => {
        const interval = setInterval(() => loadManifest(false), 30000);
        return () => clearInterval(interval);
    }, [loadManifest]);

    return {
        manifest,
        setManifest,
        reload: () => loadManifest(false)
    };
}
