export interface Speech {
  id: string;
  content: string;
  author: string | null; // null for AI messages
  parent_flow: string;
  model_id?: string | null;
  context: any;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
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
  pain_points: any; // JSONB
  goals: any; // JSONB
  fit_score: number;
  profiles_found: number;
  created_at: string;
  updated_at: string;
}

export interface FlowMetadata {
  prompt_regeneration_count: number;
  dropoff_step: string | null;
  completion_time_ms: number | null;
  prompt_version: string;
  user_feedback: any;
  is_demo: boolean;
}

export interface EnhancedFlow {
  id: string;
  user_id: string | null;
  title: string;
  website_url: string | null;
  facts_json: any;
  selected_icp: any;
  generated_content: any;
  step: string;
  metadata: FlowMetadata;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

