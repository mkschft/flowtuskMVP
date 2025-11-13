"use client";

import { useEffect, useState } from "react";
import { InviteUserDialog } from "@/components/InviteUserDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Invitation } from "@/lib/types/database";
import { Mail, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "expired">("all");

  useEffect(() => {
    fetchInvitations();
  }, [statusFilter]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === "all" 
        ? "/api/invitations/list"
        : `/api/invitations/list?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Invitation["status"], expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date() && status === "pending";
    
    if (isExpired) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Expired</Badge>;
    }

    switch (status) {
      case "pending":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
      case "expired":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Expired</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Invitations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user invitations to Flowtusk
            </p>
          </div>
          <InviteUserDialog />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "accepted" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("accepted")}
          >
            Accepted
          </Button>
          <Button
            variant={statusFilter === "expired" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("expired")}
          >
            Expired
          </Button>
        </div>

        {/* Invitations list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invitations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No invitations found</CardTitle>
              <CardDescription>
                {statusFilter === "all"
                  ? "Get started by inviting a user"
                  : `No ${statusFilter} invitations`}
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{invitation.email}</CardTitle>
                      <CardDescription className="mt-1">
                        Sent {formatDateTime(invitation.created_at)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(invitation.status, invitation.expires_at)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Expires {formatDate(invitation.expires_at)}
                        </span>
                      </div>
                      {invitation.accepted_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            Accepted {formatDate(invitation.accepted_at)}
                          </span>
                        </div>
                      )}
                    </div>
                    {invitation.status === "pending" && (
                      <div className="text-xs text-muted-foreground">
                        Will be accepted when {invitation.email} logs in
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

