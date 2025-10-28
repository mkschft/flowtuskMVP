"use client";

import React from "react";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  // Simple markdown renderer - just render as plain text for now
  // In a real app, you'd use a proper markdown library like react-markdown
  return (
    <div className={className}>
      {children}
    </div>
  );
}
