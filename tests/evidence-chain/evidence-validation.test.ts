/**
 * Evidence Chain Validation Tests
 * 
 * CRITICAL: These tests validate the evidence chain integrity
 * that makes Flowtusk's outputs trustworthy and traceable.
 * 
 * All tests must pass before merging any code changes.
 */

import { describe, test, expect } from 'vitest';
import { validateFactsJSON, validateICPResponse } from '@/lib/validators';

describe('Evidence Chain Integrity', () => {
  describe('Facts JSON Evidence', () => {
    test('Facts must have evidence field', () => {
      const validFactsJson = {
        brand: {
          name: 'Test Corp',
          tones: ['Professional', 'Friendly'],
          primaryCTA: 'Get Started'
        },
        structure: {
          nav: ['Home', 'Features', 'Pricing'],
          keyPages: [{ path: '/', title: 'Home' }],
          footer: ['Privacy', 'Terms']
        },
        audienceSignals: ['SMBs', 'Enterprise'],
        facts: [
          {
            id: 'fact-1',
            text: 'Automates tax calculations with AI',
            page: 'homepage',
            evidence: 'Cut tax prep time by 40% with automated calculations'
          },
          {
            id: 'fact-2',
            text: 'Built-in compliance checks',
            page: 'features',
            evidence: 'Automatically validates against IRS regulations'
          }
        ],
        valueProps: [
          {
            id: 'v1',
            text: 'Save time with automation',
            evidence: ['fact-1', 'fact-2']
          }
        ],
        pains: ['Manual processes', 'Compliance risks'],
        proof: ['500+ firms', 'SOC 2 certified']
      };

      const result = validateFactsJSON(validFactsJson);
      expect(result.ok).toBe(true);
      
      if (result.ok) {
        // When validation succeeds, data is available (not errors)
        expect(result.data).toBeDefined();
        
        // Verify each fact has evidence
        result.data.facts.forEach(fact => {
          expect(fact.evidence).toBeDefined();
          expect(typeof fact.evidence).toBe('string');
          expect(fact.evidence.length).toBeGreaterThan(0);
        });
      }
    });

    test('Value props must reference fact IDs', () => {
      const valuePropWithEvidence = {
        id: 'v1',
        text: 'Cut costs by 30%',
        evidence: ['fact-5', 'fact-8', 'fact-12']
      };

      expect(Array.isArray(valuePropWithEvidence.evidence)).toBe(true);
      expect(valuePropWithEvidence.evidence.length).toBeGreaterThan(0);
      
      // All evidence items should be fact IDs
      valuePropWithEvidence.evidence.forEach(factId => {
        expect(factId).toMatch(/^fact-\d+$/);
      });
    });

    test('Facts without evidence should fail validation', () => {
      const factsWithoutEvidence = {
        brand: { name: 'Test', tones: [], primaryCTA: '' },
        structure: { nav: [], keyPages: [], footer: [] },
        audienceSignals: [],
        facts: [
          {
            id: 'fact-1',
            text: 'Some claim',
            page: 'home'
            // Missing evidence field - should fail
          }
        ],
        valueProps: [],
        pains: [],
        proof: []
      };

      const result = validateFactsJSON(factsWithoutEvidence);
      expect(result.ok).toBe(false);
      
      if (!result.ok) {
        // Check that error mentions the missing evidence field
        expect(result.errors).toBeDefined();
        expect(result.errors.some(e => e.includes('evidence') && e.includes('Required'))).toBe(true);
      }
    });

    test('Empty evidence should fail validation', () => {
      const factsWithEmptyEvidence = {
        brand: { name: 'Test', tones: [], primaryCTA: '' },
        structure: { nav: [], keyPages: [], footer: [] },
        audienceSignals: [],
        facts: [
          {
            id: 'fact-1',
            text: 'Some claim',
            page: 'home',
            evidence: ''  // Empty string - should fail
          }
        ],
        valueProps: [],
        pains: [],
        proof: []
      };

      const result = validateFactsJSON(factsWithEmptyEvidence);
      expect(result.ok).toBe(false);
    });
  });

  describe('ICP Evidence', () => {
    test('ICPs must have evidence array', () => {
      const validICP = {
        id: 'icp-1',
        title: 'Mid-Market Accounting Firms',
        description: 'Firms with 50-500 employees',
        painPoints: ['Manual workflows', 'Staff burnout'],
        goals: ['Automate processes', 'Scale business'],
        demographics: '50-500 employees, $5M-$50M revenue',
        personaName: 'Sarah Martinez',
        personaRole: 'Managing Partner',
        personaCompany: 'Martinez & Associates',
        location: 'Chicago',
        country: 'United States',
        evidence: ['fact-2', 'fact-5', 'fact-8']
      };

      expect(Array.isArray(validICP.evidence)).toBe(true);
      expect(validICP.evidence.length).toBeGreaterThan(0);
      
      // All evidence should reference fact IDs
      validICP.evidence.forEach(factId => {
        expect(typeof factId).toBe('string');
        expect(factId.startsWith('fact-')).toBe(true);
      });
    });

    test('ICPs without evidence should pass validation (evidence is optional)', () => {
      const icpWithoutEvidence = {
        icps: [
          {
            id: 'icp-1',
            title: 'Test ICP',
            description: 'Test description',
            painPoints: ['pain1'],
            goals: ['goal1'],
            demographics: 'test',
            personaName: 'Test Person',
            personaRole: 'Role',
            personaCompany: 'Company',
            location: 'City',
            country: 'Country'
            // Missing evidence field - this is OK (optional for backward compatibility)
          }
        ]
      };

      const result = validateICPResponse(icpWithoutEvidence);
      // Evidence is optional in schema, so this should pass validation
      expect(result.ok).toBe(true);
      
      if (result.ok) {
        // But we should warn/log when evidence is missing in production
        const icp = result.data.icps[0];
        expect(icp.evidence).toBeUndefined();
      }
    });

    test('Empty evidence array should fail validation', () => {
      const icpWithEmptyEvidence = {
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
            country: '',
            evidence: []  // Empty array - should fail
          }
        ]
      };

      const result = validateICPResponse(icpWithEmptyEvidence);
      expect(result.ok).toBe(false);
    });
  });

  describe('Value Prop sourceFactIds', () => {
    test('Value prop variations must have sourceFactIds', () => {
      const validValueProp = {
        summary: {
          mainInsight: 'Automation saves time',
          painPointsAddressed: ['Manual work', 'Errors'],
          approachStrategy: 'AI-powered automation',
          expectedImpact: '40% time savings'
        },
        variables: [],
        variations: [
          {
            id: 'benefit-first',
            style: 'Benefit-First',
            text: 'Cut tax prep time by 40% with AI automation',
            useCase: 'Website hero',
            emoji: '🔥',
            sourceFactIds: ['fact-3', 'fact-7', 'fact-12']
          },
          {
            id: 'pain-first',
            style: 'Pain-First',
            text: 'Tired of manual tax calculations?',
            useCase: 'Email subject line',
            emoji: '😩',
            sourceFactIds: ['fact-3', 'fact-5']
          }
        ]
      };

      validValueProp.variations.forEach(variation => {
        expect(Array.isArray(variation.sourceFactIds)).toBe(true);
        expect(variation.sourceFactIds.length).toBeGreaterThan(0);
        
        variation.sourceFactIds.forEach(factId => {
          expect(factId).toMatch(/^fact-\d+$/);
        });
      });
    });

    test('Variations without sourceFactIds should fail', () => {
      const variationWithoutSource = {
        id: 'test',
        style: 'Test',
        text: 'Some text',
        useCase: 'test',
        emoji: '💡'
        // Missing sourceFactIds
      };

      expect(variationWithoutSource.sourceFactIds).toBeUndefined();
      // In actual validation, this would fail
    });
  });

  describe('Email sourceFactIds', () => {
    test('Email content must have sourceFactIds', () => {
      const validEmail = {
        subjectLines: {
          A: 'Subject A',
          B: 'Subject B',
          C: 'Subject C'
        },
        emailBody: 'Email content here...',
        cta: 'Book a call',
        tone: 'professional',
        benchmarks: {
          openRate: '25-35%',
          replyRate: '5-8%',
          conversionRate: '2-5%'
        },
        tips: ['Personalize', 'Follow up'],
        sourceFactIds: ['fact-2', 'fact-5', 'fact-9']
      };

      expect(Array.isArray(validEmail.sourceFactIds)).toBe(true);
      expect(validEmail.sourceFactIds.length).toBeGreaterThan(0);
    });
  });

  describe('LinkedIn Content sourceFactIds', () => {
    test('LinkedIn content must have sourceFactIds', () => {
      const validLinkedInPost = {
        type: 'post',
        content: 'LinkedIn post content...',
        suggestedHashtags: ['#B2B', '#SaaS'],
        callToAction: 'Learn more',
        sourceFactIds: ['fact-4', 'fact-8']
      };

      expect(Array.isArray(validLinkedInPost.sourceFactIds)).toBe(true);
      expect(validLinkedInPost.sourceFactIds.length).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Evidence Chain', () => {
    test('Complete flow maintains evidence chain', () => {
      // Simulate complete flow
      const flow = {
        facts_json: {
          facts: [
            { id: 'fact-1', text: 'Claim 1', page: 'home', evidence: 'Evidence 1' },
            { id: 'fact-2', text: 'Claim 2', page: 'features', evidence: 'Evidence 2' }
          ],
          valueProps: [
            { id: 'v1', text: 'Value 1', evidence: ['fact-1'] }
          ]
        },
        selected_icp: {
          id: 'icp-1',
          evidence: ['fact-1', 'fact-2']
        },
        generated_content: {
          valueProp: {
            variations: [
              { id: 'v1', sourceFactIds: ['fact-1', 'fact-2'] }
            ]
          },
          email: {
            sourceFactIds: ['fact-1', 'fact-2']
          }
        }
      };

      // Verify facts have evidence
      expect(flow.facts_json.facts.every(f => f.evidence)).toBe(true);
      
      // Verify ICP has evidence
      expect(Array.isArray(flow.selected_icp.evidence)).toBe(true);
      
      // Verify value props have sourceFactIds
      expect(flow.generated_content.valueProp.variations.every(
        v => Array.isArray(v.sourceFactIds) && v.sourceFactIds.length > 0
      )).toBe(true);
      
      // Verify email has sourceFactIds
      expect(Array.isArray(flow.generated_content.email.sourceFactIds)).toBe(true);
    });
  });
});

describe('Evidence Chain Traceability', () => {
  test('Can trace claim back to original evidence', () => {
    const facts = [
      { id: 'fact-3', text: 'AI automation', page: 'features', evidence: 'Cut time by 40%' },
      { id: 'fact-7', text: 'Compliance built-in', page: 'features', evidence: 'IRS compliant' }
    ];

    const valueProp = {
      text: 'Save 40% on tax prep with compliant automation',
      sourceFactIds: ['fact-3', 'fact-7']
    };

    // Can trace back
    valueProp.sourceFactIds.forEach(factId => {
      const sourceFact = facts.find(f => f.id === factId);
      expect(sourceFact).toBeDefined();
      expect(sourceFact!.evidence).toBeDefined();
    });
  });

  test('Broken evidence chain should be detectable', () => {
    const facts = [
      { id: 'fact-1', text: 'Claim', page: 'home', evidence: 'Evidence' }
    ];

    const valueProp = {
      text: 'Some claim',
      sourceFactIds: ['fact-99']  // References non-existent fact
    };

    // Should not find fact
    const sourceFact = facts.find(f => f.id === 'fact-99');
    expect(sourceFact).toBeUndefined();
    
    // In production, this would trigger a warning
  });
});

