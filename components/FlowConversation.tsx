"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIComposer } from "@/components/AIComposer";
import { CircularLoader } from "@/components/ui/loader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when speeches, loading state, or streaming content changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [speeches, isAILoading, streamingContent]);

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
                <div className="rounded-md border p-3 text-sm w-fit max-w-2xl [&_*]:break-words">
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
                </div>
              </div>
            );
          })}
          {(isAILoading || streamingContent) && (
            <div className="flex items-start gap-3 w-full">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-muted">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className={`rounded-md border p-3 text-sm [&_*]:break-words w-fit max-w-2xl ${streamingContent ? "" : "flex items-center gap-2"}`}>
                {streamingContent ? (
                  <>
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
                      {streamingContent}
                    </ReactMarkdown>
                  </>
                ) : (
                  <>
                    <CircularLoader size="sm" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </>
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
          setSpeeches((prev) => [...prev, speechRow]);
        }}
        onLoadingChange={(loading) => {
          setIsAILoading(loading);
          if (!loading) {
            setStreamingContent("");
          }
        }}
        onStreamingContent={setStreamingContent}
      />
    </div>
  );
}


