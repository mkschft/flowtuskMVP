"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation link");
      return;
    }

    const acceptInvitation = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // First, check if invitation exists and get the email
          const inviteResponse = await fetch(`/api/invitations/check?token=${token}`);
          const inviteData = await inviteResponse.json();

          if (inviteResponse.ok && inviteData.invitation) {
            // Redirect to sign-up with pre-filled email and token
            // If user already has account, Supabase will show error and they can click login
            router.push(`/auth/sign-up?token=${token}&email=${encodeURIComponent(inviteData.invitation.email)}`);
          } else {
            // Invalid token, show error
            setStatus("error");
            setMessage(inviteData.error || "Invalid invitation link");
          }
          return;
        }

        // Accept the invitation
        const response = await fetch("/api/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Failed to accept invitation");
          return;
        }

        setStatus("success");
        setMessage("Invitation accepted successfully!");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push("/u");
        }, 2000);
      } catch (error) {
        console.error("Error accepting invitation:", error);
        setStatus("error");
        setMessage("An error occurred while accepting the invitation");
      }
    };

    acceptInvitation();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            {status === "loading" && "Processing your invitation..."}
            {status === "success" && "Welcome to Flowtusk!"}
            {status === "error" && "Unable to accept invitation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-8 w-8 text-green-500 mb-4" />
              <p className="text-sm text-center">{message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-sm text-center text-destructive">{message}</p>
              <Button
                onClick={() => router.push("/auth/login")}
                className="mt-4"
                variant="outline"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accept Invitation</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Please wait...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

