import { createClient } from "@/lib/supabase/server";
import { ICP, Site } from "@/lib/types/database";
import { notFound, redirect } from "next/navigation";
import { PersonaContent } from "./content";

export default async function FlowWorkspacePage({
  params
}: {
  params: Promise<{ flowId: string }>
}) {
  const { flowId } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch the flow and get selected_icp and selected_site
  // Try to select selected_icp and selected_site, but handle case where columns might not exist yet
  let flow: { selected_icp?: string | null; selected_site?: string | null; author: string; id: string } | null = null;
  let flowError: any = null;

  try {
    const result = await supabase
      .from("flows")
      .select("selected_icp, selected_site, author, id")
      .eq("id", flowId)
      .single();

    flow = result.data;
    flowError = result.error;
  } catch (err: any) {
    // If columns don't exist, try without them
    if (err?.code === '42703' || err?.message?.includes('column')) {
      console.warn("selected_icp or selected_site column not found, trying without them. Migration may need to be applied.");
      const result = await supabase
        .from("flows")
        .select("author, id")
        .eq("id", flowId)
        .single();
      flow = { ...result.data, selected_icp: null, selected_site: null } as any;
      flowError = result.error;
    } else {
      flowError = err;
    }
  }

  if (flowError) {
    console.error("Error fetching flow:", flowError);
    console.error("FlowId:", flowId);
    notFound();
  }

  if (!flow) {
    console.error("Flow not found for flowId:", flowId);
    notFound();
  }

  // Check if user owns this flow
  if (flow.author !== user.id) {
    console.error("User does not own this flow. User:", user.id, "Flow author:", flow.author);
    notFound();
  }

  // If no selected ICP, redirect back to flow page
  if (!flow.selected_icp) {
    console.log("No selected ICP for flow:", flowId, "redirecting to flow page");
    redirect(`/u/flows/${flowId}`);
  }

  // Fetch the selected ICP
  const { data: icp, error: icpError } = await supabase
    .from("icps")
    .select("*")
    .eq("id", flow.selected_icp)
    .single();

  if (icpError) {
    console.error("Error fetching ICP:", icpError);
    console.error("Selected ICP ID:", flow.selected_icp);
    notFound();
  }

  if (!icp) {
    console.error("ICP not found for ID:", flow.selected_icp);
    notFound();
  }

  // Fetch the selected site if available
  let selectedSite: Site | null = null;
  if (flow.selected_site) {
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("*")
      .eq("id", flow.selected_site)
      .single();

    if (!siteError && site) {
      selectedSite = site as Site;
    }
  }

  return <PersonaContent icp={icp as ICP} selectedSite={selectedSite} />;
}

