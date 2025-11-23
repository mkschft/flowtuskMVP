/**
 * Zustand Stores - Central Export
 * 
 * Import stores from this file for consistency:
 * import { useFlowStore, useChatStore, useCopilotStore } from '@/lib/stores';
 */

// Export all stores
export { useFlowStore } from './use-flow-store';
export { useChatStore } from './use-chat-store';
export { useCopilotStore } from './use-copilot-store';

// Export all types
export type * from './types';

// Export managers (singleton instances)
export { generationManager } from '@/lib/managers/generation-manager';
