/**
 * Copilot Store
 * Manages Design Studio state, active tab, design assets for /copilot
 */

import { create } from 'zustand';
import type { 
  CopilotTab, 
  CopilotChatMessage,
} from './types';
import type { 
  CopilotWorkspaceData, 
  PositioningDesignAssets 
} from '@/lib/types/design-assets';

interface CopilotState {
  // State
  activeTab: CopilotTab;
  icpId: string | null;
  flowId: string | null;
  loading: boolean;
  error: string | null;

  // Data
  workspaceData: CopilotWorkspaceData | null;
  designAssets: PositioningDesignAssets | null;

  // Chat
  chatMessages: CopilotChatMessage[];
  isStreaming: boolean;
  isChatVisible: boolean;

  // Generation state
  regenerationCount: number;

  // Actions
  setActiveTab: (tab: CopilotTab) => void;
  setIcpId: (id: string) => void;
  setFlowId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setWorkspaceData: (data: CopilotWorkspaceData | null) => void;
  setDesignAssets: (assets: PositioningDesignAssets | null) => void;

  // Chat actions
  addChatMessage: (message: CopilotChatMessage) => void;
  setChatMessages: (messages: CopilotChatMessage[]) => void;
  setStreaming: (streaming: boolean) => void;
  setChatVisible: (visible: boolean) => void;

  // Generation
  incrementRegenerationCount: () => void;
  resetRegenerationCount: () => void;

  // Load data
  loadWorkspaceData: (icpId: string, flowId: string) => Promise<void>;

  // Helpers
  reset: () => void;
}

const MAX_REGENERATIONS = 4;

export const useCopilotStore = create<CopilotState>((set, get) => ({
  // Initial State
  activeTab: 'value-prop',
  icpId: null,
  flowId: null,
  loading: true,
  error: null,

  workspaceData: null,
  designAssets: null,

  chatMessages: [
    {
      role: "ai",
      content: "Welcome to the Design Studio! I can help you customize your brand, style guide, and landing page design.",
    },
  ],
  isStreaming: false,
  isChatVisible: true,

  regenerationCount: 0,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  setIcpId: (id) => set({ icpId: id }),

  setFlowId: (id) => set({ flowId: id }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setWorkspaceData: (data) => set({ workspaceData: data }),

  setDesignAssets: (assets) => set({ designAssets: assets }),

  // Chat actions
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),

  setChatMessages: (messages) => set({ chatMessages: messages }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setChatVisible: (visible) => set({ isChatVisible: visible }),

  // Generation
  incrementRegenerationCount: () => set((state) => ({
    regenerationCount: Math.min(state.regenerationCount + 1, MAX_REGENERATIONS)
  })),

  resetRegenerationCount: () => set({ regenerationCount: 0 }),

  // Load data
  loadWorkspaceData: async (icpId: string, flowId: string) => {
    set({ loading: true, error: null, icpId, flowId });

    try {
      // Fetch ICP data
      const icpResponse = await fetch(`/api/positioning-icps?id=${icpId}&flowId=${flowId}`);
      if (!icpResponse.ok) {
        throw new Error("Failed to load persona data");
      }
      const { icp } = await icpResponse.json();

      if (!icp) {
        throw new Error("Persona not found");
      }

      // Fetch value prop
      const valuePropResponse = await fetch(`/api/value-props?icpId=${icpId}&flowId=${flowId}`);
      const { valueProp } = await valuePropResponse.json();

      // Fetch design assets
      const designAssetsResponse = await fetch(`/api/design-assets?icpId=${icpId}&flowId=${flowId}`);
      const { designAssets: assets } = await designAssetsResponse.json();

      set({
        workspaceData: {
          persona: icp,
          valueProp: valueProp || null,
          designAssets: assets || null,
        },
        designAssets: assets || null,
        loading: false,
      });

      console.log('✅ [CopilotStore] Loaded workspace data');
    } catch (err) {
      console.error("❌ [CopilotStore] Error loading data:", err);
      set({
        error: err instanceof Error ? err.message : "Failed to load data",
        loading: false,
      });
    }
  },

  // Helpers
  reset: () => set({
    activeTab: 'value-prop',
    icpId: null,
    flowId: null,
    loading: true,
    error: null,
    workspaceData: null,
    designAssets: null,
    chatMessages: [
      {
        role: "ai",
        content: "Welcome to the Design Studio! I can help you customize your brand, style guide, and landing page design.",
      },
    ],
    isStreaming: false,
    isChatVisible: true,
    regenerationCount: 0,
  }),
}));
