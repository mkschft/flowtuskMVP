import { createClient } from "@/lib/supabase/server";
import { ICP } from "@/lib/types/database";
import { notFound } from "next/navigation";

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

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{icp.persona_name}</h1>
          <p className="text-muted-foreground mt-2">
            {icp.persona_role} at {icp.persona_company}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-sm text-muted-foreground">{icp.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Location</h2>
              <p className="text-sm text-muted-foreground">
                {icp.location}, {icp.country}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Pain Points</h2>
              <ul className="space-y-1">
                {icp.pain_points.map((pain: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {pain}
                  </li>
                ))}
              </ul>
            </div>

            {icp.goals && icp.goals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Goals</h2>
                <ul className="space-y-1">
                  {icp.goals.map((goal: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <div className="text-sm">
            <span className="font-medium">Fit Score:</span> {icp.fit_score}%
          </div>
          <div className="text-sm">
            <span className="font-medium">Profiles Found:</span> {icp.profiles_found}+
          </div>
        </div>
      </div>
    </div>
  );
}

