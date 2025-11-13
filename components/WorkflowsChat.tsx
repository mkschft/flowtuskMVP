"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUp, User, Bot, ArrowLeft } from "lucide-react";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export function WorkflowsChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceFlowId, setSourceFlowId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Read the flowId from localStorage
    const storedFlowId = localStorage.getItem("workflows_source_flow");
    setSourceFlowId(storedFlowId);
  }, []);

  const handleBack = () => {
    if (sourceFlowId) {
      router.push(`/u/flows/${sourceFlowId}`);
    } else {
      router.push("/u/prospects");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: "This is a placeholder response. Connect this to your chat API to get real responses.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

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
      <ScrollArea className="flex-1 p-4">
        <div className={messages.length === 0 ? "flex items-center justify-center h-full min-h-[400px]" : "space-y-4"}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center text-center text-muted-foreground">
              <div className="space-y-2">
                <p className="text-sm">No Activity yet</p>
                {/* <p className="text-xs">Create Persona targeted campaigns, run analysis, etc.</p> */}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }
                  >
                    {message.role === "user" ? (
                      <User className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg border p-3 max-w-[80%] ${message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-muted">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg border p-3 bg-muted">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Create a style guide . . ."
            className="h-[60px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 h-[60px] w-[60px]"
            disabled={!input.trim() || isLoading}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

