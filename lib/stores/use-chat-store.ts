/**
 * Chat Store
 * Manages chat messages, streaming state, and input handling for /app
 */

import { create } from 'zustand';
import type { ChatMessage, ThinkingStep } from './types';

interface ChatState {
  // State
  messages: ChatMessage[];
  inputValue: string;
  isStreaming: boolean;
  isSidebarOpen: boolean;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;

  setInputValue: (value: string) => void;
  setStreaming: (streaming: boolean) => void;
  setSidebarOpen: (open: boolean) => void;

  // Thinking steps management
  updateThinkingStep: (messageId: string, stepId: string, updates: Partial<ThinkingStep>) => void;

  // Helpers
  getMessage: (id: string) => ChatMessage | undefined;
  getLastMessage: () => ChatMessage | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  messages: [],
  inputValue: '',
  isStreaming: false,
  isSidebarOpen: true,

  // Actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),

  deleteMessage: (id) => set((state) => ({
    messages: state.messages.filter(msg => msg.id !== id)
  })),

  clearMessages: () => set({ messages: [] }),

  setInputValue: (value) => set({ inputValue: value }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Thinking steps management
  updateThinkingStep: (messageId, stepId, updates) => set((state) => ({
    messages: state.messages.map(msg => {
      if (msg.id !== messageId || !msg.thinking) return msg;
      
      return {
        ...msg,
        thinking: msg.thinking.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        )
      };
    })
  })),

  // Helpers
  getMessage: (id) => {
    return get().messages.find(msg => msg.id === id);
  },

  getLastMessage: () => {
    const messages = get().messages;
    return messages.length > 0 ? messages[messages.length - 1] : undefined;
  },
}));
