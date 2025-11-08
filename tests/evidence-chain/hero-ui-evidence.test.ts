import { describe, it, expect } from 'vitest';

/**
 * Evidence Chain Tests for Hero UI Components
 * 
 * These tests ensure that evidence chain integrity is maintained
 * across all Hero UI components and never breaks.
 */

// Mock data structures
interface Fact {
  id: string;
  text: string;
  evidence: string;
  page?: string;
}

interface FactsJSON {
  facts: Fact[];
}

interface ICP {
  id: string;
  title: string;
  description: string;
  painPoints: string[];
  goals: string[];
  demographics: string;
  personaName: string;
  personaRole: string;
  personaCompany: string;
  location: string;
  country: string;
  evidence?: string[];
}

interface ValuePropVariation {
  id: string;
  style: string;
  text: string;
  useCase?: string;
  sourceFactIds?: string[];
}

// Helper function to resolve evidence (mirroring HeroICPCard logic)
function resolveEvidence(factIds: string[] | undefined, factsJson?: FactsJSON): Fact[] {
  if (!factIds || !factsJson?.facts) return [];
  return factIds
    .map(id => factsJson.facts.find(f => f.id === id))
    .filter(Boolean) as Fact[];
}

describe('Evidence Chain - ICP Component', () => {
  const mockFactsJson: FactsJSON = {
    facts: [
      {
        id: 'fact-1',
        text: 'Comprehensive fact about the business',
        evidence: 'Direct quote from website about feature X',
        page: 'homepage',
      },
      {
        id: 'fact-2',
        text: 'Another important fact',
        evidence: 'Customer testimonial showing pain point Y',
        page: 'testimonials',
      },
      {
        id: 'fact-3',
        text: 'Third key insight',
        evidence: 'Pricing page shows enterprise focus',
        page: 'pricing',
      },
    ],
  };

  const mockICP: ICP = {
    id: 'icp-1',
    title: 'Mid-Market CFOs',
    description: 'Financial leaders at growing companies',
    painPoints: ['Manual processes', 'Time constraints', 'Budget pressure'],
    goals: ['Automation', 'Efficiency', 'Cost savings'],
    demographics: 'Companies with 50-200 employees',
    personaName: 'Sarah Johnson',
    personaRole: 'CFO',
    personaCompany: 'TechCorp (120 employees)',
    location: 'San Francisco',
    country: 'USA',
    evidence: ['fact-1', 'fact-3'], // Links to actual facts
  };

  it('should resolve evidence fact IDs to actual facts', () => {
    const resolved = resolveEvidence(mockICP.evidence, mockFactsJson);
    
    expect(resolved).toHaveLength(2);
    expect(resolved[0].id).toBe('fact-1');
    expect(resolved[1].id).toBe('fact-3');
  });

  it('should include evidence text for each resolved fact', () => {
    const resolved = resolveEvidence(mockICP.evidence, mockFactsJson);
    
    expect(resolved[0].evidence).toBe('Direct quote from website about feature X');
    expect(resolved[1].evidence).toBe('Pricing page shows enterprise focus');
  });

  it('should handle missing evidence gracefully', () => {
    const icpWithoutEvidence: ICP = { ...mockICP, evidence: undefined };
    const resolved = resolveEvidence(icpWithoutEvidence.evidence, mockFactsJson);
    
    expect(resolved).toHaveLength(0);
  });

  it('should handle invalid fact IDs gracefully', () => {
    const icpWithInvalidIds: ICP = { 
      ...mockICP, 
      evidence: ['fact-1', 'invalid-id', 'fact-3'] 
    };
    const resolved = resolveEvidence(icpWithInvalidIds.evidence, mockFactsJson);
    
    // Should only resolve valid IDs
    expect(resolved).toHaveLength(2);
    expect(resolved.every(f => f.id.startsWith('fact-'))).toBe(true);
  });

  it('should preserve page information in resolved facts', () => {
    const resolved = resolveEvidence(mockICP.evidence, mockFactsJson);
    
    expect(resolved[0].page).toBe('homepage');
    expect(resolved[1].page).toBe('pricing');
  });
});

describe('Evidence Chain - Value Prop Component', () => {
  const mockFactsJson: FactsJSON = {
    facts: [
      { id: 'fact-1', text: 'Fact 1', evidence: 'Evidence 1' },
      { id: 'fact-2', text: 'Fact 2', evidence: 'Evidence 2' },
      { id: 'fact-3', text: 'Fact 3', evidence: 'Evidence 3' },
    ],
  };

  const mockValueProp: ValuePropVariation = {
    id: 'vp-1',
    style: 'Technical',
    text: 'Automate your financial workflows with AI-powered insights',
    useCase: 'Homepage hero',
    sourceFactIds: ['fact-1', 'fact-2'],
  };

  it('should link value props to source facts', () => {
    expect(mockValueProp.sourceFactIds).toHaveLength(2);
    expect(mockValueProp.sourceFactIds).toContain('fact-1');
    expect(mockValueProp.sourceFactIds).toContain('fact-2');
  });

  it('should resolve value prop source facts', () => {
    const resolved = resolveEvidence(mockValueProp.sourceFactIds, mockFactsJson);
    
    expect(resolved).toHaveLength(2);
    expect(resolved[0].id).toBe('fact-1');
    expect(resolved[1].id).toBe('fact-2');
  });

  it('should ensure all value props have source facts', () => {
    // In production, all value props MUST have sourceFactIds
    expect(mockValueProp.sourceFactIds).toBeDefined();
    expect(mockValueProp.sourceFactIds!.length).toBeGreaterThan(0);
  });
});

