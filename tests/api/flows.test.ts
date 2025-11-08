/**
 * Integration tests for Flow API
 * 
 * Tests CRUD operations, evidence preservation, soft deletes, and edge cases
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { flowsClient } from '@/lib/flows-client';

describe('Flow API Integration Tests', () => {
  let testFlowId: string;

  const mockFactsJson = {
    brand: { name: 'Test Brand', tones: ['Professional'], primaryCTA: 'Get Started' },
    facts: [
      {
        id: 'fact-1',
        text: 'Automates tax calculations',
        page: 'homepage',
        evidence: 'Cut tax prep time by 40%'
      },
      {
        id: 'fact-2',
        text: 'Built-in compliance checks',
        page: 'features',
        evidence: 'SOC 2 compliant'
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

  const mockSelectedIcp = {
    id: 'icp-1',
    title: 'Accounting Firm Owners',
    description: 'Mid-market accounting firms',
    painPoints: ['Manual workflows', 'Staff burnout'],
    goals: ['Automate processes', 'Scale business'],
    demographics: '50-500 employees',
    personaName: 'Sarah Martinez',
    personaRole: 'Managing Partner',
    personaCompany: 'Martinez & Associates',
    location: 'Chicago',
    country: 'United States',
    evidence: ['fact-1', 'fact-2']
  };

  test('Create flow persists evidence fields', async () => {
    const flow = await flowsClient.createFlow({
      title: `Test Flow ${Date.now()}`,
      website_url: 'https://example.com',
      facts_json: mockFactsJson,
      selected_icp: mockSelectedIcp,
    });

    testFlowId = flow.id;

    expect(flow.id).toBeDefined();
    expect(flow.facts_json).toBeDefined();
    
    // Verify evidence fields preserved
    const facts = (flow.facts_json as any).facts;
    expect(facts[0].evidence).toBe('Cut tax prep time by 40%');
    
    const selectedIcp = flow.selected_icp as any;
    expect(selectedIcp.evidence).toEqual(['fact-1', 'fact-2']);
  });

  test('List flows returns user flows', async () => {
    const flows = await flowsClient.listFlows();
    
    expect(Array.isArray(flows)).toBe(true);
    expect(flows.length).toBeGreaterThan(0);
    
    const ourFlow = flows.find(f => f.id === testFlowId);
    expect(ourFlow).toBeDefined();
  });

  test('Get flow by ID returns correct flow', async () => {
    const flow = await flowsClient.getFlow(testFlowId);
    
    expect(flow.id).toBe(testFlowId);
    expect(flow.website_url).toBe('https://example.com');
  });

  test('Update flow preserves sourceFactIds', async () => {
    const mockValueProps = {
      variations: [
        {
          id: 'benefit-first',
          style: 'Benefit-First',
          text: 'Cut tax prep time by 40%...',
          sourceFactIds: ['fact-1', 'fact-2']
        }
      ]
    };

    const updated = await flowsClient.updateFlow(testFlowId, {
      generated_content: { valueProps: mockValueProps }
    });

    const generatedContent = updated.generated_content as any;
    expect(generatedContent.valueProps.variations[0].sourceFactIds).toEqual(['fact-1', 'fact-2']);
  });

  test('Update flow tracks regeneration count', async () => {
    const updated = await flowsClient.updateFlow(testFlowId, {
      regenerated: true
    });

    expect(updated.metadata?.prompt_regeneration_count).toBeGreaterThan(0);
  });

  test('Soft delete moves flow to archived', async () => {
    await flowsClient.softDeleteFlow(testFlowId);

    // Should not appear in active list
    const activeFlows = await flowsClient.listFlows();
    expect(activeFlows.find(f => f.id === testFlowId)).toBeUndefined();

    // Should appear in archived list
    const archivedFlows = await flowsClient.listFlows({ archived: true });
    expect(archivedFlows.find(f => f.id === testFlowId)).toBeDefined();
  });

  test('Restore flow returns to active list', async () => {
    const restored = await flowsClient.restoreFlow(testFlowId);

    expect(restored.archived_at).toBeNull();

    // Should appear in active list again
    const activeFlows = await flowsClient.listFlows();
    expect(activeFlows.find(f => f.id === testFlowId)).toBeDefined();
  });

  test('Duplicate title returns error', async () => {
    const duplicateTitle = `Duplicate Test ${Date.now()}`;
    
    // Create first flow
    await flowsClient.createFlow({ title: duplicateTitle });

    // Try to create duplicate
    await expect(
      flowsClient.createFlow({ title: duplicateTitle })
    ).rejects.toThrow(/already exists/i);
  });

  test('Non-existent flow returns 404', async () => {
    await expect(
      flowsClient.getFlow('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrow(/not found/i);
  });

  // Cleanup
  afterAll(async () => {
    if (testFlowId) {
      try {
        await flowsClient.hardDeleteFlow(testFlowId);
      } catch (error) {
        console.warn('Cleanup failed:', error);
      }
    }
  });
});

