"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AIComposerProps = {
    flowId?: string;
    onNewSpeech?: (speech?: { id: string; content: string; author: string; parent_flow: string; created_at?: string }) => void;
    onLoadingChange?: (loading: boolean) => void;
    onInputChange?: (hasValue: boolean) => void;
    onStreamingContent?: (content: string) => void;
    onStatusChange?: (status: string) => void;
};

export function AIComposer({ flowId, onNewSpeech, onLoadingChange, onInputChange, onStreamingContent, onStatusChange }: AIComposerProps) {
    const [value, setValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    async function handleSubmit() {
        const content = value.trim();
        if (!content || submitting) return;
        setSubmitting(true);

        try {
            const supabase = createClient();
            const { data: userRes } = await supabase.auth.getUser();
            const userId = userRes.user?.id;
            if (!userId) {
                setSubmitting(false);
                return;
            }

            // Create flow (if needed) then create speech
            if (!flowId) {
                // Step 1: Show user message instantly (optimistic update)
                const tempUserSpeech = {
                    id: `temp-${Date.now()}`,
                    content,
                    author: userId,
                    parent_flow: "", // Will be set after flow creation
                    created_at: new Date().toISOString(),
                };
                onNewSpeech?.(tempUserSpeech as any);

                // Step 2: Generate inexpensive title via API (fallback to first line)
                let title = content.split("\n")[0].slice(0, 60) || "New Flow";
                try {
                    const resp = await fetch("/api/generate-title", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content }),
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data?.title) title = data.title;
                    }
                } catch { }

                // Step 3: Create flow
                const { data: newFlow, error: flowErr } = await supabase
                    .from("flows")
                    .insert({ title, author: userId })
                    .select()
                    .single();

                if (flowErr || !newFlow) throw flowErr || new Error("Failed to create flow");

                // Step 4: Save user speech to database
                const { data: createdSpeech, error: speechErr } = await supabase
                    .from("speech")
                    .insert({ content, parent_flow: newFlow.id, author: userId, context: {} })
                    .select()
                    .single();

                if (speechErr) throw speechErr;

                // Step 5: Replace temp speech with real one
                onNewSpeech?.(createdSpeech as any);
                setValue("");
                onLoadingChange?.(true);

                // Generate AI response and stream it
                try {
                    const aiResp = await fetch("/api/generate-ai-response", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: content, flowId: newFlow.id }),
                    });

                    if (!aiResp.ok || !aiResp.body) {
                        throw new Error("Failed to start streaming");
                    }

                    const reader = aiResp.body.getReader();
                    const decoder = new TextDecoder();
                    let fullResponse = "";

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        // Filter out STATUS: lines immediately
                        const filteredChunk = chunk.replace(/STATUS:[^\n]*\n?/g, "").replace(/STATUS:[^\n]*/g, "");
                        fullResponse += filteredChunk;
                        onStreamingContent?.(fullResponse);
                    }

                    // Final cleanup: remove any STATUS: lines that might have slipped through
                    const cleanedResponse = fullResponse
                        .replace(/STATUS:[^\n]*\n?/g, "")
                        .replace(/STATUS:[^\n]*/g, "")
                        .replace(/STATUS:Thinking/g, "")
                        .replace(/STATUS:Scraping data/g, "")
                        .replace(/STATUS:Generating response/g, "")
                        .replace(/STATUS:/g, "")
                        .trim();

                    // Save to database only after streaming is complete
                    if (cleanedResponse) {
                        const createResp = await fetch("/api/create-ai-speech", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: cleanedResponse,
                                flowId: newFlow.id,
                                modelCode: "gpt-4o-mini",
                            }),
                        });
                        if (createResp.ok) {
                            const aiSpeech = await createResp.json();
                            onNewSpeech?.(aiSpeech as any);
                            onStreamingContent?.("");
                        } else {
                            const errorData = await createResp.json();
                            console.error("Failed to create AI speech:", errorData);
                        }
                    }
                } catch (aiError) {
                    console.error("Failed to generate AI response:", aiError);
                } finally {
                    onLoadingChange?.(false);
                }

                router.push(`/flow/${newFlow.id}`);
                return;
            }

            // Existing flow: show user message first, then save, then generate AI response
            // Step 1: Show user message optimistically (temporary ID)
            const tempUserSpeech = {
                id: `temp-${Date.now()}`,
                content,
                author: userId,
                parent_flow: flowId,
                created_at: new Date().toISOString(),
            };
            onNewSpeech?.(tempUserSpeech as any);

            // Step 2: Save user speech to database
            const { data: createdSpeech, error: speechErr } = await supabase
                .from("speech")
                .insert({ content, parent_flow: flowId, author: userId, context: {} })
                .select()
                .single();

            if (speechErr) throw speechErr;

            // Step 3: Replace temp speech with real one
            onNewSpeech?.(createdSpeech as any);
            onLoadingChange?.(true);
            onStatusChange?.("Thinking");

            // Step 4: Generate AI response with status updates
            try {
                const aiResp = await fetch("/api/generate-ai-response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: content, flowId: flowId }),
                });

                if (!aiResp.ok || !aiResp.body) {
                    throw new Error("Failed to start streaming");
                }

                const reader = aiResp.body.getReader();
                const decoder = new TextDecoder();
                let fullResponse = "";
                let tempAiSpeechId: string | null = null;

                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    // Remove ALL STATUS: lines from buffer (handle multiple in one chunk)
                    let statusFound = false;
                    while (true) {
                        const statusMatch = buffer.match(/STATUS:([^\n]*)/);
                        if (!statusMatch) break;

                        const status = statusMatch[1].trim();
                        if (status) {
                            onStatusChange?.(status);
                            statusFound = true;
                        }
                        // Remove the status line from buffer (including newline if present)
                        buffer = buffer.replace(/STATUS:[^\n]*\n?/, "");
                    }

                    // If we found a status, continue to process remaining buffer
                    if (statusFound) {
                        continue;
                    }

                    // If buffer has newline, process content up to newline
                    const newlineIndex = buffer.indexOf("\n");
                    if (newlineIndex !== -1) {
                        const line = buffer.substring(0, newlineIndex);
                        buffer = buffer.substring(newlineIndex + 1);

                        // Skip status lines (including empty STATUS:)
                        if (!line.startsWith("STATUS:") && !line.includes("STATUS:")) {
                            fullResponse += line + "\n";
                            onStreamingContent?.(fullResponse);
                        }
                    }
                }

                // Process any remaining buffer content (make sure to filter out ALL STATUS: lines)
                // Remove any remaining STATUS: lines - be very aggressive with filtering
                buffer = buffer.replace(/STATUS:[^\n]*\n?/g, "");
                buffer = buffer.replace(/STATUS:[^\n]*/g, ""); // Also catch without newline
                const remainingBuffer = buffer.trim();
                if (remainingBuffer && !remainingBuffer.includes("STATUS:")) {
                    fullResponse += remainingBuffer;
                    onStreamingContent?.(fullResponse);
                }

                // Step 5: Save AI response to database after it's been shown
                // Final cleanup: remove any STATUS: lines that might have slipped through - be very aggressive
                let cleanedResponse = fullResponse
                    .replace(/STATUS:[^\n]*\n?/g, "") // Remove STATUS: lines with newline
                    .replace(/STATUS:[^\n]*/g, "") // Remove STATUS: lines without newline
                    .replace(/STATUS:Thinking/g, "") // Remove specific status messages
                    .replace(/STATUS:Scraping data/g, "") // Remove specific status messages
                    .replace(/STATUS:Generating response/g, "") // Remove specific status messages
                    .replace(/STATUS:/g, "") // Remove any remaining STATUS: prefix
                    .trim();
                if (cleanedResponse) {
                    const createResp = await fetch("/api/create-ai-speech", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            content: cleanedResponse,
                            flowId: flowId,
                            modelCode: "gpt-4o-mini",
                        }),
                    });
                    if (createResp.ok) {
                        const aiSpeech = await createResp.json();
                        // Add real AI speech to chat (replaces streaming content)
                        onNewSpeech?.(aiSpeech as any);
                        onStreamingContent?.("");
                        onStatusChange?.("");
                    } else {
                        const errorData = await createResp.json();
                        console.error("Failed to create AI speech:", errorData);
                    }
                }
            } catch (aiError) {
                console.error("Failed to generate AI response:", aiError);
                onStatusChange?.("");
            } finally {
                onLoadingChange?.(false);
                onStatusChange?.("");
            }

            setValue("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="border-t bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/60">
            <form
                className="mx-auto flex w-full max-w-5xl items-end gap-2 p-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit();
                }}
            >
                <Textarea
                    placeholder="Enter a website URL to analyse..."
                    className="min-h-[56px] resize-none"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        onInputChange?.(e.target.value.trim().length > 0);
                    }}
                    disabled={submitting}
                />
                <Button type="submit" aria-label="Send" className="h-10 w-10 shrink-0 rounded-full p-0 flex items-center justify-center" disabled={submitting}>
                    {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <ArrowUp className="size-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}


