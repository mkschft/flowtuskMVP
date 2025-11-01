import { createClient } from "@/lib/supabase/server";
import type { Flow, FlowInsert, FlowUpdate, Speech, SpeechInsert, SpeechUpdate } from "@/lib/types/database";

/**
 * Get all flows for the current user
 */
export async function getUserFlows() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("flows")
    .select("*")
    .eq("author", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Flow[];
}

/**
 * Get a single flow by ID (only if user owns it)
 */
export async function getFlowById(flowId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("flows")
    .select("*")
    .eq("id", flowId)
    .eq("author", user.id)
    .single();

  if (error) throw error;
  return data as Flow;
}

/**
 * Create a new flow
 */
export async function createFlow(flow: FlowInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("flows")
    .insert({
      ...flow,
      author: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Flow;
}

/**
 * Update a flow
 */
export async function updateFlow(flowId: string, updates: FlowUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("flows")
    .update(updates)
    .eq("id", flowId)
    .eq("author", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Flow;
}

/**
 * Delete a flow (cascades to speech due to foreign key)
 */
export async function deleteFlow(flowId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("flows")
    .delete()
    .eq("id", flowId)
    .eq("author", user.id);

  if (error) throw error;
}

/**
 * Get all speech for a flow
 */
export async function getSpeechByFlow(flowId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify user owns the flow
  const { data: flow } = await supabase
    .from("flows")
    .select("id")
    .eq("id", flowId)
    .eq("author", user.id)
    .single();

  if (!flow) {
    throw new Error("Flow not found or access denied");
  }

  const { data, error } = await supabase
    .from("speech")
    .select("*")
    .eq("parent_flow", flowId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Speech[];
}

/**
 * Create a new speech entry
 */
export async function createSpeech(speech: SpeechInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify user owns the flow
  const { data: flow } = await supabase
    .from("flows")
    .select("id")
    .eq("id", speech.parent_flow)
    .eq("author", user.id)
    .single();

  if (!flow) {
    throw new Error("Flow not found or access denied");
  }

  const { data, error } = await supabase
    .from("speech")
    .insert({
      ...speech,
      author: user.id,
      context: speech.context || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as Speech;
}

/**
 * Update a speech entry
 */
export async function updateSpeech(speechId: string, updates: SpeechUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("speech")
    .update(updates)
    .eq("id", speechId)
    .eq("author", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Speech;
}

/**
 * Delete a speech entry
 */
export async function deleteSpeech(speechId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("speech")
    .delete()
    .eq("id", speechId)
    .eq("author", user.id);

  if (error) throw error;
}

