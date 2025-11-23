/**
 * Cache Manager
 * Handles client-side cache clearing, versioning, and automatic invalidation
 */

const CACHE_VERSION_KEY = 'flowtusk_cache_version';
const CACHE_CLEARED_AT_KEY = 'flowtusk_cache_cleared_at';
const CURRENT_CACHE_VERSION = 'v2'; // Increment when schema changes
const STALE_CACHE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Clear all client-side caches (Zustand stores + localStorage)
 */
export async function clearAllClientCaches(): Promise<void> {
  try {
    // Clear Zustand stores
    const { useFlowStore, useChatStore, useCopilotStore } = await import('@/lib/stores');
    
    useFlowStore.getState().clearFlows();
    useChatStore.getState().clearMessages();
    useCopilotStore.getState().reset();
    
    // Clear localStorage keys
    const keysToRemove = [
      'flowtusk-flows',
      'flowtusk_conversations',
      'flowtusk_active_conversation',
      'last_icps_response',
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Update cache metadata
    localStorage.setItem(CACHE_CLEARED_AT_KEY, Date.now().toString());
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    
    console.log('✅ [CacheManager] All client caches cleared');
  } catch (error) {
    console.error('❌ [CacheManager] Error clearing caches:', error);
  }
}

/**
 * Check if cache is stale and needs clearing
 */
export function isCacheStale(): boolean {
  const clearedAt = localStorage.getItem(CACHE_CLEARED_AT_KEY);
  if (!clearedAt) return true;
  
  const age = Date.now() - parseInt(clearedAt, 10);
  return age > STALE_CACHE_THRESHOLD_MS;
}

/**
 * Check if cache version is outdated
 */
export function isCacheVersionOutdated(): boolean {
  const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
  return storedVersion !== CURRENT_CACHE_VERSION;
}

/**
 * Initialize cache management - checks version and staleness, clears if needed
 * Call this on app mount
 */
export async function initializeCache(): Promise<void> {
  const versionOutdated = isCacheVersionOutdated();
  const stale = isCacheStale();
  
  if (versionOutdated || stale) {
    console.log('🧹 [CacheManager] Cache is outdated or stale, clearing...', {
      versionOutdated,
      stale,
      currentVersion: CURRENT_CACHE_VERSION,
    });
    
    await clearAllClientCaches();
  } else {
    // Ensure version is set even if cache is fresh
    if (!localStorage.getItem(CACHE_VERSION_KEY)) {
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    }
    console.log('✅ [CacheManager] Cache is fresh');
  }
}

/**
 * Clear server-side caches via API
 */
export async function clearServerCaches(): Promise<{ success: boolean; data?: any }> {
  try {
    const response = await fetch('/api/admin/clear-cache', { method: 'POST' });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ [CacheManager] Server caches cleared:', data);
      return { success: true, data };
    } else {
      console.error('❌ [CacheManager] Failed to clear server caches:', data);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ [CacheManager] Error clearing server caches:', error);
    return { success: false };
  }
}

/**
 * Clear everything (client + server)
 */
export async function clearAllCaches(): Promise<void> {
  await Promise.all([
    clearAllClientCaches(),
    clearServerCaches(),
  ]);
}

/**
 * Invalidate cache for a specific flow (useful after mutations)
 */
export function invalidateFlowCache(flowId?: string): void {
  // Clear chat messages (they're flow-specific)
  import('@/lib/stores').then(({ useChatStore }) => {
    useChatStore.getState().clearMessages();
  });
  
  // If specific flow, could clear just that flow's data
  // For now, we clear all to be safe
  if (flowId) {
    console.log(`🔄 [CacheManager] Invalidating cache for flow ${flowId.slice(0, 8)}`);
  }
}

