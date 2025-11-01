import { FlowConversation } from "@/components/FlowConversation";
import { createClient } from "@/lib/supabase/server";

export default async function FlowPage({ params }: { params: Promise<{ flowId: string }> }) {
  const { flowId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Prefetch speeches to render and user to align bubbles
  const { data: speeches } = await supabase
    .from("speech")
    .select("id, content, created_at, author")
    .eq("parent_flow", flowId)
    .order("created_at", { ascending: true });

  return (
    <FlowConversation
      flowId={flowId}
      initialSpeeches={(speeches || []) as { id: string; content: string; created_at: string; author: string }[]}
      currentUserId={currentUserId}
    />
  );
}


