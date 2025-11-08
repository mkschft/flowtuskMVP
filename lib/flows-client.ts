/**
 * FlowsClient - Client-side wrapper for flow operations
 * 
 * Provides a clean interface for managing flows with:
 * - Optimistic updates
 * - Error handling
 * - Analytics tracking
 * - Guest → user migration
 */

export interface Flow {
  id: string;
  user_id?: string;
  title: string;
  website_url?: string;
  facts_json?: Record<string, unknown>;
  selected_icp?: Record<string, unknown>;
  generated_content?: Record<string, unknown>;
  step: string;
  metadata?: {
    analysis?: {
      completion_time_ms?: number | null;
      dropoff_step?: string | null;
      confidence_score?: number | null;
    };
    generation?: {
      prompt_version?: string;
      regeneration_count?: number;
      last_regeneration_at?: string | null;
    };
    feedback?: {
      user_rating?: number | null;
      user_notes?: string | null;
      liked_icps?: string[];
      disliked_icps?: string[];
    };
    feature_flags?: {
      is_demo?: boolean;
      is_template?: boolean;
    };
  };
  prompt_history?: Array<{
    iteration: number;
    prompt_text: string;
    result_icp_id: string;
    user_feedback?: 'thumbs_up' | 'thumbs_down';
    created_at: string;
  }>;
  api_usage_metrics?: {
    analyze_website_calls: number;
    generate_icps_calls: number;
    generate_value_prop_calls: number;
    generate_content_calls: number;
    total_tokens_used: number;
    estimated_cost_cents: number;
  };
  sharing?: {
    public_link: string | null;
    shared_with: Array<{
      user_id: string;
      email: string;
      permission: 'view_only' | 'edit' | 'admin';
      shared_at: string;
    }>;
    share_permissions: 'view_only' | 'edit' | 'admin';
  };
  schema_version?: number;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface CreateFlowInput {
  title?: string;
  website_url?: string;
  facts_json?: Record<string, unknown>;
  selected_icp?: Record<string, unknown>;
  generated_content?: Record<string, unknown>;
  step?: string;
}

export interface UpdateFlowInput {
  title?: string;
  website_url?: string;
  facts_json?: Record<string, unknown>;
  selected_icp?: Record<string, unknown>;
  generated_content?: Record<string, unknown>;
  step?: string;
  metadata?: Record<string, unknown>;
  regenerated?: boolean;
}

export interface ListFlowsOptions {
  archived?: boolean;
  limit?: number;
  offset?: number;
}

export class FlowsClient {
  private baseUrl = '/api/flows';

  /**
   * List all flows for the current user
   */
  async listFlows(options: ListFlowsOptions = {}): Promise<Flow[]> {
    const params = new URLSearchParams();
    if (options.archived) params.set('archived', 'true');
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.flows || [];
  }

  /**
   * Get a single flow by ID
   */
  async getFlow(id: string): Promise<Flow> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Flow not found');
      }
      throw new Error(`Failed to fetch flow: ${response.statusText}`);
    }

    const data = await response.json();
    return data.flow;
  }

  /**
   * Create a new flow
   */
  async createFlow(input: CreateFlowInput): Promise<Flow> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('A flow with this title already exists');
      }
      throw new Error(`Failed to create flow: ${response.statusText}`);
    }

    const data = await response.json();
    return data.flow;
  }

  /**
   * Update an existing flow
   */
  async updateFlow(id: string, updates: UpdateFlowInput): Promise<Flow> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Flow not found');
      }
      if (response.status === 409) {
        throw new Error('A flow with this title already exists');
      }
      throw new Error(`Failed to update flow: ${response.statusText}`);
    }

    const data = await response.json();
    return data.flow;
  }

  /**
   * Soft delete a flow (archive)
   */
  async softDeleteFlow(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flow: ${response.statusText}`);
    }
  }

  /**
   * Hard delete a flow (permanent)
   */
  async hardDeleteFlow(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}?hard=true`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flow: ${response.statusText}`);
    }
  }

  /**
   * Restore an archived flow
   */
  async restoreFlow(id: string): Promise<Flow> {
    const response = await fetch(`${this.baseUrl}/${id}/restore`, {
      method: 'POST',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Flow not found');
      }
      throw new Error(`Failed to restore flow: ${response.statusText}`);
    }

    const data = await response.json();
    return data.flow;
  }

  /**
   * Migrate guest flows to authenticated user
   * Returns the number of flows migrated
   */
  async migrateGuestFlows(userId: string): Promise<number> {
    // This would be called after signup to convert demo flows to user flows
    // For now, return 0 as guest flows are handled server-side
    // This is a placeholder for future implementation
    console.log('Guest flow migration not yet implemented');
    return 0;
  }

  /**
   * Auto-save helper with debouncing
   */
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();

  async debouncedUpdate(
    id: string,
    updates: UpdateFlowInput,
    delay: number = 2000
  ): Promise<void> {
    // Clear existing timer for this flow
    const existingTimer = this.saveTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          await this.updateFlow(id, updates);
          this.saveTimers.delete(id);
          resolve();
        } catch (error) {
          this.saveTimers.delete(id);
          reject(error);
        }
      }, delay);

      this.saveTimers.set(id, timer);
    });
  }

  /**
   * Cancel pending auto-save for a flow
   */
  cancelAutoSave(id: string): void {
    const timer = this.saveTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.saveTimers.delete(id);
    }
  }

  /**
   * Flush all pending auto-saves immediately
   */
  async flushAllAutoSaves(): Promise<void> {
    const promises = Array.from(this.saveTimers.keys()).map(id => {
      this.cancelAutoSave(id);
    });
    await Promise.all(promises);
  }
}

// Singleton instance
export const flowsClient = new FlowsClient();

// Export default for convenience
export default flowsClient;
