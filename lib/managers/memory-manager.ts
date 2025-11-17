/**
 * Memory Manager
 * Manages conversation context, action history, and prerequisites
 */

import type { ConversationMemory } from '@/lib/stores/types';

export class MemoryManager {
  private memories: Map<string, ConversationMemory> = new Map();
  private readonly STORAGE_KEY = 'flowtusk_conversation_memories';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([id, memory]) => {
          this.memories.set(id, memory as ConversationMemory);
        });
        console.log('📚 [MemoryManager] Loaded memories from storage');
      }
    } catch (error) {
      console.error('❌ [MemoryManager] Failed to load memories:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const data = Object.fromEntries(this.memories);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('💾 [MemoryManager] Saved memories to storage');
    } catch (error) {
      console.error('❌ [MemoryManager] Failed to save memories:', error);
    }
  }

  getMemory(conversationId: string): ConversationMemory | null {
    return this.memories.get(conversationId) || null;
  }

  updateMemory(conversationId: string, updates: Partial<ConversationMemory>): void {
    const current = this.getMemory(conversationId);
    if (current) {
      const updated = { ...current, ...updates };
      this.memories.set(conversationId, updated);
      this.saveToStorage();
    }
  }

  addGenerationRecord(
    conversationId: string, 
    action: string, 
    result: Record<string, unknown>, 
    success: boolean = true
  ): void {
    const memory = this.getMemory(conversationId);
    if (memory) {
      memory.generationHistory.push({
        timestamp: new Date(),
        action,
        result,
        success
      });
      this.saveToStorage();
    }
  }

  getLastAction(conversationId: string): string | null {
    const memory = this.getMemory(conversationId);
    return memory?.userPreferences.lastAction || null;
  }

  setLastAction(conversationId: string, action: string): void {
    const memory = this.getMemory(conversationId);
    if (memory) {
      memory.userPreferences.lastAction = action;
      this.saveToStorage();
    }
  }

  getGenerationHistory(conversationId: string): Array<{
    timestamp: Date;
    action: string;
    result: Record<string, unknown>;
    success: boolean;
  }> {
    const memory = this.getMemory(conversationId);
    return memory?.generationHistory || [];
  }

  getCompletedActions(conversationId: string): string[] {
    const history = this.getGenerationHistory(conversationId);
    return history
      .filter(record => record.success)
      .map(record => record.action);
  }

  canPerformAction(conversationId: string, action: string): boolean {
    // Define action dependencies (using actual recorded action names)
    const dependencies: Record<string, string[]> = {
      'select-icp': [], // No prerequisite - ICPs can be selected when shown
      'value-prop': ['select-icp'],
      'funnel': ['value-prop'],
      'make-content-choice': ['funnel'],
      'email': ['make-content-choice'],
      'linkedin': ['make-content-choice'],
      'show-email-choice': ['approve-positioning-summary'], // Email flow starts after positioning
      'choose-email-type': ['show-email-choice'],
      'generate-one-time-email': ['choose-email-type'],
      'generate-email-sequence': ['choose-email-type'],
      'generate-linkedin-outreach': ['choose-email-type'],
    };

    const required = dependencies[action] || [];

    // If no prerequisites required, allow the action immediately
    // This prevents blocking actions like 'select-icp' when memory hasn't been initialized yet
    if (required.length === 0) {
      return true;
    }

    // For actions with prerequisites, check memory and completed actions
    const memory = this.getMemory(conversationId);
    if (!memory) return false;

    const completed = this.getCompletedActions(conversationId);
    return required.every(dep => completed.includes(dep));
  }

  clearMemory(conversationId: string): void {
    this.memories.delete(conversationId);
    this.saveToStorage();
  }

  exportMemory(conversationId: string): string {
    const memory = this.getMemory(conversationId);
    return JSON.stringify(memory, null, 2);
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
