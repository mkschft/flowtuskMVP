import { NextResponse } from 'next/server';
import { clearScrapeCache, getCacheStats } from '@/lib/scrape-cache';
import { generationManager } from '@/lib/managers/generation-manager';

/**
 * Admin endpoint to clear all in-memory caches
 * Clears:
 * - Scrape cache (website scraping results)
 * - Generation manager cache (AI generation results)
 */
export async function POST() {
  try {
    // Get stats before clearing
    const scrapeStats = getCacheStats();
    const generationStats = generationManager.getStats();

    // Clear all caches
    clearScrapeCache();
    generationManager.clearCache();

    return NextResponse.json({
      success: true,
      message: 'All caches cleared',
      cleared: {
        scrapeCache: {
          entries: scrapeStats.entries,
          totalSizeBytes: scrapeStats.totalSizeBytes,
        },
        generationCache: generationStats,
      },
      cacheVersion: 'v2', // Current cache version
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check cache status
 */
export async function GET() {
  try {
    const scrapeStats = getCacheStats();
    const generationStats = generationManager.getStats();

    return NextResponse.json({
      scrapeCache: scrapeStats,
      generationCache: generationStats,
      cacheVersion: 'v2',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

