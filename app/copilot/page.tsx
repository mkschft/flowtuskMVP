"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DesignStudioWorkspace } from "@/components/DesignStudioWorkspace";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function CopilotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const icpId = searchParams.get("icpId");
  const flowId = searchParams.get("flowId");

  if (!icpId || !flowId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold">Choose an Audience to Start</h1>
          <p className="text-muted-foreground">
            Pick your target audience to start building your brand in the Brand Canvas.
          </p>
          <Button onClick={() => router.push("/app")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <DesignStudioWorkspace icpId={icpId} flowId={flowId} />
    </div>
  );
}

export default function CopilotPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading Brand Canvas...</p>
        </div>
      </div>
    }>
      <CopilotContent />
    </Suspense>
  );
}

