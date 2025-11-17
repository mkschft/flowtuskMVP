"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bot } from "lucide-react";
import { AIComposer } from "@/components/AIComposer";
import { ResponseRenderer } from "@/components/ResponseRenderer";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

type SpeechRow = {
  id: string;
  content: string;
  author: string | null;
  model_id: string | null;
  created_at: string;
};

export function WorkflowsChat() {
  const pathname = usePathname();
  const router = useRouter();
  const flowId = pathname?.split("/w/")[1]?.split("/")[0] || null;
  
  const [speeches, setSpeeches] = useState<SpeechRow[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>("");
  const [isLoadingSpeeches, setIsLoadingSpeeches] = useState(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load speeches from database
  useEffect(() => {
    async function loadSpeeches() {
      if (!flowId) {
        setIsLoadingSpeeches(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: speechesData, error } = await supabase
          .from("speech")
          .select("*")
          .eq("parent_flow", flowId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading speeches:", error);
        } else if (speechesData) {
          // Find the index of the "persona created successfully" speech
          const personaCreatedIndex = speechesData.findIndex((s: SpeechRow) => 
            s.content.includes('"type":"persona-created-card"') ||
            s.content.includes("persona-created-card") ||
            s.content.toLowerCase().includes("persona created successfully")
          );

          // If found, filter out that speech and all speeches before it
          let filteredSpeeches = personaCreatedIndex !== -1
            ? speechesData.slice(personaCreatedIndex + 1)
            : speechesData;

          // Remove duplicates from loaded speeches
          // Group by content + author (for user) or content + model_id (for AI)
          const uniqueSpeeches: SpeechRow[] = [];
          const seen = new Set<string>();

          for (const speech of filteredSpeeches) {
            const key = speech.author
              ? `user:${speech.author}:${speech.content.trim()}`
              : `ai:${speech.model_id}:${speech.content.trim()}`;
            
            if (!seen.has(key)) {
              seen.add(key);
              uniqueSpeeches.push(speech as SpeechRow);
            }
          }

          setSpeeches(uniqueSpeeches);
        }
      } catch (error) {
        console.error("Error loading speeches:", error);
      } finally {
        setIsLoadingSpeeches(false);
      }
    }

    loadSpeeches();
  }, [flowId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [speeches, streamingContent]);

  const handleNewSpeech = (speech?: { id: string; content: string; author: string | null; model_id: string | null; created_at?: string }) => {
    if (!speech) return;

    setSpeeches((prev) => {
      // Check if speech already exists (by ID) - update it instead of adding duplicate
      const existingIndex = prev.findIndex((s) => s.id === speech.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = speech as SpeechRow;
        return updated;
      }

      // For user messages, check by content and author to prevent duplicates
      // Check both temp and real IDs
      if (speech.author) {
        const contentExists = prev.some((s) => {
          if (!s.author) return false;
          return (
            s.content.trim() === speech.content.trim() &&
            s.author === speech.author
          );
        });
        if (contentExists) {
          return prev;
        }
      }

      // For AI messages, check by model_id and content to prevent duplicates
      if (speech.model_id && !speech.author) {
        const contentExists = prev.some((s) => {
          if (s.author) return false;
          return (
            s.content.trim() === speech.content.trim() &&
            s.model_id === speech.model_id
          );
        });
        if (contentExists) {
          return prev;
        }
      }

      // New speech, add it
      return [...prev, speech as SpeechRow];
    });
  };

  const handleBack = () => {
    if (flowId) {
      router.push(`/u/flows/${flowId}`);
    } else {
      router.push("/u/prospects");
    }
  };

  // Track elapsed time when AI is loading
  useEffect(() => {
    if (isAILoading && !startTimeRef.current) {
      // Start tracking
      startTimeRef.current = Date.now();
      setElapsedTime(0);
    } else if (!isAILoading && startTimeRef.current) {
      // Stop tracking
      startTimeRef.current = null;
      setElapsedTime(0);
    }
  }, [isAILoading]);

  // Update elapsed time every second
  useEffect(() => {
    if (!startTimeRef.current) return;

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAILoading]);

  // Clear streaming content when AI finishes
  useEffect(() => {
    if (streamingContent && !isAILoading) {
      const now = Date.now();
      const hasRecentAISpeech = speeches.some((s) => {
        if (s.author) return false;
        const speechTime = new Date(s.created_at).getTime();
        const timeDiff = now - speechTime;
        return timeDiff < 2000 && timeDiff >= 0;
      });
      if (hasRecentAISpeech) {
        setStreamingContent("");
      }
    }
  }, [speeches, streamingContent, isAILoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Workspace header */}
      <div className="border-b p-4 shrink-0 h-14 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Conversations</span>
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {isLoadingSpeeches ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : speeches.length === 0 && !streamingContent && !isAILoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">No Activity yet</p>
              </div>
            </div>
          ) : (
            <>
              {speeches.map((s) => {
                const isUser = !!s.author;
                const needsFullWidth = !isUser && (
                  s.content.includes("<component>") ||
                  s.content.length > 500 ||
                  s.content.includes("\n\n\n") ||
                  s.content.match(/^#{1,3}\s/m)
                );

                return (
                  <div
                    key={s.id}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback
                        className={
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }
                      >
                        {isUser ? (
                          <User className="size-4" />
                        ) : (
                          <Bot className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-md border p-3 text-sm [&_*]:break-words ${
                        isUser
                          ? "w-fit max-w-2xl bg-primary text-primary-foreground"
                          : needsFullWidth
                          ? "w-full bg-muted"
                          : "w-fit max-w-2xl bg-muted"
                      }`}
                    >
                      {isUser ? (
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-primary/20 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                              ) : (
                                <code className={className}>{children}</code>
                              );
                            },
                            pre: ({ children }) => (
                              <pre className="bg-primary/20 p-2 rounded text-xs overflow-x-auto my-2">{children}</pre>
                            ),
                          }}
                        >
                          {s.content}
                        </ReactMarkdown>
                      ) : (
                        <ResponseRenderer
                          content={s.content}
                          flowId={flowId || undefined}
                        />
                      )}
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
                  <div
                    className={`rounded-md border p-3 text-sm [&_*]:break-words ${
                      streamingContent &&
                      (streamingContent.includes("<component>") ||
                        streamingContent.length > 500 ||
                        streamingContent.includes("\n\n\n") ||
                        streamingContent.match(/^#{1,3}\s/m))
                        ? "w-full bg-muted"
                        : streamingContent
                        ? "w-fit max-w-2xl bg-muted"
                        : "w-full bg-muted"
                    }`}
                  >
                    {streamingContent ? (
                      <ResponseRenderer
                        content={streamingContent}
                        flowId={flowId || undefined}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {aiStatus || "Thinking"}
                        </span>
                        {elapsedTime > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {elapsedTime}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4 shrink-0">
        <AIComposer
          flowId={flowId || undefined}
          onNewSpeech={handleNewSpeech}
          onLoadingChange={setIsAILoading}
          onStreamingContent={setStreamingContent}
          onStatusChange={setAiStatus}
        />
      </div>
    </div>
  );
}

