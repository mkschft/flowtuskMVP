/**
 * Evaluation Metrics Tracker
 * 
 * Singleton pattern for tracking quality metrics across generation sessions.
 * Aggregates evidence citation rates, validation pass rates, and quality scores.
 */

import type { QualityScore } from './quality-scorer';

export interface GenerationMetric {
  timestamp: number;
  operation: string;
  validationPassed: boolean;
  repairAttempted: boolean;
  qualityScore: QualityScore;
  evidenceCount: number;
  model?: string;
}

export interface AggregateMetrics {
  evidenceCitationRate: number; // % of outputs with evidence
  avgFactsPerOutput: number; // Average citation count
  validationPassRate: number; // % passing validation first try
  repairSuccessRate: number; // % fixed by auto-repair
  avgQualityScore: number; // Average quality score
  totalGenerations: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    F: number;
  };
}

/**
 * Singleton tracker for quality metrics
 */
class EvalTracker {
  private static instance: EvalTracker;
  private metrics: GenerationMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 generations in memory

  private constructor() {}

  static getInstance(): EvalTracker {
    if (!EvalTracker.instance) {
      EvalTracker.instance = new EvalTracker();
    }
    return EvalTracker.instance;
  }

  /**
   * Track a generation event
   */
  track(metric: GenerationMetric): void {
    this.metrics.push(metric);
    
    // Trim old metrics if over limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log for monitoring
    console.log(`📊 [Eval Tracker] ${metric.operation} - Quality: ${metric.qualityScore.grade} (${(metric.qualityScore.totalScore * 100).toFixed(0)}%), Evidence: ${metric.evidenceCount} facts`);
  }

  /**
   * Get aggregate metrics across all tracked generations
   */
  getAggregateMetrics(): AggregateMetrics {
    if (this.metrics.length === 0) {
      return {
        evidenceCitationRate: 0,
        avgFactsPerOutput: 0,
        validationPassRate: 0,
        repairSuccessRate: 0,
        avgQualityScore: 0,
        totalGenerations: 0,
        gradeDistribution: { A: 0, B: 0, C: 0, F: 0 },
      };
    }

    const total = this.metrics.length;
    
    // Evidence citation rate
    const withEvidence = this.metrics.filter(m => m.evidenceCount > 0).length;
    const evidenceCitationRate = withEvidence / total;
    
    // Average facts per output
    const totalFacts = this.metrics.reduce((sum, m) => sum + m.evidenceCount, 0);
    const avgFactsPerOutput = totalFacts / total;
    
    // Validation pass rate (first attempt)
    const passedFirstTry = this.metrics.filter(m => m.validationPassed && !m.repairAttempted).length;
    const validationPassRate = passedFirstTry / total;
    
    // Repair success rate
    const repairAttempts = this.metrics.filter(m => m.repairAttempted).length;
    const repairSuccesses = this.metrics.filter(m => m.repairAttempted && m.validationPassed).length;
    const repairSuccessRate = repairAttempts > 0 ? repairSuccesses / repairAttempts : 1;
    
    // Average quality score
    const totalQuality = this.metrics.reduce((sum, m) => sum + m.qualityScore.totalScore, 0);
    const avgQualityScore = totalQuality / total;
    
    // Grade distribution
    const gradeDistribution = {
      A: this.metrics.filter(m => m.qualityScore.grade === 'A').length,
      B: this.metrics.filter(m => m.qualityScore.grade === 'B').length,
      C: this.metrics.filter(m => m.qualityScore.grade === 'C').length,
      F: this.metrics.filter(m => m.qualityScore.grade === 'F').length,
    };

    return {
      evidenceCitationRate,
      avgFactsPerOutput,
      validationPassRate,
      repairSuccessRate,
      avgQualityScore,
      totalGenerations: total,
      gradeDistribution,
    };
  }

  /**
   * Get metrics for specific operation type
   */
  getMetricsForOperation(operation: string): AggregateMetrics {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    
    // Temporarily swap metrics
    const originalMetrics = this.metrics;
    this.metrics = operationMetrics;
    const result = this.getAggregateMetrics();
    this.metrics = originalMetrics;
    
    return result;
  }

  /**
   * Get recent metrics (last N generations)
   */
  getRecentMetrics(count: number = 10): GenerationMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all tracked metrics (useful for testing)
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get summary for logging/debugging
   */
  getSummary(): string {
    const agg = this.getAggregateMetrics();
    
    return `
📊 Quality Metrics Summary
─────────────────────────────
Total Generations: ${agg.totalGenerations}
Avg Quality Score: ${(agg.avgQualityScore * 100).toFixed(1)}%
Evidence Citation Rate: ${(agg.evidenceCitationRate * 100).toFixed(1)}%
Avg Facts/Output: ${agg.avgFactsPerOutput.toFixed(1)}
Validation Pass Rate: ${(agg.validationPassRate * 100).toFixed(1)}%
Repair Success Rate: ${(agg.repairSuccessRate * 100).toFixed(1)}%

Grade Distribution:
  A: ${agg.gradeDistribution.A} (${((agg.gradeDistribution.A / agg.totalGenerations) * 100).toFixed(1)}%)
  B: ${agg.gradeDistribution.B} (${((agg.gradeDistribution.B / agg.totalGenerations) * 100).toFixed(1)}%)
  C: ${agg.gradeDistribution.C} (${((agg.gradeDistribution.C / agg.totalGenerations) * 100).toFixed(1)}%)
  F: ${agg.gradeDistribution.F} (${((agg.gradeDistribution.F / agg.totalGenerations) * 100).toFixed(1)}%)
`;
  }
}

// Export singleton instance
export const evalTracker = EvalTracker.getInstance();

// Export class for testing
export { EvalTracker };

