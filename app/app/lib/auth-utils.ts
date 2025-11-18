/**
 * Auth utilities for app workspace
 * Handles authentication, DB health checks, and initialization
 */

import { createClient } from "@/lib/supabase/client";
import { needsMigration } from "@/lib/migrate-local-to-db";
import type { Conversation } from "@/app/app/types";
import { loadFlowsFromDB, loadFromLocalStorage } from "./db-utils";

export interface AuthState {
  user: any;
  isAuthenticated: boolean;
  dbConnectionHealthy: boolean;
  dbSyncEnabled: boolean;
  showMigrationPrompt: boolean;
}

/**
 * Test Supabase connection health
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('positioning_flows').select('id').limit(1);
    if (error) {
      console.error('❌ [DB Health] Supabase connection FAILED:', error);
      return false;
    }
    console.log('✅ [DB Health] Supabase connection OK');
    return true;
  } catch (err) {
    console.error('❌ [DB Health] Supabase connection FAILED:', err);
    return false;
  }
}

/**
 * Check authentication and initialize app state
 */
export async function checkAuthAndLoadFlows(): Promise<{
  conversations: Conversation[];
  activeId: string | null;
  authState: AuthState;
}> {
  try {
    // Check auth
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    // Demo mode bypass
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED === 'true';
    
    if (!authUser && !isDemoMode) {
      console.log('🔒 [Auth] Not authenticated, redirecting to login');
      window.location.href = '/auth/login';
      throw new Error('Not authenticated');
    }
    
    console.log('✅ [Auth] User authenticated or demo mode');
    
    // Test DB connection before proceeding
    const isHealthy = await testSupabaseConnection();
    
    if (!isHealthy) {
      console.warn('⚠️ [DB Health] Connection failed, falling back to localStorage');
      const { conversations, activeId } = loadFromLocalStorage();
      return {
        conversations,
        activeId,
        authState: {
          user: authUser,
          isAuthenticated: !!authUser || isDemoMode,
          dbConnectionHealthy: false,
          dbSyncEnabled: false,
          showMigrationPrompt: false,
        }
      };
    }
    
    // Check if migration needed
    if (needsMigration()) {
      console.log('📦 [Migration] LocalStorage data detected');
      const { conversations, activeId } = loadFromLocalStorage();
      return {
        conversations,
        activeId,
        authState: {
          user: authUser,
          isAuthenticated: !!authUser || isDemoMode,
          dbConnectionHealthy: true,
          dbSyncEnabled: true,
          showMigrationPrompt: true,
        }
      };
    }
    
    // Load flows from DB
    if (authUser) {
      console.log('🔵 [DB Sync] ENABLED - Loading from Supabase');
      const conversations = await loadFlowsFromDB();
      const activeId = conversations.length > 0 ? conversations[0].id : null;
      
      return {
        conversations,
        activeId,
        authState: {
          user: authUser,
          isAuthenticated: true,
          dbConnectionHealthy: true,
          dbSyncEnabled: true,
          showMigrationPrompt: false,
        }
      };
    } else {
      console.log('📦 [Storage] Using localStorage (demo mode)');
      const { conversations, activeId } = loadFromLocalStorage();
      return {
        conversations,
        activeId,
        authState: {
          user: null,
          isAuthenticated: isDemoMode,
          dbConnectionHealthy: true,
          dbSyncEnabled: false,
          showMigrationPrompt: false,
        }
      };
    }
  } catch (error) {
    console.error('❌ [Init] Failed to initialize:', error);
    // Fallback to localStorage
    const { conversations, activeId } = loadFromLocalStorage();
    return {
      conversations,
      activeId,
      authState: {
        user: null,
        isAuthenticated: false,
        dbConnectionHealthy: false,
        dbSyncEnabled: false,
        showMigrationPrompt: false,
      }
    };
  }
}
