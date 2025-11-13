/**
 * Quality Scorer
 * 
 * Multi-dimensional quality evaluation for AI-generated content.
 * Checks evidence presence, generic phrases, quantification, and fact validity.
 */

import type { FactsJSON } from './prompt-templates';
import { validateEvidence, extractAllFactIds } from './evidence-validator';

export interface QualityScore {
  totalScore: number; // 0-1 overall quality score
  grade: 'A' | 'B' | 'C' | 'F'; // Letter grade
  breakdown: {
    hasEvidence: number; // 0 or 1
    evidenceCount: number; // 0-1 based on citation count
    noGenerics: number; // 0 or 1
    hasMetrics: number; // 0 or 1
    evidenceValid: number; // 0 or 1
  };
  issues: string[]; // List of specific problems found
  details: {
    citationCount: number;
    genericPhrasesFound: string[];
    metricsFound: boolean;
    invalidFactIds: string[];
  };
}

// Comprehensive blocklist of generic marketing phrases
const GENERIC_PHRASES = [
  'use social media',
  'leverage technology',
  'increase efficiency',
  'streamline operations',
  'best practices',
  'synergy',
  'robust solution',
  'cutting edge',
  'state of the art',
  'world class',
  'industry leading',
  'next generation',
  'innovative solution',
  'scalable platform',
  'seamless integration',
  'empower',
  'revolutionize',
  'transform your business',
  'take your business to the next level',
  'unlock potential',
  'drive growth',
  'maximize roi',
  'optimize performance',
  'boost productivity',
  'enhance collaboration',
  'improve communication',
];

/**
 * Detects generic marketing phrases in text
 */
function detectGenericPhrases(text: string): string[] {
  const lowerText = text.toLowerCase();
  return GENERIC_PHRASES.filter(phrase => lowerText.includes(phrase));
}

/**
 * Checks if text contains quantified metrics or specific numbers
 * Looks for percentages, multipliers, time savings, etc.
 */
function hasMetrics(text: string): boolean {
  // Patterns for metrics:
  // - Percentages: 40%, 2.5%
  // - Multipliers: 2x, 10x
  // - Time savings: save 10 hours, reduce 40 minutes
  // - Numbers with impact: $10k, 1000 users, 50 clients
  const metricPatterns = [
    /\d+\.?\d*%/i, // 40%, 2.5%
    /\d+\.?\d*x/i, // 2x, 10x
    /save\s+\d+/i, // save 10 hours
    /reduce\s+\d+/i, // reduce 40 minutes
    /\d+\s*(hours?|minutes?|days?|weeks?|months?)/i, // time units
    /\$\d+[km]?/i, // $10k, $1m
    /\d+\s*(users?|clients?|customers?|employees?)/i, // user counts
    /increase.*\d+/i, // increase by 50
    /decrease.*\d+/i, // decrease by 30
    /grow.*\d+/i, // grow 200%
  ];
  
  return metricPatterns.some(pattern => pattern.test(text));
}

/**
 * Calculates a quality score for generated content
 * 
 * @param output - The generated content (value prop, email, etc.)
 * @param facts - The Facts JSON with available facts
 * @returns QualityScore with 0-1 score, grade, breakdown, and issues
 */
export function scoreOutput(
  output: any,
  facts: FactsJSON
): QualityScore {
  // Extract text content from various output formats
  const text = extractText(output);
  
  // Extract all fact IDs from output
  const sourceFactIds = extractAllFactIds(output);
  
  // Run evidence validation
  const evidenceValidation = validateEvidence(sourceFactIds, facts.facts);
  
  // Detect generic phrases
  const genericsFound = detectGenericPhrases(text);
  
  // Check for metrics
  const metricsPresent = hasMetrics(text);
  
  // Build score breakdown
  const breakdown = {
    hasEvidence: sourceFactIds.length > 0 ? 1 : 0,
    evidenceCount: calculateEvidenceScore(sourceFactIds.length),
    noGenerics: genericsFound.length === 0 ? 1 : 0,
    hasMetrics: metricsPresent ? 1 : 0,
    evidenceValid: evidenceValidation.isValid ? 1 : 0,
  };
  
  // Calculate total score (weighted average)
  const weights = {
    hasEvidence: 0.25,
    evidenceCount: 0.2,
    noGenerics: 0.2,
    hasMetrics: 0.15,
    evidenceValid: 0.2,
  };
  
  const totalScore = 
    breakdown.hasEvidence * weights.hasEvidence +
    breakdown.evidenceCount * weights.evidenceCount +
    breakdown.noGenerics * weights.noGenerics +
    breakdown.hasMetrics * weights.hasMetrics +
    breakdown.evidenceValid * weights.evidenceValid;
  
  // Determine grade
  const grade = calculateGrade(totalScore);
  
  // Build issues list
  const issues: string[] = [];
  if (!breakdown.hasEvidence) {
    issues.push('Missing evidence citations (sourceFactIds)');
  }
  if (breakdown.evidenceCount < 0.5) {
    issues.push(`Low citation count (${sourceFactIds.length} facts cited, aim for 3+)`);
  }
  if (!breakdown.noGenerics) {
    issues.push(`Contains generic phrases: ${genericsFound.slice(0, 2).join(', ')}${genericsFound.length > 2 ? '...' : ''}`);
  }
  if (!breakdown.hasMetrics) {
    issues.push('Missing quantified metrics (%, time savings, etc.)');
  }
  if (!breakdown.evidenceValid) {
    issues.push(`Invalid fact IDs cited: ${evidenceValidation.missingFactIds.join(', ')}`);
  }
  
  return {
    totalScore,
    grade,
    breakdown,
    issues,
    details: {
      citationCount: sourceFactIds.length,
      genericPhrasesFound: genericsFound,
      metricsFound: metricsPresent,
      invalidFactIds: evidenceValidation.missingFactIds,
    },
  };
}

