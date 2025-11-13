/**
 * Evidence Validator
 * 
 * Validates that sourceFactIds in generated content reference actual facts
 * from the Facts JSON extraction. Tracks coverage and identifies issues.
 */

import type { FactsJSON } from './prompt-templates';

export interface EvidenceValidation {
  isValid: boolean;
  coverage: number; // 0-1, percentage of available facts cited
  citationCount: number; // number of facts cited
  missingFactIds: string[]; // fact IDs cited but not in facts
  unusedFacts: string[]; // available fact IDs not cited
  details: {
    totalFactsAvailable: number;
    factsCited: number;
  };
}

/**
 * Validates that all sourceFactIds reference real facts in the FactsJSON
 * 
 * @param sourceFactIds - Array of fact IDs cited in the generated content
 * @param availableFacts - Array of facts from the Facts JSON extraction
 * @returns EvidenceValidation with validity status, coverage metrics, and issue details
 */
export function validateEvidence(
  sourceFactIds: string[],
  availableFacts: FactsJSON['facts']
): EvidenceValidation {
  // Handle edge cases
  if (!availableFacts || availableFacts.length === 0) {
    return {
      isValid: sourceFactIds.length === 0,
      coverage: 0,
      citationCount: 0,
      missingFactIds: sourceFactIds,
      unusedFacts: [],
      details: {
        totalFactsAvailable: 0,
        factsCited: 0,
      },
    };
  }

  if (!sourceFactIds || sourceFactIds.length === 0) {
    return {
      isValid: false,
      coverage: 0,
      citationCount: 0,
      missingFactIds: [],
      unusedFacts: availableFacts.map(f => f.id),
      details: {
        totalFactsAvailable: availableFacts.length,
        factsCited: 0,
      },
    };
  }

  // Build set of available fact IDs for O(1) lookup
  const availableIds = new Set(availableFacts.map(f => f.id));
  
  // Find fact IDs that were cited but don't exist
  const missingFactIds = sourceFactIds.filter(id => !availableIds.has(id));
  
  // Find facts that exist but weren't cited
  const citedIds = new Set(sourceFactIds);
  const unusedFacts = availableFacts
    .filter(f => !citedIds.has(f.id))
    .map(f => f.id);
  
  // Calculate coverage (what % of available facts were used)
  const coverage = sourceFactIds.length / availableFacts.length;
  
  // Valid if all cited fact IDs actually exist
  const isValid = missingFactIds.length === 0;
  
  return {
    isValid,
    coverage: Math.min(coverage, 1), // Cap at 100%
    citationCount: sourceFactIds.length,
    missingFactIds,
    unusedFacts,
    details: {
      totalFactsAvailable: availableFacts.length,
      factsCited: sourceFactIds.length,
    },
  };
}

/**
 * Helper to extract all sourceFactIds from a complex nested output
 * Handles variations, emails, messages, etc.
 */
export function extractAllFactIds(output: any): string[] {
  const factIds = new Set<string>();
  
  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    
    // Check if this object has sourceFactIds
    if (obj.sourceFactIds && Array.isArray(obj.sourceFactIds)) {
      obj.sourceFactIds.forEach((id: string) => factIds.add(id));
    }
    
    // Recurse into nested objects
    Object.values(obj).forEach(traverse);
  }
  
  traverse(output);
  return Array.from(factIds);
}

/**
 * Validates evidence across multiple items (e.g., email sequence, value prop variations)
 */
export function validateEvidenceAcrossItems(
  items: Array<{ sourceFactIds?: string[] }>,
  availableFacts: FactsJSON['facts']
): EvidenceValidation {
  // Collect all unique fact IDs across all items
  const allFactIds = new Set<string>();
  items.forEach(item => {
    if (item.sourceFactIds) {
      item.sourceFactIds.forEach(id => allFactIds.add(id));
    }
  });
  
  return validateEvidence(Array.from(allFactIds), availableFacts);
}

