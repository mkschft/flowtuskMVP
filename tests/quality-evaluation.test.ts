/**
 * Quality Evaluation System Tests
 * 
 * Tests for evidence validation, quality scoring, and metrics tracking.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateEvidence, extractAllFactIds, validateEvidenceAcrossItems } from '@/lib/evidence-validator';
import { scoreOutput, scoreMultipleOutputs, needsImprovement, generateImprovementPrompt } from '@/lib/quality-scorer';
import { EvalTracker } from '@/lib/eval-tracker';

// Mock FactsJSON for testing
const mockFacts = [
  { id: 'fact-1', text: 'Automates tax calculations with AI', page: '/features', evidence: 'AI-powered automation' },
  { id: 'fact-2', text: '40% faster tax preparation', page: '/features', evidence: '40% time savings' },
  { id: 'fact-3', text: 'Serves mid-market firms', page: '/about', evidence: 'Mid-market focus' },
  { id: 'fact-4', text: 'Built-in compliance checks', page: '/features', evidence: 'Compliance built-in' },
  { id: 'fact-5', text: 'SOC 2 certified', page: '/security', evidence: 'SOC 2 certification' },
];

const mockFactsJSON = {
  brand: { name: 'Test', tones: [], primaryCTA: '' },
  structure: { nav: [], keyPages: [], footer: [] },
  audienceSignals: [],
  valueProps: [],
  pains: [],
  proof: [],
  facts: mockFacts,
};

describe('Evidence Validator', () => {
  describe('validateEvidence', () => {
    it('should validate correct fact IDs', () => {
      const result = validateEvidence(['fact-1', 'fact-2'], mockFacts);
      
      expect(result.isValid).toBe(true);
      expect(result.citationCount).toBe(2);
      expect(result.missingFactIds).toHaveLength(0);
    });

    it('should detect missing fact IDs', () => {
      const result = validateEvidence(['fact-1', 'fact-99'], mockFacts);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFactIds).toContain('fact-99');
    });

    it('should calculate coverage correctly', () => {
      const result = validateEvidence(['fact-1', 'fact-2'], mockFacts);
      
      expect(result.coverage).toBe(0.4); // 2 out of 5 facts
    });

    it('should identify unused facts', () => {
      const result = validateEvidence(['fact-1'], mockFacts);
      
      expect(result.unusedFacts).toContain('fact-2');
      expect(result.unusedFacts).toContain('fact-3');
      expect(result.unusedFacts).toHaveLength(4);
    });

    it('should handle empty sourceFactIds', () => {
      const result = validateEvidence([], mockFacts);
      
      expect(result.isValid).toBe(false);
      expect(result.citationCount).toBe(0);
      expect(result.coverage).toBe(0);
    });
  });

  describe('extractAllFactIds', () => {
    it('should extract fact IDs from nested objects', () => {
      const output = {
        variations: [
          { id: 'v1', text: 'Test', sourceFactIds: ['fact-1', 'fact-2'] },
          { id: 'v2', text: 'Test', sourceFactIds: ['fact-3'] },
        ],
      };
      
      const result = extractAllFactIds(output);
      
      expect(result).toContain('fact-1');
      expect(result).toContain('fact-2');
      expect(result).toContain('fact-3');
      expect(result).toHaveLength(3);
    });

    it('should handle arrays of messages', () => {
      const output = {
        messages: [
          { id: 'm1', body: 'Test', sourceFactIds: ['fact-1'] },
          { id: 'm2', body: 'Test', sourceFactIds: ['fact-2', 'fact-3'] },
        ],
      };
      
      const result = extractAllFactIds(output);
      
      expect(result).toHaveLength(3);
    });
  });

  describe('validateEvidenceAcrossItems', () => {
    it('should aggregate fact IDs across multiple items', () => {
      const items = [
        { sourceFactIds: ['fact-1', 'fact-2'] },
        { sourceFactIds: ['fact-2', 'fact-3'] },
      ];
      
      const result = validateEvidenceAcrossItems(items, mockFacts);
      
      expect(result.isValid).toBe(true);
      expect(result.citationCount).toBe(3); // Unique facts
    });
  });
});

describe('Quality Scorer', () => {
  describe('scoreOutput', () => {
    it('should give high score to quality output', () => {
      const output = {
        text: 'Cut tax preparation time by 40% with AI-powered automation and built-in compliance checks.',
        sourceFactIds: ['fact-1', 'fact-2', 'fact-4'],
      };
      
      const result = scoreOutput(output, mockFactsJSON);
      
      expect(result.grade).toBe('A');
      expect(result.totalScore).toBeGreaterThan(0.8);
      expect(result.breakdown.hasEvidence).toBe(1);
      expect(result.breakdown.hasMetrics).toBe(1);
      expect(result.details.metricsFound).toBe(true);
    });

    it('should detect generic phrases', () => {
      const output = {
        text: 'Leverage technology to streamline operations and increase efficiency.',
        sourceFactIds: ['fact-1'],
      };
      
      const result = scoreOutput(output, mockFactsJSON);
      
      expect(result.breakdown.noGenerics).toBe(0);
      expect(result.details.genericPhrasesFound.length).toBeGreaterThan(0);
      expect(result.issues).toContain(expect.stringContaining('generic phrases'));
    });

    it('should penalize missing evidence', () => {
      const output = {
        text: 'Great software for accounting firms.',
        sourceFactIds: [],
      };
      
      const result = scoreOutput(output, mockFactsJSON);
      
      expect(result.breakdown.hasEvidence).toBe(0);
      expect(result.issues).toContain(expect.stringContaining('Missing evidence'));
      expect(result.grade).toBe('F');
    });

    it('should reward metrics', () => {
      const outputWithMetrics = {
        text: '40% faster, 2x more clients, save 10 hours per week',
        sourceFactIds: ['fact-1', 'fact-2', 'fact-3'],
      };
      
      const outputWithoutMetrics = {
        text: 'Much faster, more clients, saves time',
        sourceFactIds: ['fact-1', 'fact-2', 'fact-3'],
      };
      
      const resultWith = scoreOutput(outputWithMetrics, mockFactsJSON);
      const resultWithout = scoreOutput(outputWithoutMetrics, mockFactsJSON);
      
      expect(resultWith.breakdown.hasMetrics).toBe(1);
      expect(resultWithout.breakdown.hasMetrics).toBe(0);
      expect(resultWith.totalScore).toBeGreaterThan(resultWithout.totalScore);
    });

    it('should detect invalid fact IDs', () => {
      const output = {
        text: 'Test content',
        sourceFactIds: ['fact-1', 'fact-99'],
      };
      
      const result = scoreOutput(output, mockFactsJSON);
      
      expect(result.breakdown.evidenceValid).toBe(0);
      expect(result.details.invalidFactIds).toContain('fact-99');
    });
  });

  describe('scoreMultipleOutputs', () => {
    it('should aggregate scores across multiple outputs', () => {
      const outputs = [
        { text: '40% faster with AI automation', sourceFactIds: ['fact-1', 'fact-2'] },
        { text: 'Built-in compliance checks', sourceFactIds: ['fact-4'] },
      ];
      
      const result = scoreMultipleOutputs(outputs, mockFactsJSON);
      
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.details.citationCount).toBe(3); // Total unique facts
    });
  });

  describe('needsImprovement', () => {
    it('should identify low quality scores', () => {
      const lowScore = {
        totalScore: 0.5,
        grade: 'C' as const,
        breakdown: { hasEvidence: 0, evidenceCount: 0, noGenerics: 1, hasMetrics: 0, evidenceValid: 0 },
        issues: ['test'],
        details: { citationCount: 0, genericPhrasesFound: [], metricsFound: false, invalidFactIds: [] },
      };
      
      expect(needsImprovement(lowScore)).toBe(true);
    });

    it('should not flag high quality scores', () => {
      const highScore = {
        totalScore: 0.9,
        grade: 'A' as const,
        breakdown: { hasEvidence: 1, evidenceCount: 1, noGenerics: 1, hasMetrics: 1, evidenceValid: 1 },
        issues: [],
        details: { citationCount: 3, genericPhrasesFound: [], metricsFound: true, invalidFactIds: [] },
      };
      
      expect(needsImprovement(highScore)).toBe(false);
    });
  });

  describe('generateImprovementPrompt', () => {
    it('should generate specific improvement instructions', () => {
      const score = {
        totalScore: 0.4,
        grade: 'F' as const,
        breakdown: { hasEvidence: 0, evidenceCount: 0, noGenerics: 0, hasMetrics: 0, evidenceValid: 0 },
        issues: ['Missing evidence', 'Contains generic phrases', 'Missing metrics'],
        details: { citationCount: 0, genericPhrasesFound: ['leverage'], metricsFound: false, invalidFactIds: [] },
      };
      
      const prompt = generateImprovementPrompt(score);
      
      expect(prompt).toContain('QUALITY IMPROVEMENTS NEEDED');
      expect(prompt).toContain('Missing evidence');
      expect(prompt).toContain('sourceFactIds');
    });
  });
});

describe('Eval Tracker', () => {
  let tracker: EvalTracker;

  beforeEach(() => {
    tracker = new EvalTracker();
    tracker.clear();
  });

  it('should track generation metrics', () => {
    const mockQualityScore = {
      totalScore: 0.85,
      grade: 'A' as const,
      breakdown: { hasEvidence: 1, evidenceCount: 1, noGenerics: 1, hasMetrics: 1, evidenceValid: 1 },
      issues: [],
      details: { citationCount: 3, genericPhrasesFound: [], metricsFound: true, invalidFactIds: [] },
    };

    tracker.track({
      timestamp: Date.now(),
      operation: 'value-prop',
      validationPassed: true,
      repairAttempted: false,
      qualityScore: mockQualityScore,
      evidenceCount: 3,
    });

    const metrics = tracker.getAggregateMetrics();
    
    expect(metrics.totalGenerations).toBe(1);
    expect(metrics.avgQualityScore).toBe(0.85);
    expect(metrics.evidenceCitationRate).toBe(1);
    expect(metrics.gradeDistribution.A).toBe(1);
  });

  it('should aggregate multiple generations', () => {
    const mockScoreA = {
      totalScore: 0.9,
      grade: 'A' as const,
      breakdown: { hasEvidence: 1, evidenceCount: 1, noGenerics: 1, hasMetrics: 1, evidenceValid: 1 },
      issues: [],
      details: { citationCount: 3, genericPhrasesFound: [], metricsFound: true, invalidFactIds: [] },
    };

    const mockScoreB = {
      totalScore: 0.7,
      grade: 'B' as const,
      breakdown: { hasEvidence: 1, evidenceCount: 0.67, noGenerics: 1, hasMetrics: 0, evidenceValid: 1 },
      issues: [],
      details: { citationCount: 2, genericPhrasesFound: [], metricsFound: false, invalidFactIds: [] },
    };

    tracker.track({
      timestamp: Date.now(),
      operation: 'value-prop',
      validationPassed: true,
      repairAttempted: false,
      qualityScore: mockScoreA,
      evidenceCount: 3,
    });

    tracker.track({
      timestamp: Date.now(),
      operation: 'email',
      validationPassed: true,
      repairAttempted: true,
      qualityScore: mockScoreB,
      evidenceCount: 2,
    });

    const metrics = tracker.getAggregateMetrics();
    
    expect(metrics.totalGenerations).toBe(2);
    expect(metrics.avgQualityScore).toBe(0.8);
    expect(metrics.avgFactsPerOutput).toBe(2.5);
    expect(metrics.repairSuccessRate).toBe(1);
  });

  it('should filter metrics by operation', () => {
    const mockScore = {
      totalScore: 0.8,
      grade: 'B' as const,
      breakdown: { hasEvidence: 1, evidenceCount: 1, noGenerics: 1, hasMetrics: 1, evidenceValid: 1 },
      issues: [],
      details: { citationCount: 2, genericPhrasesFound: [], metricsFound: true, invalidFactIds: [] },
    };

    tracker.track({
      timestamp: Date.now(),
      operation: 'value-prop',
      validationPassed: true,
      repairAttempted: false,
      qualityScore: mockScore,
      evidenceCount: 2,
    });

    tracker.track({
      timestamp: Date.now(),
      operation: 'email',
      validationPassed: true,
      repairAttempted: false,
      qualityScore: mockScore,
      evidenceCount: 2,
    });

    const valuePropMetrics = tracker.getMetricsForOperation('value-prop');
    
    expect(valuePropMetrics.totalGenerations).toBe(1);
  });
});

