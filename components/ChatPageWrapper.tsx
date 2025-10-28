"use client";

import dynamic from "next/dynamic";

// Dynamically import the chat page (client component)
const ChatPage = dynamic(() => import("@/app/app/page"), { ssr: false });

export function ChatPageWrapper() {
  return <ChatPage />;
}
