/**
 * Quality Logger
 * 
 * Async logging of quality metrics to Supabase.
 * Fire-and-forget pattern - doesn't block generation on log failures.
 */

import { createClient } from '@/lib/supabase/server';
import type { QualityScore } from './quality-scorer';

export interface QualityLogEntry {
  operation: string;
  model: string;
  validation_passed: boolean;
  repair_attempted: boolean;
  quality_score: number;
  evidence_count: number;
  issues: string[];
  metadata?: Record<string, any>;
}

/**
 * Log quality metrics to Supabase (async, non-blocking)
 * 
 * @param entry - Quality log entry to persist
 */
export async function logQuality(entry: QualityLogEntry): Promise<void> {
  // Fire-and-forget pattern - don't block on failures
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('generation_quality_logs')
      .insert({
        operation: entry.operation,
        model: entry.model,
        validation_passed: entry.validation_passed,
        repair_attempted: entry.repair_attempted,
        quality_score: entry.quality_score,
        evidence_count: entry.evidence_count,
        issues: entry.issues,
        metadata: entry.metadata || {},
      });
    
    if (error) {
      // Log error but don't throw - logging failures shouldn't break generation
      console.warn('⚠️ [Quality Logger] Failed to log to DB:', error.message);
    } else {
      console.log(`✅ [Quality Logger] Logged ${entry.operation} (score: ${(entry.quality_score * 100).toFixed(0)}%)`);
    }
  } catch (error) {
    // Catch any errors to prevent breaking the main flow
    console.warn('⚠️ [Quality Logger] Unexpected error:', error);
  }
}

/**
 * Helper to create log entry from quality score and context
 */
export function createLogEntry(
  operation: string,
  model: string,
  qualityScore: QualityScore,
  validationPassed: boolean,
  repairAttempted: boolean,
  metadata?: Record<string, any>
): QualityLogEntry {
  return {
    operation,
    model,
    validation_passed: validationPassed,
    repair_attempted: repairAttempted,
    quality_score: qualityScore.totalScore,
    evidence_count: qualityScore.details.citationCount,
    issues: qualityScore.issues,
    metadata,
  };
}

/**
 * Batch log multiple entries (for sequences)
 */
export async function logQualityBatch(entries: QualityLogEntry[]): Promise<void> {
  if (entries.length === 0) return;
  
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('generation_quality_logs')
      .insert(entries.map(entry => ({
        operation: entry.operation,
        model: entry.model,
        validation_passed: entry.validation_passed,
        repair_attempted: entry.repair_attempted,
        quality_score: entry.quality_score,
        evidence_count: entry.evidence_count,
        issues: entry.issues,
        metadata: entry.metadata || {},
      })));
    
    if (error) {
      console.warn('⚠️ [Quality Logger] Failed to batch log to DB:', error.message);
    } else {
      console.log(`✅ [Quality Logger] Batch logged ${entries.length} entries`);
    }
  } catch (error) {
    console.warn('⚠️ [Quality Logger] Unexpected error in batch log:', error);
  }
}

/**
 * Query recent quality logs for analytics
 */
export async function getRecentQualityLogs(
  limit: number = 100,
  operation?: string
): Promise<any[]> {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('generation_quality_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (operation) {
      query = query.eq('operation', operation);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ [Quality Logger] Failed to query logs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ [Quality Logger] Unexpected error querying logs:', error);
    return [];
  }
}

/**
 * Get aggregate statistics from logged data
 */
export async function getQualityStatistics(
  operation?: string,
  days: number = 7
): Promise<{
  avgQualityScore: number;
  avgEvidenceCount: number;
  validationPassRate: number;
  totalLogs: number;
}> {
  try {
    const supabase = await createClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let query = supabase
      .from('generation_quality_logs')
      .select('*')
      .gte('created_at', cutoffDate.toISOString());
    
    if (operation) {
      query = query.eq('operation', operation);
    }
    
    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      return {
        avgQualityScore: 0,
        avgEvidenceCount: 0,
        validationPassRate: 0,
        totalLogs: 0,
      };
    }
    
    const totalLogs = data.length;
    const avgQualityScore = data.reduce((sum, log) => sum + (log.quality_score || 0), 0) / totalLogs;
    const avgEvidenceCount = data.reduce((sum, log) => sum + (log.evidence_count || 0), 0) / totalLogs;
    const validationPassed = data.filter(log => log.validation_passed).length;
    const validationPassRate = validationPassed / totalLogs;
    
    return {
      avgQualityScore,
      avgEvidenceCount,
      validationPassRate,
      totalLogs,
    };
  } catch (error) {
    console.error('❌ [Quality Logger] Unexpected error getting statistics:', error);
    return {
      avgQualityScore: 0,
      avgEvidenceCount: 0,
      validationPassRate: 0,
      totalLogs: 0,
    };
  }
}

