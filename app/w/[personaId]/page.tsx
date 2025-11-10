import { createClient } from "@/lib/supabase/server";
import { ICP } from "@/lib/types/database";
import { notFound } from "next/navigation";
import { PersonaContent } from "./content";

export default async function PersonaPage({ 
  params 
}: { 
  params: Promise<{ personaId: string }> 
}) {
  const { personaId } = await params;
  const supabase = await createClient();

  // Fetch the ICP/persona by ID
  const { data: icp, error } = await supabase
    .from("icps")
    .select("*")
    .eq("id", personaId)
    .single();

  if (error || !icp) {
    notFound();
  }

  return <PersonaContent icp={icp} />;
}