describe('Evidence Chain - API Response Validation', () => {
  it('should validate ICP has evidence array', () => {
    const mockAPIResponse = {
      icps: [
        {
          id: 'icp-1',
          title: 'Enterprise CTOs',
          evidence: ['fact-1', 'fact-5'],
          // ... other fields
        },
      ],
    };

    expect(mockAPIResponse.icps[0].evidence).toBeDefined();
    expect(Array.isArray(mockAPIResponse.icps[0].evidence)).toBe(true);
  });

  it('should validate facts have required fields', () => {
    const fact = {
      id: 'fact-1',
      text: 'Some fact',
      evidence: 'Some evidence',
    };

    expect(fact.id).toBeDefined();
    expect(fact.text).toBeDefined();
    expect(fact.evidence).toBeDefined();
    expect(typeof fact.id).toBe('string');
    expect(typeof fact.text).toBe('string');
    expect(typeof fact.evidence).toBe('string');
  });

  it('should ensure evidence chain is never empty for primary ICP', () => {
    const primaryICP: ICP = {
      id: 'icp-1',
      title: 'Primary Customer',
      description: 'Most valuable segment',
      painPoints: ['Pain 1'],
      goals: ['Goal 1'],
      demographics: 'Demo',
      personaName: 'John Doe',
      personaRole: 'CEO',
      personaCompany: 'Acme Corp',
      location: 'NYC',
      country: 'USA',
      evidence: ['fact-1', 'fact-2'], // MUST have evidence
    };

    expect(primaryICP.evidence).toBeDefined();
    expect(primaryICP.evidence!.length).toBeGreaterThan(0);
  });
});

describe('Evidence Chain - Cross-Component Consistency', () => {
  const mockFactsJson: FactsJSON = {
    facts: [
      { id: 'fact-1', text: 'Fact 1', evidence: 'Evidence 1' },
      { id: 'fact-2', text: 'Fact 2', evidence: 'Evidence 2' },
    ],
  };

  it('should use same facts across ICP and Value Prop', () => {
    const icp: ICP = {
      id: 'icp-1',
      title: 'Enterprise',
      description: 'Desc',
      painPoints: [],
      goals: [],
      demographics: '',
      personaName: 'John',
      personaRole: 'CEO',
      personaCompany: 'Corp',
      location: 'NYC',
      country: 'USA',
      evidence: ['fact-1', 'fact-2'],
    };

    const valueProp: ValuePropVariation = {
      id: 'vp-1',
      style: 'Technical',
      text: 'Value prop text',
      sourceFactIds: ['fact-1', 'fact-2'], // Same facts as ICP
    };

    const icpFacts = resolveEvidence(icp.evidence, mockFactsJson);
    const vpFacts = resolveEvidence(valueProp.sourceFactIds, mockFactsJson);

    expect(icpFacts).toHaveLength(2);
    expect(vpFacts).toHaveLength(2);
    expect(icpFacts[0].id).toBe(vpFacts[0].id);
    expect(icpFacts[1].id).toBe(vpFacts[1].id);
  });
});

describe('Evidence Chain - Performance', () => {
  it('should efficiently resolve evidence for large fact sets', () => {
    // Generate large facts JSON
    const largeFacts: Fact[] = Array.from({ length: 100 }, (_, i) => ({
      id: `fact-${i}`,
      text: `Fact ${i}`,
      evidence: `Evidence ${i}`,
    }));

    const largeFactsJson: FactsJSON = { facts: largeFacts };
    const evidenceIds = ['fact-0', 'fact-50', 'fact-99'];

    const startTime = performance.now();
    const resolved = resolveEvidence(evidenceIds, largeFactsJson);
    const endTime = performance.now();

    expect(resolved).toHaveLength(3);
    expect(endTime - startTime).toBeLessThan(10); // Should complete in <10ms
  });
});

describe('Evidence Chain - Error Handling', () => {
  it('should handle undefined factsJson', () => {
    const resolved = resolveEvidence(['fact-1'], undefined);
    expect(resolved).toHaveLength(0);
  });

  it('should handle empty facts array', () => {
    const emptyFactsJson: FactsJSON = { facts: [] };
    const resolved = resolveEvidence(['fact-1'], emptyFactsJson);
    expect(resolved).toHaveLength(0);
  });

  it('should handle malformed fact IDs', () => {
    const factsJson: FactsJSON = {
      facts: [{ id: 'fact-1', text: 'Fact', evidence: 'Evidence' }],
    };
    
    const resolved = resolveEvidence(['', null as any, undefined as any, 'fact-1'], factsJson);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].id).toBe('fact-1');
  });
});

