"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIComposer } from "@/components/AIComposer";
import { CircularLoader } from "@/components/ui/loader";

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
                className={`rounded-md border p-3 text-sm w-fit max-w-2xl [&_*]:break-words ${
                  isUser ? "ml-auto" : "mr-auto"
                }`}
              >
                <ReactMarkdown
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
            );
          })}
          {(isAILoading || streamingContent) && (
            <div className="mr-auto w-fit max-w-2xl">
              <div className={`rounded-md border p-3 text-sm [&_*]:break-words ${streamingContent ? "" : "flex items-center gap-2"}`}>
                {streamingContent ? (
                  <ReactMarkdown
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
          setSpeeches((prev) => [...prev, row as SpeechRow]);
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


