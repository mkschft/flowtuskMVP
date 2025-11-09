"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ICPCard } from "@/components/ICPCard";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Sparkles, FileText } from "lucide-react";

interface ICPResponseProps {
  icpData: {
    personaName: string;
    personaRole: string;
    personaCompany: string;
    location: string;
    country: string;
    title: string;
    description: string;
    painPoints: string[];
    fitScore?: number;
    profilesFound?: number;
  };
  websiteUrl?: string;
  flowId?: string;
  onActionClick?: (action: string, icpData: any) => void;
}

export function ICPResponse({ icpData, websiteUrl, flowId, onActionClick }: ICPResponseProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (action: string) => {
    if (onActionClick) {
      onActionClick(action, icpData);
      return;
    }

    if (!flowId) {
      console.error("Flow ID is required for actions");
      return;
    }

    setLoadingAction(action);
    try {
      // Create a message that triggers the tool
      const actionMessages: Record<string, string> = {
        generate_value_prop: `Generate value propositions for this ICP: ${icpData.title}`,
        generate_email_sequence: `Generate an email sequence for ${icpData.title}`,
        generate_linkedin_outreach: `Generate LinkedIn outreach content for ${icpData.title}`,
        generate_one_time_email: `Generate a one-time email for ${icpData.title}`,
      };

      const message = actionMessages[action] || `Generate ${action} for ${icpData.title}`;

      // Submit the action as a user message to trigger the AI tool
      // We'll create a speech entry and then trigger AI response
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create user speech
      const { data: userSpeech, error: speechError } = await supabase
        .from("speech")
        .insert({
          content: message,
          parent_flow: flowId,
          author: user.id,
          context: { icp: icpData, websiteUrl, action },
        })
        .select()
        .single();

      if (speechError) {
        throw speechError;
      }

      // Trigger AI response
      const response = await fetch("/api/generate-ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          flowId: flowId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

      // Reload to show the new response
      router.refresh();
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
    } finally {
      setLoadingAction(null);
    }
  };

  const actions = [
    {
      id: "generate_value_prop",
      label: "Generate Value Prop",
      icon: Sparkles,
      description: "Create value propositions for this ICP",
    },
    {
      id: "generate_email_sequence",
      label: "Email Sequence",
      icon: Mail,
      description: "Generate email outreach sequence",
    },
    {
      id: "generate_linkedin_outreach",
      label: "LinkedIn Outreach",
      icon: Linkedin,
      description: "Create LinkedIn outreach content",
    },
    {
      id: "generate_one_time_email",
      label: "One-Time Email",
      icon: FileText,
      description: "Generate a single email",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ICP Card */}
      <ICPCard {...icpData} />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isLoading = loadingAction === action.id;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleAction(action.id)}
              disabled={isLoading}
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Icon className="size-4 mr-2" />
              {isLoading ? "Generating..." : action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

