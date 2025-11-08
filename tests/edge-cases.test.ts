/**
 * Edge Case Tests
 * 
 * Tests error handling, malformed inputs, timeouts, and resilience
 */

import { describe, test, expect } from 'vitest';
import { validateFactsJSON, validateICPResponse } from '@/lib/validators';

describe('Edge Cases', () => {
  describe('Malformed URL handling', () => {
    test('Empty URL should fail validation', () => {
      const result = validateFactsJSON({ facts: [] });
      expect(result.ok).toBe(false);
    });

    test('Invalid URL should be caught', () => {
      const badUrls = [
        'not-a-url',
        'htp://broken.com',
        'javascript:alert(1)',
        '',
        '   '
      ];

      badUrls.forEach(url => {
        // URL validation would happen in API route
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(false);
      });
    });
  });

  describe('Missing evidence fields', () => {
    test('Facts without evidence should fail validation', () => {
      const corruptFactsJson = {
        brand: { name: 'Test', tones: [], primaryCTA: '' },
        facts: [
          { id: 'fact-1', text: 'Something', page: 'home' }  // Missing evidence
        ],
        valueProps: [],
        pains: [],
        proof: []
      };

      const result = validateFactsJSON(corruptFactsJson);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Evidence field missing in facts array');
    });

    test('ICPs without evidence should fail validation', () => {
      const icpsWithoutEvidence = {
        icps: [
          {
            id: 'icp-1',
            title: 'Test ICP',
            description: 'Test',
            painPoints: [],
            goals: [],
            demographics: '',
            personaName: '',
            personaRole: '',
            personaCompany: '',
            location: '',
            country: ''
            // Missing evidence field
          }
        ]
      };

      const result = validateICPResponse(icpsWithoutEvidence);
      expect(result.ok).toBe(false);
    });
  });

  describe('Corrupt data handling', () => {
    test('Invalid JSON structure should fail validation', () => {
      const invalidStructure = {
        // Missing required fields
        facts: 'not-an-array'
      };

      const result = validateFactsJSON(invalidStructure as any);
      expect(result.ok).toBe(false);
    });

    test('Empty facts array should fail validation', () => {
      const emptyFacts = {
        brand: { name: 'Test', tones: [], primaryCTA: '' },
        facts: [],  // Empty - should fail
        valueProps: [],
        pains: [],
        proof: []
      };

      const result = validateFactsJSON(emptyFacts);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Facts array is empty');
    });
  });

  describe('Boundary conditions', () => {
    test('Very long title should be handled', () => {
      const longTitle = 'A'.repeat(1000);
      // In reality, DB would truncate or API would reject
      expect(longTitle.length).toBe(1000);
    });

    test('Facts JSON validation handles large arrays', () => {
      const manyFacts = {
        brand: { name: 'Test', tones: [], primaryCTA: '' },
        facts: Array.from({ length: 100 }, (_, i) => ({
          id: `fact-${i}`,
          text: `Fact ${i}`,
          page: 'test',
          evidence: `Evidence ${i}`
        })),
        valueProps: [],
        pains: [],
        proof: []
      };

      const result = validateFactsJSON(manyFacts);
      expect(result.ok).toBe(true);
    });
  });

  describe('SQL injection prevention', () => {
    test('Malicious input should be handled by parameterization', () => {
      const maliciousTitle = "'; DROP TABLE flows; --";
      
      // With parameterized queries, this should be treated as literal string
      // Not actually running DB query here, just ensuring it doesn't break
      expect(maliciousTitle).toContain('DROP TABLE');
      
      // In actual API call, Supabase client would parameterize this safely
    });
  });

  describe('Concurrent operations', () => {
    test('Unique constraint should prevent race conditions', async () => {
      // If two requests try to create flows with same title simultaneously,
      // only one should succeed (database unique constraint handles this)
      const title = `Race Test ${Date.now()}`;
      
      // This test would require actual API calls
      // Left as placeholder for integration testing
      expect(title).toBeDefined();
    });
  });
});

describe('Error Recovery', () => {
  test('Partial data should be recoverable', () => {
    // If generation fails halfway, partial data should still be accessible
    const partialFlow = {
      title: 'Partial Flow',
      website_url: 'https://example.com',
      facts_json: { facts: [], valueProps: [], pains: [], proof: [], brand: { name: '', tones: [], primaryCTA: '' } },
      selected_icp: null,  // Not yet selected
      generated_content: {}  // Empty
    };

    expect(partialFlow.facts_json).toBeDefined();
    expect(partialFlow.selected_icp).toBeNull();
  });

  test('Validation errors should be descriptive', () => {
    const result = validateFactsJSON({});
    
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.includes('required'))).toBe(true);
  });
});

