/**
 * Database utilities for app workspace
 * Handles Flow <-> Conversation conversions and DB operations
 */

import { flowsClient, type Flow } from "@/lib/flows-client";
import type { Conversation } from "@/app/app/types";

/**
 * Convert Flow from database to Conversation format
 */
export function flowToConversation(flow: Flow): Conversation {
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
      generationId: undefined,
      lastGenerationTime: undefined,
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

/**
 * Load all flows from database and convert to conversations
 */
export async function loadFlowsFromDB(): Promise<Conversation[]> {
  try {
    console.log('🔍 [DB] Loading flows from database...');
    
    const flows = await flowsClient.listFlows();
    console.log(`✅ [DB] Loaded ${flows.length} flows from database`);
    
    // Debug: Track evidence chain in loaded flows
    flows.forEach((flow, idx) => {
      const facts = (flow.facts_json as any)?.facts || [];
      const icpEvidence = (flow.selected_icp as any)?.evidence || [];
      if (facts.length > 0 || icpEvidence.length > 0) {
        console.log(`📎 [Evidence] Flow ${idx + 1}: ${facts.length} facts, ICP has ${icpEvidence.length} evidence links`);
      }
    });
    
    // Convert Flow to Conversation format
    return flows.map(flowToConversation);
  } catch (error) {
    console.error('❌ [DB] Failed to load flows:', error);
    throw error;
  }
}

/**
 * Save conversation to database (debounced)
 */
export async function saveConversationToDb(conversation: Conversation): Promise<void> {
  try {
    // Debug: Track evidence chain integrity
    if (conversation.memory.factsJson) {
      const facts = (conversation.memory.factsJson as any)?.facts || [];
      console.log(`💾 [DB Save] Flow ${conversation.id.slice(0, 8)}: ${facts.length} facts with evidence`);
    }
    if (conversation.memory.selectedIcp) {
      const evidence = (conversation.memory.selectedIcp as any)?.evidence || [];
      console.log(`💾 [DB Save] Selected ICP has ${evidence.length} evidence links`);
    }
    
    // Sanitize data before saving to avoid size issues
    const sanitizedGeneratedContent = {
      // Only save essential message data (exclude large content if needed)
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        component: msg.component,
        // Exclude heavy data from message.data to reduce payload
        data: msg.data ? (typeof msg.data === 'object' ? { _ref: msg.id } : msg.data) : undefined
      })),
      generationState: {
        ...conversation.generationState,
        // Remove heavy nested content from generatedContent
        generatedContent: conversation.generationState.generatedContent ? {
          icps: conversation.generationState.generatedContent.icps ? { _count: (conversation.generationState.generatedContent.icps as any[]).length } : undefined,
          valueProp: conversation.generationState.generatedContent.valueProp ? { _exists: true } : undefined,
        } : {}
      },
      userJourney: conversation.userJourney,
      generationHistory: conversation.memory.generationHistory.slice(-10), // Keep only last 10
      userPreferences: conversation.memory.userPreferences,
    };
    
    await flowsClient.debouncedUpdate(conversation.id, {
      title: conversation.title,
      website_url: conversation.memory.websiteUrl,
      facts_json: conversation.memory.factsJson,
      selected_icp: conversation.memory.selectedIcp ?? undefined,
      generated_content: sanitizedGeneratedContent,
      step: determineCurrentStep(conversation),
    });
    
    console.log('💾 [DB] Auto-saved to database');
  } catch (error) {
    console.error('❌ [DB] Auto-save failed:', error);
    console.warn('⚠️ Continuing without DB sync - data is safe in browser localStorage');
    throw error;
  }
}

/**
 * Determine current step based on user journey
 */
export function determineCurrentStep(conversation: Conversation): string {
  const journey = conversation.userJourney;
  
  if (journey.exported) return 'exported';
  if (journey.valuePropGenerated) return 'value_prop';
  if (journey.icpSelected) return 'icp_selected';
  if (journey.websiteAnalyzed) return 'analyzed';
  
  return 'initial';
}

/**
 * Load conversations from localStorage
 */
export function loadFromLocalStorage(): { conversations: Conversation[]; activeId: string | null } {
  const savedConversations = localStorage.getItem('flowtusk_conversations');
  const savedActiveId = localStorage.getItem('flowtusk_active_conversation');
  
  if (savedConversations) {
    try {
      const parsed = JSON.parse(savedConversations);
      console.log('📦 [Storage] Loaded conversations from localStorage');
      return { conversations: parsed, activeId: savedActiveId };
    } catch (error) {
      console.error('❌ [Storage] Failed to load conversations:', error);
    }
  }
  
  return { conversations: [], activeId: null };
}

/**
 * Save conversations to localStorage
 */
export function saveToLocalStorage(conversations: Conversation[], activeId: string): void {
  try {
    localStorage.setItem('flowtusk_conversations', JSON.stringify(conversations));
    localStorage.setItem('flowtusk_active_conversation', activeId);
  } catch (error) {
    console.error('❌ [Storage] Failed to save to localStorage:', error);
  }
}
