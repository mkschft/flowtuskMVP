"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ICP } from "@/lib/types/database";
import { ICPCard } from "@/components/ICPCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function ICPsPage() {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchICPs() {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("icps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching ICPs:", error);
      } else {
        setIcps(data || []);
      }
      
      setLoading(false);
    }

    fetchICPs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Prospects</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-5xl p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Prospects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {icps.length} {icps.length === 1 ? "prospect" : "prospects"} saved
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full max-w-5xl p-4">
          {icps.length === 0 ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No prospects saved yet.</p>
                <p className="text-sm text-muted-foreground">
                  Generate ICPs by analyzing a website URL.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {icps.map((icp) => (
                <ICPCard
                  key={icp.id}
                  personaName={icp.persona_name}
                  personaRole={icp.persona_role}
                  personaCompany={icp.persona_company}
                  location={icp.location}
                  country={icp.country}
                  title={icp.title}
                  description={icp.description}
                  painPoints={icp.pain_points}
                  fitScore={icp.fit_score}
                  profilesFound={icp.profiles_found}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

