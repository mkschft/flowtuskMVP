// Database types for Supabase tables

export interface Flow {
  id: string;
  title: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface FlowInsert {
  title: string;
  author: string;
}

export interface FlowUpdate {
  title?: string;
}

export interface Speech {
  id: string;
  content: string;
  author: string;
  parent_flow: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SpeechInsert {
  content: string;
  author: string;
  parent_flow: string;
  context?: Record<string, any>;
}

export interface SpeechUpdate {
  content?: string;
  context?: Record<string, any>;
}

// Response types with relations
export interface FlowWithSpeech extends Flow {
  speech?: Speech[];
}

