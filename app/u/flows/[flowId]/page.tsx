import { FlowConversation } from "@/components/FlowConversation";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function FlowPage({ params }: { params: Promise<{ flowId: string }> }) {
  const { flowId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Check if flow title needs regeneration (has [TEMP] marker)
  const { data: flow } = await supabase
    .from("flows")
    .select("title")
    .eq("id", flowId)
    .single();

  if (flow?.title?.startsWith("[TEMP]")) {
    // Get first user speech to generate title from
    const { data: firstSpeech } = await supabase
      .from("speech")
      .select("content")
      .eq("parent_flow", flowId)
      .eq("author", currentUserId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstSpeech?.content) {
      try {
        // Generate title using cheap model (gpt-4o-mini)
        const prompt = `You are naming a new conversation (a flow) for a chat app.
From the user's message below, create a short, specific title within 20 words.
Do not use quotes. Avoid generic words like Conversation, Chat, Flow. Return ONLY the title.

User message:
"""
${firstSpeech.content}
"""`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You write concise, descriptive titles." },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 60,
        });

        const title = completion.choices[0]?.message?.content?.trim();
        if (title) {
          // Hard trim to 20 words as safeguard
          const safeTitle = title.split(/\s+/).slice(0, 20).join(" ").slice(0, 120);
          // Update flow title (remove [TEMP] marker)
          await supabase
            .from("flows")
            .update({ title: safeTitle })
            .eq("id", flowId);
        }
      } catch (error) {
        // Silently fail - don't break the page if title generation fails
        console.error("Failed to generate title:", error);
      }
    }
  }

  // Prefetch speeches to render and user to align bubbles
  const { data: speeches } = await supabase
    .from("speech")
    .select("id, content, created_at, author, model_id")
    .eq("parent_flow", flowId)
    .order("created_at", { ascending: true });

  return (
    <FlowConversation
      flowId={flowId}
      initialSpeeches={(speeches || []) as { id: string; content: string; created_at: string; author: string | null; model_id: string | null }[]}
      currentUserId={currentUserId}
    />
  );
}

