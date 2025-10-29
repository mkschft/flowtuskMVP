"use client";

import React from "react";
import { FileText, User, MessageSquare } from "lucide-react";
import { ChatChips } from "./ChatChips";

/**
 * LinkedInTypeChoice - LinkedIn format selector
 *
 * Allows user to choose between:
 * - Post (single LinkedIn post)
 * - Profile Bio (first-person bio)
 * - InMail (outreach message)
 */

export type LinkedInType = "post" | "profile_bio" | "inmail";

interface LinkedInTypeChoiceProps {
  onSelect: (type: LinkedInType) => void;
  className?: string;
}

export function LinkedInTypeChoice({ onSelect, className }: LinkedInTypeChoiceProps) {
  const chips = [
    {
      id: "post",
      label: "Post",
      icon: <FileText className="h-4 w-4" />,
      description: "Single LinkedIn post with hashtags",
    },
    {
      id: "profile_bio",
      label: "Profile Bio",
      icon: <User className="h-4 w-4" />,
      description: "First-person bio with capabilities",
    },
    {
      id: "inmail",
      label: "InMail",
      icon: <MessageSquare className="h-4 w-4" />,
      description: "60-120 word outreach message",
    },
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">What type of LinkedIn content?</h3>
        <p className="text-sm text-muted-foreground">
          Choose the format you need
        </p>
      </div>

      <ChatChips
        chips={chips}
        onSelect={(id) => onSelect(id as LinkedInType)}
        size="md"
      />
    </div>
  );
}
