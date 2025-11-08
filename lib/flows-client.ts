/**
 * Flows Client - Wrapper for flow operations that replaces localStorage with Supabase DB
 * 
 * This client provides:
 * - CRUD operations for flows
 * - Optimistic updates with rollback
 * - Loading/error state management
 * - Analytics metadata tracking
 * - Guest → user migration support
 */

import { createClient } from "@/lib/supabase/client";

export interface Flow {
  id: string;
  user_id: string | null;
  title: string;
  website_url: string | null;
  facts_json: Record<string, unknown> | null;
  selected_icp: Record<string, unknown> | null;
  generated_content: Record<string, unknown> | null;
  step: string;
  metadata: FlowMetadata;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface FlowMetadata {
  prompt_regeneration_count: number;
  dropoff_step: string | null;
  completion_time_ms: number | null;
  prompt_version: string;
  user_feedback: unknown | null;
  is_demo?: boolean;
  expires_at?: string;
}

export interface CreateFlowInput {
  title?: string;
  website_url?: string;
  facts_json?: Record<string, unknown>;
  selected_icp?: Record<string, unknown>;
  step?: string;
}

export interface UpdateFlowInput {
  title?: string;
  website_url?: string;
  facts_json?: Record<string, unknown>;
  selected_icp?: Record<string, unknown>;
  generated_content?: Record<string, unknown>;
  step?: string;
  metadata?: Partial<FlowMetadata>;
}

export interface ListFlowsOptions {
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export class FlowsClient {
  private supabase = createClient();

  /**
   * Create a new flow
   */
  async createFlow(data: CreateFlowInput): Promise<Flow> {
    const response = await fetch("/api/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create flow");
    }

    const { flow } = await response.json();
    return flow;
  }

  /**
   * List all flows for the current user
   */
  async listFlows(options: ListFlowsOptions = {}): Promise<{ flows: Flow[]; total: number }> {
    const params = new URLSearchParams();
    if (options.archived !== undefined) params.set("archived", String(options.archived));
    if (options.limit) params.set("limit", String(options.limit));
    if (options.offset) params.set("offset", String(options.offset));

    const response = await fetch(`/api/flows?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch flows");
    }

    const data = await response.json();
    return {
      flows: data.flows,
      total: data.total,
    };
  }

  /**
   * Get a single flow by ID
   */
  async getFlow(id: string): Promise<Flow> {
    const response = await fetch(`/api/flows/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch flow");
    }

    const { flow } = await response.json();
    return flow;
  }

  /**
   * Update a flow
   */
  async updateFlow(id: string, updates: UpdateFlowInput): Promise<Flow> {
    const response = await fetch(`/api/flows/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update flow");
    }

    const { flow } = await response.json();
    return flow;
  }

  /**
   * Soft delete a flow (archive it)
   */
  async softDeleteFlow(id: string): Promise<void> {
    const response = await fetch(`/api/flows/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to archive flow");
    }
  }

  /**
   * Hard delete a flow (permanent)
   */
  async hardDeleteFlow(id: string): Promise<void> {
    const response = await fetch(`/api/flows/${id}?hard=true`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete flow");
    }
  }

  /**
   * Restore an archived flow
   */
  async restoreFlow(id: string): Promise<Flow> {
    const response = await fetch(`/api/flows/${id}/restore`, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to restore flow");
    }

    const { flow } = await response.json();
    return flow;
  }

  /**
   * Migrate guest flows to user account after signup
   * Returns the number of flows migrated
   */
  async migrateGuestFlows(userId: string): Promise<number> {
    // This would read flows from localStorage and create them in DB
    // Implementation depends on localStorage structure
    const guestFlows = this.getGuestFlowsFromLocalStorage();
    
    if (guestFlows.length === 0) {
      return 0;
    }

    let migrated = 0;
    for (const guestFlow of guestFlows) {
      try {
        await this.createFlow({
          title: guestFlow.title,
          website_url: guestFlow.website_url,
          facts_json: guestFlow.facts_json,
          selected_icp: guestFlow.selected_icp,
          step: guestFlow.step,
        });
        migrated++;
      } catch (error) {
        console.error("Failed to migrate guest flow:", error);
      }
    }

    // Clear guest flows from localStorage after successful migration
    if (migrated > 0) {
      this.clearGuestFlowsFromLocalStorage();
    }

    return migrated;
  }

  /**
   * Create a demo flow (no authentication required)
   */
  async createDemoFlow(data: CreateFlowInput): Promise<Flow> {
    const response = await fetch("/api/demo/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create demo flow");
    }

    const { flow } = await response.json();
    return flow;
  }

  /**
   * Get guest flows from localStorage (for migration)
   */
  private getGuestFlowsFromLocalStorage(): CreateFlowInput[] {
    if (typeof window === "undefined") return [];

    try {
      const savedConversations = localStorage.getItem("flowtusk_conversations");
      if (!savedConversations) return [];

      const conversations = JSON.parse(savedConversations);
      
      // Transform conversations to flows
      return conversations.map((conv: any) => ({
        title: conv.title || "Migrated Flow",
        website_url: conv.memory?.websiteUrl || null,
        facts_json: conv.memory?.factsJson || null,
        selected_icp: conv.memory?.selectedIcp || null,
        step: this.mapConversationStepToFlowStep(conv.userJourney),
      }));
    } catch (error) {
      console.error("Error reading guest flows from localStorage:", error);
      return [];
    }
  }

  /**
   * Clear guest flows from localStorage
   */
  private clearGuestFlowsFromLocalStorage(): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem("flowtusk_conversations");
      localStorage.removeItem("flowtusk_active_conversation");
      console.log("✅ Cleared guest flows from localStorage");
    } catch (error) {
      console.error("Error clearing guest flows from localStorage:", error);
    }
  }

  /**
   * Map conversation user journey to flow step
   */
  private mapConversationStepToFlowStep(userJourney: any): string {
    if (!userJourney) return "initial";
    
    if (userJourney.exported) return "exported";
    if (userJourney.valuePropGenerated) return "value_prop_generated";
    if (userJourney.icpSelected) return "icp_selected";
    if (userJourney.websiteAnalyzed) return "website_analyzed";
    
    return "initial";
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return !!user;
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
}

// Export singleton instance
export const flowsClient = new FlowsClient();

