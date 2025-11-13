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
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  // Only load speeches from initialSpeeches on mount, not on prop updates
  // After mount, speeches are only updated via onNewSpeech callback (no refetch)
  // Using lazy initializer to ensure initialSpeeches is only used once
  const [speeches, setSpeeches] = useState<SpeechRow[]>(() => initialSpeeches || []);
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<string>(""); // Status message like "thinking", "scraping data..."
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [hideComposer, setHideComposer] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Clear streaming content when a new AI speech is added to the array
  // This ensures the speech is visible before clearing streaming content
  useEffect(() => {
    if (streamingContent && !isAILoading) {
      // Check if there's a recent AI speech (added in last 2 seconds) in the array
      // This is more reliable than content matching since content might have slight differences
      const now = Date.now();
      const hasRecentAISpeech = speeches.some((s) => {
        if (s.author) return false; // Only check AI speeches
        const speechTime = new Date(s.created_at).getTime();
        const timeDiff = now - speechTime;
        // If speech was added in last 2 seconds and we have streaming content, clear it
        return timeDiff < 2000 && timeDiff >= 0;
      });
      if (hasRecentAISpeech) {
        // Recent AI speech is now in the array, safe to clear streaming content
        setStreamingContent("");
      }
    }
  }, [speeches, streamingContent, isAILoading]);

  // Handle ICP selection
  const handleICPSelect = async (icpData: { personaName: string; title: string; [key: string]: any }) => {
    setHideComposer(true);

    // Find or get the ICP id from database
    let personaId: string | null = null;
    try {
      const supabase = createClient();
      const { data: icps, error } = await supabase
        .from("icps")
        .select("id")
        .eq("parent_flow", flowId)
        .eq("persona_name", icpData.personaName)
        .eq("title", icpData.title)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && icps && icps.length > 0) {
        personaId = icps[0].id;
      }
    } catch (error) {
      console.error("Failed to find ICP:", error);
    }

    // Create the card content as a component JSON
    const cardContent = `<component>${JSON.stringify({
      type: "persona-created-card",
      props: {
        personaName: icpData.personaName,
        personaId: personaId,
      },
    })}</component>`;

    // Save as speech
    try {
      const createResp = await fetch("/api/create-ai-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: cardContent,
          flowId: flowId,
          modelCode: "gpt-4o-mini",
        }),
      });
      if (createResp.ok) {
        const aiSpeech = await createResp.json();
        setSpeeches((prev) => [...prev, {
          id: aiSpeech.id,
          content: aiSpeech.content,
          author: null,
          model_id: aiSpeech.model_id,
          created_at: aiSpeech.created_at,
        }]);
      }
    } catch (error) {
      console.error("Failed to save persona card:", error);
    }
  };

  // Check if there's a persona card in speeches to hide composer
  useEffect(() => {
    const hasPersonaCard = speeches.some(s => 
      s.content.includes('persona-created-card') && !s.author
    );
    setHideComposer(hasPersonaCard);
  }, [speeches]);

  const handlePersonaWorkflows = (personaId?: string) => {
    if (personaId) {
      // Store the current flowId in localStorage so we can navigate back
      if (flowId) {
        localStorage.setItem("workflows_source_flow", flowId);
      }
      router.push(`/w/${personaId}`);
    } else {
      console.error("No persona ID available for navigation");
    }
  };

  const handlePersonaRestart = async () => {
    // Find the persona card speech
    const personaCardSpeech = speeches.find(s => 
      s.content.includes('persona-created-card') && !s.author
    );

    if (personaCardSpeech) {
      // Delete from database
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("speech")
          .delete()
          .eq("id", personaCardSpeech.id);

        if (error) {
          console.error("Failed to delete persona card speech:", error);
        }
      } catch (error) {
        console.error("Error deleting persona card speech:", error);
      }

      // Remove from local state
      setSpeeches((prev) => prev.filter(s => s.id !== personaCardSpeech.id));
    }

    // Show composer again
    setHideComposer(false);
  };

  const handleSiteProceed = async (url: string, siteId: string, flowId?: string) => {
    setIsAILoading(true);
    setStreamingContent("");
    setAiStatus("Scraping website...");

    try {
      // Re-scrape the website and update the site entry
      const scrapeResp = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url,
          flowId: flowId || undefined,
          forceRescrape: true,
          siteId // Pass siteId to update existing entry
        }),
      });

      if (!scrapeResp.ok) {
        throw new Error("Failed to scrape website");
      }

      // After scraping, trigger AI response generation
      setAiStatus("Generating response...");
      const aiResp = await fetch("/api/generate-ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze this website and generate ICPs: ${url}`,
          flowId: flowId || undefined,
        }),
      });

      if (!aiResp.ok) {
        throw new Error("Failed to generate AI response");
      }

      // Stream the response
      const reader = aiResp.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          // Filter out STATUS: lines
          while (true) {
            const statusMatch = buffer.match(/STATUS:([^\n]*)/);
            if (!statusMatch) break;

            const status = statusMatch[1].trim();
            if (status) {
              setAiStatus(status);
            }
            buffer = buffer.replace(/STATUS:[^\n]*\n?/, "");
          }

          // Process remaining buffer content (excluding STATUS: lines)
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("STATUS:") && !line.includes("STATUS:")) {
              accumulatedContent += line + "\n";
            }
          }

          // Update streaming content (filtered)
          const filteredContent = accumulatedContent
            .replace(/STATUS:[^\n]*\n?/g, "")
            .replace(/STATUS:[^\n]*/g, "")
            .replace(/STATUS:/g, "");
          setStreamingContent(filteredContent);
        }

        // Process remaining buffer
        const remainingBuffer = buffer
          .replace(/STATUS:[^\n]*\n?/g, "")
          .replace(/STATUS:[^\n]*/g, "")
          .trim();
        if (remainingBuffer && !remainingBuffer.includes("STATUS:")) {
          accumulatedContent += remainingBuffer;
        }
      }

      // Save final response (clean STATUS: messages)
      const cleanedContent = accumulatedContent
        .replace(/STATUS:[^\n]*\n?/g, "")
        .replace(/STATUS:[^\n]*/g, "")
        .replace(/STATUS:/g, "")
        .trim();

      if (cleanedContent && flowId) {
        const createResp = await fetch("/api/create-ai-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: cleanedContent,
            flowId: flowId,
            modelCode: "gpt-4o-mini",
          }),
        });

        if (createResp.ok) {
          const aiSpeech = await createResp.json();
          setSpeeches((prev) => [...prev, {
            id: aiSpeech.id,
            content: aiSpeech.content,
            author: null,
            model_id: aiSpeech.model_id,
            created_at: aiSpeech.created_at,
          }]);
        }
      }

      setStreamingContent("");
    } catch (error) {
      console.error("Failed to proceed with scraping:", error);
      setStreamingContent("Failed to scrape website. Please try again.");
    } finally {
      setIsAILoading(false);
      setAiStatus("");
    }
  };

  const handleSiteUseSaved = async (siteId: string, flowId?: string) => {
    setIsAILoading(true);
    setStreamingContent("");
    setAiStatus("Loading saved data...");

    try {
      // Fetch saved site data from Supabase
      const supabase = createClient();
      const { data: site, error: siteError } = await supabase
        .from("sites")
        .select("*")
        .eq("id", siteId)
        .single();

      if (siteError || !site) {
        throw new Error("Failed to fetch saved site data");
      }

      // Generate AI response using saved site data
      setAiStatus("Generating response from saved data...");
      const aiResp = await fetch("/api/generate-ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate company overview and ICPs from this saved website data: ${site.url}`,
          flowId: flowId || undefined,
          savedSiteData: {
            content: site.content || "",
            facts_json: site.facts_json || {},
            title: site.title || null,
            description: site.description || null,
            summary: site.summary || null,
            url: site.url,
          },
        }),
      });

      if (!aiResp.ok) {
        throw new Error("Failed to generate AI response");
      }

      // Stream the response
      const reader = aiResp.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          // Filter out STATUS: lines
          while (true) {
            const statusMatch = buffer.match(/STATUS:([^\n]*)/);
            if (!statusMatch) break;

            const status = statusMatch[1].trim();
            if (status) {
              setAiStatus(status);
            }
            buffer = buffer.replace(/STATUS:[^\n]*\n?/, "");
          }

          // Process remaining buffer content (excluding STATUS: lines)
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith("STATUS:") && !line.includes("STATUS:")) {
              accumulatedContent += line + "\n";
            }
          }

          // Update streaming content (filtered)
          const filteredContent = accumulatedContent
            .replace(/STATUS:[^\n]*\n?/g, "")
            .replace(/STATUS:[^\n]*/g, "")
            .replace(/STATUS:/g, "");
          setStreamingContent(filteredContent);
        }

        // Process remaining buffer
        const remainingBuffer = buffer
          .replace(/STATUS:[^\n]*\n?/g, "")
          .replace(/STATUS:[^\n]*/g, "")
          .trim();
        if (remainingBuffer && !remainingBuffer.includes("STATUS:")) {
          accumulatedContent += remainingBuffer;
        }
      }

      // Save final response (clean STATUS: messages)
      const cleanedContent = accumulatedContent
        .replace(/STATUS:[^\n]*\n?/g, "")
        .replace(/STATUS:[^\n]*/g, "")
        .replace(/STATUS:/g, "")
        .trim();

      if (cleanedContent && flowId) {
        const createResp = await fetch("/api/create-ai-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: cleanedContent,
            flowId: flowId,
            modelCode: "gpt-4o-mini",
          }),
        });

        if (createResp.ok) {
          const aiSpeech = await createResp.json();
          setSpeeches((prev) => [...prev, {
            id: aiSpeech.id,
            content: aiSpeech.content,
            author: null,
            model_id: aiSpeech.model_id,
            created_at: aiSpeech.created_at,
          }]);
        }
      }

      setStreamingContent("");
    } catch (error) {
      console.error("Failed to use saved data:", error);
      setStreamingContent("Failed to load saved data. Please try again.");
    } finally {
      setIsAILoading(false);
      setAiStatus("");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-5xl p-4 space-y-4">
          {speeches.map((s) => {
            // User message if author is set and matches current user, AI message if model_id is set
            const isUser = s.author && currentUserId && s.author === currentUserId;
            
            // Check if AI response needs full width (has components or large content)
            const needsFullWidth = !isUser && (
              s.content.includes("<component>") ||
              s.content.length > 500 ||
              s.content.includes("\n\n\n") || // Multiple line breaks suggest large content
              s.content.match(/^#{1,3}\s/m) // Has markdown headers
            );
            
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
                <div className={`rounded-md border p-3 text-sm [&_*]:break-words ${
                  isUser ? "w-fit max-w-2xl" : needsFullWidth ? "w-full" : "w-fit max-w-2xl"
                }`}>
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
                    <ResponseRenderer 
                      content={s.content} 
                      flowId={flowId}
                      onICPSelect={handleICPSelect}
                      onPersonaWorkflows={handlePersonaWorkflows}
                      onPersonaRestart={handlePersonaRestart}
                      onSiteProceed={handleSiteProceed}
                      onSiteUseSaved={handleSiteUseSaved}
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
              <div className={`rounded-md border p-3 text-sm [&_*]:break-words ${
                streamingContent && (
                  streamingContent.includes("<component>") ||
                  streamingContent.length > 500 ||
                  streamingContent.includes("\n\n\n") ||
                  streamingContent.match(/^#{1,3}\s/m)
                ) ? "w-full" : streamingContent ? "w-fit max-w-2xl" : "w-full"
              } ${streamingContent ? "" : streamingContent || showSkeletons ? "" : "flex items-center gap-2"}`}>
                {streamingContent ? (
                  <ResponseRenderer 
                    content={streamingContent} 
                    flowId={flowId}
                    onICPSelect={handleICPSelect}
                    onPersonaWorkflows={handlePersonaWorkflows}
                    onPersonaRestart={handlePersonaRestart}
                    onSiteProceed={handleSiteProceed}
                    onSiteUseSaved={handleSiteUseSaved}
                  />
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
      {!hideComposer && (
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
            // If this is a temp speech, just add it (optimistic update)
            if (row.id.startsWith("temp-")) {
              return [...prev, speechRow];
            }

            // For real speeches (saved to DB), check if we need to replace a temp one
            // For user messages: match by author and content (exact match)
            // For AI messages: match by model_id (AI messages don't have author)
            const tempIndex = prev.findIndex((s) => {
              if (!s.id.startsWith("temp-")) return false;
              if (speechRow.author) {
                // User message: match by author and exact content
                return s.author === speechRow.author && 
                       s.content.trim() === speechRow.content.trim();
              } else {
                // AI message: match by model_id (both should have it)
                return s.model_id && speechRow.model_id && s.model_id === speechRow.model_id;
              }
            });

            if (tempIndex !== -1) {
              // Replace temp speech with real one (this prevents duplicates)
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

            // Check if content already exists (to prevent duplicates from DB refetch)
            // Only for non-temp speeches that might have been loaded from DB
            // For AI responses, be more lenient - only check by ID to avoid false positives
            // from content matching (which might have slight differences)
            if (speechRow.author) {
              // User message: check by content and author
              const contentExists = prev.some((s) => 
                !s.id.startsWith("temp-") && 
                s.content.trim() === speechRow.content.trim() &&
                s.author === speechRow.author
              );
              if (contentExists) {
                // Don't add duplicate - it's already in the list
                return prev;
              }
            } else {
              // AI message: only check by ID (already done above) or model_id + recent timestamp
              // Don't do content-based duplicate check for AI as content might have slight differences
              // The ID check above is sufficient
            }

            // New speech, add it (this is for AI responses that don't have a temp version)
            return [...prev, speechRow];
          });
        }}
        onLoadingChange={(loading) => {
          setIsAILoading(loading);
          // Don't clear streaming content when loading stops - keep it visible
          // The content is saved to DB and will persist on refresh
        }}
        onStreamingContent={setStreamingContent}
        onStatusChange={setAiStatus}
        />
      )}
    </div>
  );
}


