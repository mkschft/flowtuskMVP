/**
 * Copilot Store
 * Manages Design Studio state, active tab, design assets for /copilot
 */

import { create } from 'zustand';
import type { CopilotTab } from './types';
import type { ChatMessage } from '@/lib/design-studio-mock-data';
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
  chatMessages: ChatMessage[];
  isStreaming: boolean;
  isChatVisible: boolean;

  // Generation state
  regenerationCount: number;
  generationSteps: Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>;

  // UI state
  shareModalOpen: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'info' | 'download' | 'link'; onClose: (id: string) => void }>;

  // Actions
  setActiveTab: (tab: CopilotTab) => void;
  setIcpId: (id: string) => void;
  setFlowId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setWorkspaceData: (data: CopilotWorkspaceData | null) => void;
  setDesignAssets: (assets: PositioningDesignAssets | null) => void;

  // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setStreaming: (streaming: boolean) => void;
  setChatVisible: (visible: boolean) => void;

  // Generation actions
  incrementRegenerationCount: () => void;
  resetRegenerationCount: () => void;
  setGenerationSteps: (steps: Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }> | ((prev: Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>) => Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>)) => void;
  updateGenerationStep: (id: string, status: 'pending' | 'loading' | 'complete') => void;

  // UI actions
  setShareModalOpen: (open: boolean) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'download' | 'link') => void;
  removeToast: (id: string) => void;

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

  chatMessages: [],  // Start empty - will be initialized by use-generation-orchestration
  isStreaming: false,
  isChatVisible: true,

  regenerationCount: 0,
  generationSteps: [],

  shareModalOpen: false,
  toasts: [],

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

  setChatMessages: (messages) => set((state) => ({
    chatMessages: typeof messages === 'function' ? messages(state.chatMessages) : messages
  })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setChatVisible: (visible) => set({ isChatVisible: visible }),

  // Generation
  incrementRegenerationCount: () => set((state) => ({
    regenerationCount: Math.min(state.regenerationCount + 1, MAX_REGENERATIONS)
  })),

  resetRegenerationCount: () => set({ regenerationCount: 0 }),

  setGenerationSteps: (steps) => set((state) => ({
    generationSteps: typeof steps === 'function' ? steps(state.generationSteps) : steps
  })),

  updateGenerationStep: (id, status) => set((state) => ({
    generationSteps: state.generationSteps.map(step =>
      step.id === id ? { ...step, status } : step
    )
  })),

  // UI actions
  setShareModalOpen: (open) => set({ shareModalOpen: open }),

  addToast: (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { 
        id, 
        message, 
        type, 
        onClose: get().removeToast 
      }]
    }));
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(toast => toast.id !== id)
  })),

  // Load data from brand_manifests via /api/workspace
  loadWorkspaceData: async (icpId: string, flowId: string) => {
    set({ loading: true, error: null, icpId, flowId });

    try {
      // Unified workspace fetch from brand_manifests
      const wsResponse = await fetch(`/api/workspace?icpId=${icpId}&flowId=${flowId}`);
      if (!wsResponse.ok) {
        throw new Error("Failed to load workspace data");
      }
      const { icp, valueProp, designAssets } = await wsResponse.json();

      if (!icp) {
        throw new Error("Persona not found");
      }

      set({
        workspaceData: {
          persona: icp,
          valueProp: valueProp || null,
          designAssets: designAssets || null,
        },
        designAssets: designAssets || null,
        loading: false,
      });

      console.log('✅ [CopilotStore] Loaded workspace data from brand_manifests');
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
    chatMessages: [],  // Reset to empty - will be re-initialized on next load
    isStreaming: false,
    isChatVisible: true,
    regenerationCount: 0,
    generationSteps: [],
    shareModalOpen: false,
    toasts: [],
  }),
}));
