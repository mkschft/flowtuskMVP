// Database types for Supabase tables

export interface Flow {
  id: string;
  title: string;
  author: string;
  selected_icp: string | null;
  selected_site: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlowInsert {
  title: string;
  author: string;
  selected_icp?: string | null;
  selected_site?: string | null;
}

export interface FlowUpdate {
  title?: string;
  selected_icp?: string | null;
  selected_site?: string | null;
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

export interface Site {
  id: string;
  parent_flow: string;
  url: string;
  content: string | null;
  source: string | null;
  title: string | null;
  description: string | null;
  summary: string | null;
  hero_image: string | null;
  favicon_url: string | null;
  language: string | null;
  facts_json: Record<string, any> | null;
  pages: number;
  created_at: string;
  updated_at: string;
}

export interface SiteInsert {
  parent_flow: string;
  url: string;
  content?: string | null;
  source?: string | null;
  title?: string | null;
  description?: string | null;
  summary?: string | null;
  hero_image?: string | null;
  favicon_url?: string | null;
  language?: string | null;
  facts_json?: Record<string, any> | null;
  pages?: number;
}

export interface SiteUpdate {
  url?: string;
  content?: string | null;
  source?: string | null;
  title?: string | null;
  description?: string | null;
  summary?: string | null;
  hero_image?: string | null;
  favicon_url?: string | null;
  language?: string | null;
  facts_json?: Record<string, any> | null;
  pages?: number;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  invited_by: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvitationInsert {
  email: string;
  token: string;
  invited_by: string;
  status?: "pending" | "accepted" | "expired" | "cancelled";
  expires_at?: string;
}

export interface InvitationUpdate {
  status?: "pending" | "accepted" | "expired" | "cancelled";
  accepted_at?: string | null;
  accepted_by?: string | null;
}

export interface StyleGuide {
  id: string;
  parent_flow: string;
  locale: string;
  name: string | null;
  description: string | null;
  colors: Record<string, any>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
  components: Record<string, any>;
  logo_url: string | null;
  favicon_url: string | null;
  brand_voice: string | null;
  effects: Record<string, any>;
  source_url: string | null;
  extraction_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface StyleGuideInsert {
  parent_flow: string;
  locale: string;
  name?: string | null;
  description?: string | null;
  colors?: Record<string, any>;
  typography?: Record<string, any>;
  spacing?: Record<string, any>;
  components?: Record<string, any>;
  logo_url?: string | null;
  favicon_url?: string | null;
  brand_voice?: string | null;
  effects?: Record<string, any>;
  source_url?: string | null;
  extraction_method?: string | null;
}

export interface StyleGuideUpdate {
  name?: string | null;
  description?: string | null;
  colors?: Record<string, any>;
  typography?: Record<string, any>;
  spacing?: Record<string, any>;
  components?: Record<string, any>;
  logo_url?: string | null;
  favicon_url?: string | null;
  brand_voice?: string | null;
  effects?: Record<string, any>;
  source_url?: string | null;
  extraction_method?: string | null;
}

export interface SiteStyleGuide {
  id: string;
  site_id: string;
  style_guide_id: string;
  locale: string;
  created_at: string;
}

export interface SiteStyleGuideInsert {
  site_id: string;
  style_guide_id: string;
  locale: string;
}

