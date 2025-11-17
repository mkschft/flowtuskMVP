/**
 * Flow Store
 * Manages conversations/flows, active selection, and CRUD operations
 * Persists to localStorage and syncs with Supabase
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Conversation } from './types';
import { flowsClient } from '@/lib/flows-client';

interface FlowState {
  // State
  flows: Conversation[];
  activeFlowId: string | null;
  isLoading: boolean;
  error: string | null;
  dbSyncEnabled: boolean;

  // Computed
  activeFlow: Conversation | null;

  // Actions
  setFlows: (flows: Conversation[]) => void;
  setActiveFlowId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDbSyncEnabled: (enabled: boolean) => void;

  // Flow CRUD
  addFlow: (flow: Conversation) => void;
  updateFlow: (id: string, updates: Partial<Conversation>) => void;
  deleteFlow: (id: string) => void;
  clearFlows: () => void;

  // Async operations
  loadFlowsFromDb: () => Promise<void>;
  saveFlowToDb: (flow: Conversation) => Promise<void>;

  // Helpers
  getFlow: (id: string) => Conversation | undefined;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      // Initial State
      flows: [],
      activeFlowId: null,
      isLoading: false,
      error: null,
      dbSyncEnabled: false,

      // Computed - derive activeFlow from flows
      get activeFlow() {
        const state = get();
        if (!state.activeFlowId) return null;
        return state.flows.find(f => f.id === state.activeFlowId) || null;
      },

      // Actions
      setFlows: (flows) => set({ flows }),
      
      setActiveFlowId: (id) => set({ activeFlowId: id }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setDbSyncEnabled: (enabled) => set({ dbSyncEnabled: enabled }),

      // Flow CRUD
      addFlow: (flow) => set((state) => ({ 
        flows: [flow, ...state.flows] 
      })),

      updateFlow: (id, updates) => set((state) => ({
        flows: state.flows.map(flow => 
          flow.id === id ? { ...flow, ...updates } : flow
        )
      })),

      deleteFlow: (id) => set((state) => ({
        flows: state.flows.filter(flow => flow.id !== id),
        activeFlowId: state.activeFlowId === id ? null : state.activeFlowId
      })),

      clearFlows: () => set({ flows: [], activeFlowId: null }),

      // Async operations
      loadFlowsFromDb: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔍 [FlowStore] Loading flows from database...');
          const flowsData = await flowsClient.listFlows();
          
          // Convert Flow to Conversation format
          const conversations = flowsData.map(flowToConversation);
          
          set({ 
            flows: conversations, 
            isLoading: false,
            dbSyncEnabled: true
          });
          
          // Set active flow if none selected
          const state = get();
          if (conversations.length > 0 && !state.activeFlowId) {
            set({ activeFlowId: conversations[0].id });
          }
          
          console.log(`✅ [FlowStore] Loaded ${conversations.length} flows`);
        } catch (error) {
          console.error('❌ [FlowStore] Failed to load flows:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load flows',
            isLoading: false,
            dbSyncEnabled: false
          });
        }
      },

      saveFlowToDb: async (flow) => {
        if (!get().dbSyncEnabled) {
          console.warn('⚠️ [FlowStore] DB sync disabled, skipping save');
          return;
        }

        try {
          // Save to database using flows-client
          await flowsClient.updateFlow(flow.id, {
            title: flow.title,
            website_url: flow.memory.websiteUrl,
            facts_json: flow.memory.factsJson as any,
            selected_icp: flow.memory.selectedIcp as any,
            generated_content: {
              messages: flow.messages,
              generationState: flow.generationState,
              userJourney: flow.userJourney,
            },
            step: determineCurrentStep(flow),
          });
          
          console.log(`💾 [FlowStore] Saved flow ${flow.id.slice(0, 8)} to database`);
        } catch (error) {
          console.error('❌ [FlowStore] Failed to save flow:', error);
          // Don't throw - let the app continue working with localStorage
        }
      },

      // Helpers
      getFlow: (id) => {
        return get().flows.find(f => f.id === id);
      },
    }),
    {
      name: 'flowtusk-flows',
      storage: createJSONStorage(() => localStorage),
      // Only persist flows and activeFlowId, not loading/error states
      partialize: (state) => ({
        flows: state.flows,
        activeFlowId: state.activeFlowId,
      }),
    }
  )
);

// Helper: Convert DB Flow to Conversation format
function flowToConversation(flow: any): Conversation {
  const generatedContent = (flow.generated_content as any) || {};
  
  return {
    id: flow.id,
    title: flow.title,
    messages: generatedContent.messages || [],
    createdAt: new Date(flow.created_at),
    generationState: generatedContent.generationState || {
      currentStep: 'analysis',
      completedSteps: [],
      generatedContent: {},
      isGenerating: false,
    },
    userJourney: generatedContent.userJourney || {
      websiteAnalyzed: false,
      icpSelected: false,
      valuePropGenerated: false,
      exported: false,
    },
    memory: {
      id: flow.id,
      websiteUrl: flow.website_url || '',
      websiteContent: undefined,
      factsJson: flow.facts_json as any,
      selectedIcp: flow.selected_icp as any,
      generationHistory: generatedContent.generationHistory || [],
      userPreferences: generatedContent.userPreferences || {
        preferredContentType: '',
        lastAction: '',
      },
    },
  };
}

// Helper: Determine current step from journey state
function determineCurrentStep(conversation: Conversation): string {
  const journey = conversation.userJourney;
  
  if (journey.exported) return 'exported';
  if (journey.valuePropGenerated) return 'value_prop';
  if (journey.icpSelected) return 'icp_selected';
  if (journey.websiteAnalyzed) return 'analyzed';
  
  return 'initial';
}
