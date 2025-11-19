/**
 * Scraping Cache Layer
 * 
 * Caches website scraping results to prevent redundant API calls.
 * Uses in-memory cache for development and could be extended to Redis/DB for production.
 */

import crypto from 'crypto';

interface CachedScrape {
  url: string;
  content: string;
  metadata: {
    title?: string;
    description?: string;
    url: string;
    heroImage?: string | null;
  };
  factsJson?: any;
  timestamp: number;
  source: string;
}

// In-memory cache (will be cleared on server restart)
// For production, consider using Redis or a database table
const scrapeCache = new Map<string, CachedScrape>();

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate cache key from URL (normalized)
 */
function getCacheKey(url: string): string {
  // Normalize URL: lowercase, remove trailing slash, remove protocol
  const normalized = url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  
  // Hash for consistent key length
  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CachedScrape): boolean {
  const age = Date.now() - entry.timestamp;
  return age < CACHE_TTL_MS;
}

/**
 * Get cached scrape result if available and valid
 */
export function getCachedScrape(url: string): CachedScrape | null {
  const key = getCacheKey(url);
  const cached = scrapeCache.get(key);
  
  if (!cached) {
    console.log('📦 [Cache] Miss for:', url);
    return null;
  }
  
  if (!isCacheValid(cached)) {
    console.log('⏰ [Cache] Expired for:', url);
    scrapeCache.delete(key);
    return null;
  }
  
  const ageHours = Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60));
  console.log(`✅ [Cache] Hit for: ${url} (age: ${ageHours}h)`);
  return cached;
}

/**
 * Store scrape result in cache
 */
export function setCachedScrape(
  url: string,
  content: string,
  metadata: CachedScrape['metadata'],
  factsJson?: any,
  source: string = 'jina'
): void {
  const key = getCacheKey(url);
  
  const entry: CachedScrape = {
    url,
    content,
    metadata,
    factsJson,
    timestamp: Date.now(),
    source,
  };
  
  scrapeCache.set(key, entry);
  console.log(`💾 [Cache] Stored: ${url} (size: ${content.length} chars)`);
  
  // Optional: Limit cache size to prevent memory bloat
  if (scrapeCache.size > 1000) {
    // Remove oldest entry
    const oldestKey = Array.from(scrapeCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
    
    if (oldestKey) {
      scrapeCache.delete(oldestKey);
      console.log('🧹 [Cache] Evicted oldest entry (cache size limit reached)');
    }
  }
}

/**
 * Clear all cached scrapes (useful for testing)
 */
export function clearScrapeCache(): void {
  scrapeCache.clear();
  console.log('🗑️ [Cache] Cleared all entries');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const entries = Array.from(scrapeCache.values());
  const totalSize = entries.reduce((sum, e) => sum + e.content.length, 0);
  const avgAge = entries.length > 0
    ? entries.reduce((sum, e) => sum + (Date.now() - e.timestamp), 0) / entries.length
    : 0;
  
  return {
    entries: scrapeCache.size,
    totalSizeBytes: totalSize,
    avgAgeHours: Math.round(avgAge / (1000 * 60 * 60)),
  };
}
