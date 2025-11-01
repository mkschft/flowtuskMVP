"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIComposer } from "@/components/AIComposer";

type SpeechRow = {
  id: string;
  content: string;
  author: string;
  created_at: string;
};

export function FlowConversation({
  flowId,
  initialSpeeches,
  currentUserId,
}: {
  flowId: string;
  initialSpeeches: SpeechRow[];
  currentUserId?: string;
}) {
  const [speeches, setSpeeches] = useState<SpeechRow[]>(initialSpeeches || []);

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full max-w-5xl p-4 space-y-4">
          {speeches.map((s) => {
            const isUser = currentUserId && s.author === currentUserId;
            return (
              <div
                key={s.id}
                className={`rounded-md border p-3 text-sm whitespace-pre-wrap w-fit max-w-2xl break-words ${
                  isUser ? "ml-auto" : "mr-auto"
                }`}
              >
                {s.content}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <AIComposer
        flowId={flowId}
        onNewSpeech={(row) => {
          if (!row) return;
          setSpeeches((prev) => [...prev, row as SpeechRow]);
        }}
      />
    </div>
  );
}


