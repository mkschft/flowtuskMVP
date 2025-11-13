"use client";

import { useState, useEffect, useRef } from "react";
import { AIComposer } from "@/components/AIComposer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { ResponseRenderer } from "@/components/ResponseRenderer";
import { CircularLoader } from "@/components/ui/loader";
import { createClient } from "@/lib/supabase/client";

type SpeechRow = {
  id: string;
  content: string;
  author: string | null;
  model_id: string | null;
  created_at: string;
};

export default function Page() {
  const [speeches, setSpeeches] = useState<SpeechRow[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom when speeches or streaming content changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [speeches, streamingContent, aiStatus]);

  // Get current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const hasContent = speeches.length > 0 || streamingContent || isAILoading;

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
      ) : (
        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-5xl p-4 space-y-4">
            {speeches.map((s) => {
              const isUser = s.author && currentUserId && s.author === currentUserId;
              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                      {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-md border p-3 text-sm [&_*]:break-words max-w-[80%] ${
                      isUser ? "bg-primary text-primary-foreground border-primary" : "bg-muted"
                    }`}
                  >
                    <ResponseRenderer content={s.content} flowId={undefined} />
                  </div>
                </div>
              );
            })}
            {(isAILoading || streamingContent || aiStatus) && (
              <div className="flex items-start gap-3 w-full">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-muted">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-md border p-3 text-sm [&_*]:break-words w-full">
                  {streamingContent ? (
                    <ResponseRenderer content={streamingContent} flowId={undefined} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <CircularLoader size="sm" />
                      <span className="text-sm text-muted-foreground">{aiStatus || "Thinking"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}
      <AIComposer
        onNewSpeech={(speech) => {
          if (speech) {
            setSpeeches((prev) => [...prev, speech as SpeechRow]);
          }
        }}
        onLoadingChange={setIsAILoading}
        onStreamingContent={setStreamingContent}
        onStatusChange={setAiStatus}
      />
    </div>
  );
}

