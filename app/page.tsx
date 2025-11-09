"use client";

import { useState } from "react";
import { AIComposer } from "@/components/AIComposer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [hasContent, setHasContent] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {!hasContent ? (
        <div className="flex h-full items-center justify-center ">
          <div className="mx-auto w-full max-w-md text-center space-y-6 px-4">
            <div className="flex justify-center">
              <Sparkles className="h-8 w-8 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Your Positioning Co-Pilot
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Enter a website URL to generate customer personas and value propositions
              </p>
            </div>
          </div>
        </div>
      ) : <ScrollArea className="flex-1">
      </ScrollArea>}
      <AIComposer
        onNewSpeech={() => {
          setHasContent(true);
        }}
      />
    </div>
  );
}