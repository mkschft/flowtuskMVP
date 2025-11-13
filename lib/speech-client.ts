import { createClient } from "@/lib/supabase/server";
import type { Speech } from "@/lib/types/database";

export async function saveSpeech(params: {
  content: string;
  author: string | null;
  parent_flow: string;
  model_id?: string;
  context?: any;
}): Promise<Speech> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("speech")
    .insert({
      content: params.content,
      author: params.author,
      parent_flow: params.parent_flow,
      model_id: params.model_id,
      context: params.context || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving speech:", error);
    throw error;
  }

  return data as Speech;
}

export async function getFlowSpeech(flowId: string): Promise<Speech[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("speech")
    .select("*")
    .eq("parent_flow", flowId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching speech:", error);
    throw error;
  }

  return (data as Speech[]) || [];
}

