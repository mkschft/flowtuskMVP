"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIComposer } from "@/components/AIComposer";
import { CircularLoader } from "@/components/ui/loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { ResponseRenderer } from "@/components/ResponseRenderer";
import { ICPSkeleton, CompanyDescriptionSkeleton } from "@/components/ICPSkeleton";

type SpeechRow = {
  id: string;
  content: string;
  author: string | null;
  model_id: string | null;
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
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>(""); // Status message like "thinking", "scraping data..."
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Detect if last user message contains a URL (to show ICP skeletons)
  useEffect(() => {
    const lastUserSpeech = [...speeches].reverse().find(s => s.author);
    if (lastUserSpeech && isAILoading && !streamingContent) {
      const urlRegex = /https?:\/\/[^\s\)\]\"\'<>]+/gi;
      const hasUrl = urlRegex.test(lastUserSpeech.content);
      setShowSkeletons(hasUrl);
    } else if (streamingContent) {
      setShowSkeletons(false);
    }
  }, [speeches, isAILoading, streamingContent]);

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

  // Auto-scroll to bottom when speeches, loading state, streaming content, or status changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [speeches, isAILoading, streamingContent, aiStatus, showSkeletons]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-5xl p-4 space-y-4">
          {speeches.map((s) => {
            // User message if author is set and matches current user, AI message if model_id is set
            const isUser = s.author && currentUserId && s.author === currentUserId;
            return (
              <div
                key={s.id}
                className={`flex items-start gap-3 w-full ${isUser ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                    {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`rounded-md border p-3 text-sm [&_*]:break-words ${isUser ? "w-fit max-w-2xl" : "w-full"}`}>
                  {isUser ? (
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-semibold my-2 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold my-2 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold my-2 first:mt-0">{children}</h3>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto my-2">{children}</pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-muted pl-2 my-2 italic">{children}</blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {s.content}
                    </ReactMarkdown>
                  ) : (
                    <ResponseRenderer content={s.content} flowId={flowId} />
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
              <div className={`rounded-md border p-3 text-sm [&_*]:break-words w-full ${streamingContent ? "" : streamingContent || showSkeletons ? "" : "flex items-center gap-2"}`}>
                {streamingContent ? (
                  <ResponseRenderer content={streamingContent} flowId={flowId} />
                ) : showSkeletons ? (
                  <div className="space-y-4">
                    {/* Activity indicator */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <CircularLoader size="sm" />
                      <span className="text-sm text-muted-foreground">{aiStatus || "Thinking"}</span>
                      {elapsedTime > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {elapsedTime}s
                        </span>
                      )}
                    </div>
                    <CompanyDescriptionSkeleton />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <ICPSkeleton />
                      <ICPSkeleton />
                      <ICPSkeleton />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CircularLoader size="sm" />
                    <span className="text-sm text-muted-foreground">{aiStatus || "Thinking"}</span>
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
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <AIComposer
        flowId={flowId}
        onNewSpeech={(row) => {
          if (!row) return;
          // Ensure all required fields are present
          const speechRow: SpeechRow = {
            id: row.id,
            content: row.content,
            author: row.author || null,
            model_id: (row as any).model_id || null,
            created_at: row.created_at || new Date().toISOString(),
          };
          setSpeeches((prev) => {
            // If this is a temp speech, just add it
            if (row.id.startsWith("temp-")) {
              return [...prev, speechRow];
            }

            // For real speeches, check if we need to replace a temp one
            // For user messages: match by author and content (to handle new flows)
            // For AI messages: match by model_id (AI messages don't have author)
            const tempIndex = prev.findIndex((s) => {
              if (!s.id.startsWith("temp-")) return false;
              if (speechRow.author) {
                // User message: match by author and content (for new flows where parent_flow might differ)
                return s.author === speechRow.author && s.content === speechRow.content;
              } else {
                // AI message: match by model_id (both should have it)
                return s.model_id && speechRow.model_id && s.model_id === speechRow.model_id;
              }
            });

            if (tempIndex !== -1) {
              // Replace temp speech with real one
              const updated = [...prev];
              updated[tempIndex] = speechRow;
              return updated;
            }

            // Check if speech already exists (by ID) - update it instead of adding duplicate
            const existingIndex = prev.findIndex((s) => s.id === speechRow.id);
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = speechRow;
              return updated;
            }

            // New speech, add it
            return [...prev, speechRow];
          });
        }}
        onLoadingChange={(loading) => {
          setIsAILoading(loading);
          if (!loading) {
            setStreamingContent("");
          }
        }}
        onStreamingContent={setStreamingContent}
        onStatusChange={setAiStatus}
      />
    </div>
  );
}