/**
 * Extract text content from various output formats
 */
function extractText(output: any): string {
  if (typeof output === 'string') {
    return output;
  }
  
  const texts: string[] = [];
  
  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    
    // Common text fields
    const textFields = ['text', 'body', 'content', 'subject', 'description'];
    textFields.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string') {
        texts.push(obj[field]);
      }
    });
    
    // Recurse
    Object.values(obj).forEach(traverse);
  }
  
  traverse(output);
  return texts.join(' ');
}

/**
 * Calculate evidence score based on citation count
 * 3+ citations = 1.0, scales down below that
 */
function calculateEvidenceScore(citationCount: number): number {
  if (citationCount === 0) return 0;
  if (citationCount >= 3) return 1;
  return citationCount / 3; // Linear scale: 1 fact = 0.33, 2 facts = 0.67
}

/**
 * Convert numeric score to letter grade
 */
function calculateGrade(score: number): 'A' | 'B' | 'C' | 'F' {
  if (score >= 0.8) return 'A';
  if (score >= 0.6) return 'B';
  if (score >= 0.4) return 'C';
  return 'F';
}

/**
 * Score multiple items (e.g., email sequence, value prop variations)
 * Returns aggregate score
 */
export function scoreMultipleOutputs(
  outputs: any[],
  facts: FactsJSON
): QualityScore {
  if (outputs.length === 0) {
    return {
      totalScore: 0,
      grade: 'F',
      breakdown: {
        hasEvidence: 0,
        evidenceCount: 0,
        noGenerics: 0,
        hasMetrics: 0,
        evidenceValid: 0,
      },
      issues: ['No outputs to score'],
      details: {
        citationCount: 0,
        genericPhrasesFound: [],
        metricsFound: false,
        invalidFactIds: [],
      },
    };
  }
  
  // Score each output
  const scores = outputs.map(output => scoreOutput(output, facts));
  
  // Aggregate scores
  const avgScore = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;
  
  // Aggregate breakdown
  const avgBreakdown = {
    hasEvidence: scores.reduce((sum, s) => sum + s.breakdown.hasEvidence, 0) / scores.length,
    evidenceCount: scores.reduce((sum, s) => sum + s.breakdown.evidenceCount, 0) / scores.length,
    noGenerics: scores.reduce((sum, s) => sum + s.breakdown.noGenerics, 0) / scores.length,
    hasMetrics: scores.reduce((sum, s) => sum + s.breakdown.hasMetrics, 0) / scores.length,
    evidenceValid: scores.reduce((sum, s) => sum + s.breakdown.evidenceValid, 0) / scores.length,
  };
  
  // Aggregate issues (unique)
  const allIssues = new Set<string>();
  scores.forEach(s => s.issues.forEach(issue => allIssues.add(issue)));
  
  // Aggregate details
  const totalCitations = scores.reduce((sum, s) => sum + s.details.citationCount, 0);
  const allGenerics = new Set<string>();
  scores.forEach(s => s.details.genericPhrasesFound.forEach(g => allGenerics.add(g)));
  const anyMetrics = scores.some(s => s.details.metricsFound);
  const allInvalidIds = new Set<string>();
  scores.forEach(s => s.details.invalidFactIds.forEach(id => allInvalidIds.add(id)));
  
  return {
    totalScore: avgScore,
    grade: calculateGrade(avgScore),
    breakdown: avgBreakdown,
    issues: Array.from(allIssues),
    details: {
      citationCount: totalCitations,
      genericPhrasesFound: Array.from(allGenerics),
      metricsFound: anyMetrics,
      invalidFactIds: Array.from(allInvalidIds),
    },
  };
}

/**
 * Quick check if output needs improvement (score < 0.6)
 */
export function needsImprovement(score: QualityScore): boolean {
  return score.totalScore < 0.6;
}

/**
 * Generate improvement prompt based on quality issues
 */
export function generateImprovementPrompt(score: QualityScore): string {
  if (score.issues.length === 0) {
    return '';
  }
  
  const prompt = `
QUALITY IMPROVEMENTS NEEDED:
${score.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

REQUIREMENTS:
- Cite 3+ sourceFactIds from the provided facts
- Include specific metrics (percentages, time savings, quantified results)
- Avoid generic phrases like "leverage", "streamline", "best practices"
- Ground every claim in the provided facts
- Be specific and actionable

Return STRICTLY valid JSON with improved content.`;
  
  return prompt;
}

