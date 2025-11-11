"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface PersonaCreatedCardProps {
  personaName: string;
  personaId?: string;
  onWorkflows?: () => void;
  onRestart?: () => void;
}

export function PersonaCreatedCard({ personaName, personaId, onWorkflows, onRestart }: PersonaCreatedCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="rounded-lg from-green-50  dark:from-green-950/20 dark:to-green-900/10 p-6 max-w-md w-full space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Persona Created Successfully
          </h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          The persona <span className="font-medium text-gray-900 dark:text-gray-100">{personaName}</span> has been created. You can now work with this persona or generate more.
        </p>

        <div className="flex flex-col gap-2 pt-4">
          <Button
            onClick={onWorkflows}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Launch workspace
          </Button>
          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
}

