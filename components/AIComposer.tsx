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
};

export function AIComposer({ flowId, onNewSpeech, onLoadingChange, onInputChange, onStreamingContent }: AIComposerProps) {
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
                // Generate inexpensive title via API (fallback to first line)
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
                const { data: newFlow, error: flowErr } = await supabase
                    .from("flows")
                    .insert({ title, author: userId })
                    .select()
                    .single();

                if (flowErr || !newFlow) throw flowErr || new Error("Failed to create flow");

                const { data: createdSpeech, error: speechErr } = await supabase
                    .from("speech")
                    .insert({ content, parent_flow: newFlow.id, author: userId, context: {} })
                    .select()
                    .single();

                if (speechErr) throw speechErr;

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
                        fullResponse += chunk;
                        onStreamingContent?.(fullResponse);
                    }

                    // Save to database only after streaming is complete
                    if (fullResponse.trim()) {
                        const createResp = await fetch("/api/create-ai-speech", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                content: fullResponse.trim(),
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

                router.push(`/app/${newFlow.id}`);
                return;
            }

            // Existing flow: just create a speech under it
            const { data: createdSpeech, error: speechErr } = await supabase
                .from("speech")
                .insert({ content, parent_flow: flowId, author: userId, context: {} })
                .select()
                .single();

            if (speechErr) throw speechErr;
            onNewSpeech?.(createdSpeech as any);
            onLoadingChange?.(true);

            // Generate AI response and stream it
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

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullResponse += chunk;
                    onStreamingContent?.(fullResponse);
                }

                // Save to database only after streaming is complete
                if (fullResponse.trim()) {
                    const createResp = await fetch("/api/create-ai-speech", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            content: fullResponse.trim(),
                            flowId: flowId,
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


