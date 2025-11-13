"use client";

import { useEffect } from "react";

export function AutoAcceptInvitations() {
  useEffect(() => {
    // Auto-accept any pending invitations when user loads the dashboard
    const autoAccept = async () => {
      try {
        const response = await fetch("/api/invitations/auto-accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.accepted) {
          console.log("Auto-accepted invitation:", data);
        } else if (data.message) {
          console.log("Auto-accept result:", data.message);
        }
      } catch (error) {
        // Silently fail - this is a best-effort operation
        console.error("Error auto-accepting invitations:", error);
      }
    };

    // Small delay to ensure auth is ready
    const timer = setTimeout(autoAccept, 500);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}

