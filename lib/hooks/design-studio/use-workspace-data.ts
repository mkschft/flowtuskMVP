import { useState, useCallback, useEffect } from "react";
import type {
    PositioningDesignAssets,
    CopilotWorkspaceData,
} from "@/lib/types/design-assets";

// UI-friendly value prop structure (single source of truth)
export type UiValueProp = {
    headline: string;
    subheadline: string;
    problem: string;
    solution: string;
    outcome: string;
    benefits: string[];
    targetAudience: string;
};

export function useWorkspaceData(icpId: string, flowId: string) {
    const [workspaceData, setWorkspaceData] = useState<CopilotWorkspaceData | null>(null);
    const [designAssets, setDesignAssets] = useState<PositioningDesignAssets | null>(null);
    const [uiValueProp, setUiValueProp] = useState<UiValueProp | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadWorkspaceData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('📦 [Design Studio] Loading workspace data...', { icpId, flowId });

            // Unified workspace fetch (single request)
            const wsRes = await fetch(`/api/workspace?icpId=${icpId}&flowId=${flowId}`);

            if (wsRes.ok) {
                const { icp, valueProp, designAssets: assets } = await wsRes.json();

                console.log('✅ [Design Studio] Workspace data loaded:', {
                    hasIcp: !!icp,
                    icpTitle: icp?.title,
                    hasValueProp: !!valueProp,
                    valuePropHeadline: valueProp?.headline,
                    valuePropProblem: valueProp?.problem,
                    hasDesignAssets: !!assets
                });

                if (!icp) throw new Error("Persona not found");

                setWorkspaceData({ persona: icp, valueProp: valueProp || null, designAssets: assets || null });
                setDesignAssets(assets || null);

                // Check if value prop needs generation
                const needsValueProp = !valueProp || (!valueProp.headline && !valueProp.problem && !valueProp.summary);

                if (needsValueProp) {
                    console.warn('⚠️ [Value Prop] Missing value prop data, triggering generation...');
                    console.log('📊 [Value Prop] ICP details:', {
                        id: icp.id,
                        title: icp.title,
                        painPoints: icp.pain_points?.length || 0,
                        goals: icp.goals?.length || 0
                    });

                    // Trigger value prop generation in background
                    // Note: This requires authentication, so it will only work for logged-in users
                    // The generation will happen server-side and update the database
                    try {
                        console.log('🚀 [Value Prop] Starting generation...');
                        // For now, just log - actual generation would need to be triggered
                        // through the app flow or a dedicated endpoint
                        console.warn('⚠️ [Value Prop] Auto-generation not yet implemented - please use chat to trigger');
                    } catch (genError) {
                        console.error('❌ [Value Prop] Generation failed:', genError);
                    }
                }

                // Initialize UI value prop from server data (pre-manifest)
                const initialVp: UiValueProp = {
                    headline: valueProp?.headline || valueProp?.summary?.mainInsight || "",
                    subheadline: valueProp?.subheadline || valueProp?.summary?.approachStrategy || "",
                    problem: valueProp?.problem || (Array.isArray(valueProp?.summary?.painPointsAddressed) ? valueProp.summary.painPointsAddressed.join(', ') : '') || (Array.isArray(icp?.pain_points) ? icp.pain_points.join(', ') : '') || "",
                    solution: valueProp?.solution || valueProp?.summary?.approachStrategy || "",
                    outcome: valueProp?.outcome || valueProp?.summary?.expectedImpact || "",
                    benefits: Array.isArray(valueProp?.variations) ? valueProp.variations.map((v: any) => v.text) : [],
                    targetAudience: valueProp?.targetAudience || icp?.title || "",
                };

                console.log('💾 [Value Prop] UI state initialized:', {
                    headline: initialVp.headline || '(empty)',
                    problem: initialVp.problem || '(empty)',
                    solution: initialVp.solution || '(empty)',
                    outcome: initialVp.outcome || '(empty)',
                    benefitsCount: initialVp.benefits.length,
                    targetAudience: initialVp.targetAudience || '(empty)'
                });

                setUiValueProp(initialVp);
                setLoading(false);
                return;
            }

            // If workspace API fails, there's no data to load
            throw new Error("Failed to load workspace data");
        } catch (err) {
            console.error("❌ [Design Studio] Error loading data:", err);
            setError(err instanceof Error ? err.message : "Failed to load data");
            setLoading(false);
        }
    }, [icpId, flowId]);

    // Load data on mount
    useEffect(() => {
        loadWorkspaceData();
    }, [loadWorkspaceData]);

    return {
        workspaceData,
        designAssets,
        uiValueProp,
        setWorkspaceData,
        setDesignAssets,
        setUiValueProp,
        loading,
        error,
        reload: loadWorkspaceData
    };
}

