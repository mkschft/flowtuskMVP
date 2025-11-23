import { useCallback } from "react";
import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { CopilotWorkspaceData, PositioningDesignAssets } from "@/lib/types/design-assets";
import type { UiValueProp } from "./use-workspace-data";
import type { ChatMessage } from "@/lib/design-studio-mock-data";
import {
    parseUpdateResponse,
    applyManifestUpdate,
    applyLegacyUpdate,
    type UpdateContext,
    type ToastType
} from "@/lib/utils/manifest-updates";

export function useManifestUpdates(
    workspaceData: CopilotWorkspaceData | null,
    designAssets: PositioningDesignAssets | null,
    setWorkspaceData: React.Dispatch<React.SetStateAction<CopilotWorkspaceData | null>>,
    setDesignAssets: React.Dispatch<React.SetStateAction<PositioningDesignAssets | null>>,
    setUiValueProp: React.Dispatch<React.SetStateAction<UiValueProp | null>>,
    setManifest: React.Dispatch<React.SetStateAction<BrandManifest | null>>,
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setGenerationSteps: React.Dispatch<React.SetStateAction<Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>>>,
    setActiveTab: (tab: "value-prop" | "brand" | "style" | "landing") => void,
    addToast: (message: string, type: ToastType) => void,
    addToHistory: (manifest: BrandManifest, type: string, description: string) => void,
    loadWorkspaceData: () => Promise<void>
) {
    const parseAndApplyUpdates = useCallback((response: string) => {
        const parsed = parseUpdateResponse(response);
        if (!parsed) return;

        const context: UpdateContext = {
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
            loadWorkspaceData
        };

        if (parsed.type === 'manifest') {
            applyManifestUpdate(parsed.data, context);
        } else {
            applyLegacyUpdate(parsed.data, context);
        }
    }, [
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
        loadWorkspaceData
    ]);

    return { parseAndApplyUpdates };
}
