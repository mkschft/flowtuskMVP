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

export interface Model {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Speech {
  id: string;
  content: string;
  author: string | null;
  model_id: string | null;
  parent_flow: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SpeechInsert {
  content: string;
  author?: string | null;
  model_id?: string | null;
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

export interface ICP {
  id: string;
  parent_flow: string;
  website_url: string | null;
  persona_name: string;
  persona_role: string;
  persona_company: string;
  location: string;
  country: string;
  title: string;
  description: string;
  pain_points: string[];
  goals: string[];
  fit_score: number;
  profiles_found: number;
  created_at: string;
  updated_at: string;
}

export interface ICPInsert {
  parent_flow: string;
  website_url?: string | null;
  persona_name: string;
  persona_role: string;
  persona_company: string;
  location: string;
  country: string;
  title: string;
  description: string;
  pain_points: string[];
  goals?: string[];
  fit_score?: number;
  profiles_found?: number;
}

export interface ICPUpdate {
  persona_name?: string;
  persona_role?: string;
  persona_company?: string;
  location?: string;
  country?: string;
  title?: string;
  description?: string;
  pain_points?: string[];
  goals?: string[];
  fit_score?: number;
  profiles_found?: number;
}

