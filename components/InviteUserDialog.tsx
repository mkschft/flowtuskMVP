"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2, XCircle } from "lucide-react";

interface InviteUserDialogProps {
  children?: React.ReactNode;
}

export function InviteUserDialog({ children }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to send invitation");
        return;
      }

      setStatus("success");
      setMessage(`Invitation sent to ${email}`);
      setEmail("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error sending invitation:", error);
      setStatus("error");
      setMessage("An error occurred while sending the invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to join Flowtusk. The invitation will expire in 7 days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>{message}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEmail("");
                setStatus("idle");
                setMessage("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

