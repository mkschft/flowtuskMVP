"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkflowsNavbar() {
  const [sourceFlowId, setSourceFlowId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Read the flowId from localStorage
    const storedFlowId = localStorage.getItem("workflows_source_flow");
    setSourceFlowId(storedFlowId);
  }, []);

  const handleBack = () => {
    if (sourceFlowId) {
      router.push(`/u/flows/${sourceFlowId}`);
    } else {
      // Fallback to dashboard or home if no flowId stored
      router.push("/u/prospects");
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Flows</span>
        </Button>
      </div>
    </nav>
  );
}

