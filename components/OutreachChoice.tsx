"use client";

import React from "react";
import { Mail, Linkedin } from "lucide-react";
import { ChatChips } from "./ChatChips";

/**
 * OutreachChoice - Email vs LinkedIn selector
 *
 * Displays after value prop generation to ask user
 * where they want to deploy the messaging.
 */

interface OutreachChoiceProps {
  onSelect: (choice: "email" | "linkedin") => void;
  className?: string;
}

export function OutreachChoice({ onSelect, className }: OutreachChoiceProps) {
  const chips = [
    {
      id: "email",
      label: "Email",
      icon: <Mail className="h-4 w-4" />,
      description: "Create email campaigns and sequences",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      description: "Generate LinkedIn outreach content",
    },
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Where do you want to use this?</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to reach your audience
        </p>
      </div>

      <ChatChips
        chips={chips}
        onSelect={(id) => onSelect(id as "email" | "linkedin")}
        size="lg"
      />
    </div>
  );
}
