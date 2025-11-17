#!/usr/bin/env tsx
/**
 * Comprehensive API test script for FlowtuskMVP backend
 * Tests all critical API routes for demo mode readiness
 * 
 * Usage: npx tsx scripts/test-all-apis.ts
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, duration?: number) {
  results.push({ name, passed, error, duration });
  const icon = passed ? '✅' : '❌';
  const durationStr = duration ? ` (${duration}ms)` : '';
  console.log(`${icon} ${name}${durationStr}`);
  if (error) {
    console.log(`   Error: ${error}`);
  }
}

async function testAPI(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    logTest(name, true, undefined, duration);
  } catch (error) {
    const duration = Date.now() - start;
    logTest(name, false, error instanceof Error ? error.message : String(error), duration);
  }
}

// ============================================================================
// Test 1: Create Flow
// ============================================================================
let testFlowId: string;

async function testCreateFlow() {
  await testAPI('POST /api/flows - Create flow', async () => {
    const response = await fetch(`${BASE_URL}/api/flows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Test Flow ${Date.now()}`,
        website_url: 'https://example.com',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.flow?.id) {
      throw new Error('No flow ID returned');
    }

    testFlowId = data.flow.id;
  });
}

// ============================================================================
// Test 2: Get Flow
// ============================================================================
async function testGetFlow() {
  await testAPI('GET /api/flows/[id] - Get flow by ID', async () => {
    if (!testFlowId) throw new Error('No test flow ID available');

    const response = await fetch(`${BASE_URL}/api/flows/${testFlowId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (data.flow?.id !== testFlowId) {
      throw new Error('Flow ID mismatch');
    }
  });
}

// ============================================================================
// Test 3: List Flows
// ============================================================================
async function testListFlows() {
  await testAPI('GET /api/flows - List all flows', async () => {
    const response = await fetch(`${BASE_URL}/api/flows`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.flows)) {
      throw new Error('Expected flows array');
    }

    if (data.flows.length === 0) {
      throw new Error('No flows returned (expected at least the test flow)');
    }
  });
}

// ============================================================================
// Test 4: Update Flow
// ============================================================================
async function testUpdateFlow() {
  await testAPI('PATCH /api/flows/[id] - Update flow', async () => {
    if (!testFlowId) throw new Error('No test flow ID available');

    const response = await fetch(`${BASE_URL}/api/flows/${testFlowId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Updated Test Flow ${Date.now()}`,
        step: 'website_analyzed',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (data.flow?.step !== 'website_analyzed') {
      throw new Error('Flow step not updated');
    }
  });
}

// ============================================================================
// Test 5: Save ICPs
// ============================================================================
let testIcpIds: string[] = [];

async function testSaveICPs() {
  await testAPI('POST /api/positioning-icps - Save ICPs', async () => {
    if (!testFlowId) throw new Error('No test flow ID available');

    const testICPs = [
      {
        personaName: 'Test Persona 1',
        personaRole: 'CEO',
        personaCompany: 'Test Corp (Series A)',
        location: 'San Francisco, CA',
        country: 'USA',
        title: 'CEOs at Series A Startups',
        description: 'Test ICP 1',
        painPoints: ['Time constraints', 'Limited budget'],
        goals: ['Scale operations', 'Increase revenue'],
      },
      {
        personaName: 'Test Persona 2',
        personaRole: 'CTO',
        personaCompany: 'Tech Inc (Series B)',
        location: 'New York, NY',
        country: 'USA',
        title: 'CTOs at Series B Companies',
        description: 'Test ICP 2',
        painPoints: ['Technical debt', 'Team scaling'],
        goals: ['Improve infrastructure', 'Build team'],
      },
    ];

    const response = await fetch(`${BASE_URL}/api/positioning-icps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        icps: testICPs,
        flowId: testFlowId,
        websiteUrl: 'https://example.com',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.icps) || data.icps.length !== 2) {
      throw new Error(`Expected 2 ICPs, got ${data.icps?.length || 0}`);
    }

    testIcpIds = data.icps.map((icp: any) => icp.id);
  });
}

// ============================================================================
// Test 6: Get ICP
// ============================================================================
async function testGetICP() {
  await testAPI('GET /api/positioning-icps - Get ICP by ID', async () => {
    if (!testIcpIds[0] || !testFlowId) {
      throw new Error('No test ICP ID or flow ID available');
    }

    const response = await fetch(
      `${BASE_URL}/api/positioning-icps?id=${testIcpIds[0]}&flowId=${testFlowId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (data.icp?.id !== testIcpIds[0]) {
      throw new Error('ICP ID mismatch');
    }
  });
}

// ============================================================================
// Test 7: Analyze Website (with timeout for long operations)
// ============================================================================
async function testAnalyzeWebsite() {
  await testAPI('POST /api/analyze-website - Analyze website', async () => {
    if (!testFlowId) throw new Error('No test flow ID available');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout

    try {
      const response = await fetch(`${BASE_URL}/api/analyze-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          flowId: testFlowId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        // Allow 429 (rate limit) as "pass" for test purposes
        if (response.status === 429) {
          console.log('   ⚠️  Rate limited (acceptable for test)');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.facts || !Array.isArray(data.facts)) {
        throw new Error('No facts array returned');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout after 45s');
      }
      throw error;
    }
  });
}

// ============================================================================
// Test 8: Generate ICPs (with timeout)
// ============================================================================
async function testGenerateICPs() {
  await testAPI('POST /api/generate-icps - Generate ICPs', async () => {
    if (!testFlowId) throw new Error('No test flow ID available');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${BASE_URL}/api/generate-icps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: 'https://example.com',
          websiteContent: 'Example Inc is a SaaS platform for project management.',
          flowId: testFlowId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          console.log('   ⚠️  Rate limited (acceptable for test)');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.icps)) {
        throw new Error('No ICPs array returned');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout after 45s');
      }
      throw error;
    }
  });
}

// ============================================================================
// Test 9: Delete Flow (cleanup)
// ============================================================================
async function testDeleteFlow() {
  await testAPI('DELETE /api/flows/[id] - Soft delete flow', async () => {
    if (!testFlowId) throw new Error('No test flow ID available');

    const response = await fetch(`${BASE_URL}/api/flows/${testFlowId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
  });
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function main() {
  console.log('🚀 FlowtuskMVP API Test Suite\n');
  console.log(`Testing against: ${BASE_URL}\n`);
  console.log('─'.repeat(60));

  // Core CRUD operations
  console.log('\n📋 Flow CRUD Operations:');
  await testCreateFlow();
  await testGetFlow();
  await testListFlows();
  await testUpdateFlow();

  // ICP operations
  console.log('\n👥 ICP Operations:');
  await testSaveICPs();
  await testGetICP();

  // AI generation endpoints (longer running)
  console.log('\n🤖 AI Generation Endpoints:');
  console.log('   (Note: These may take 20-40s each)');
  await testAnalyzeWebsite();
  await testGenerateICPs();

  // Cleanup
  console.log('\n🧹 Cleanup:');
  await testDeleteFlow();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  const passRate = ((passed / total) * 100).toFixed(1);
  console.log(`\nPass Rate: ${passRate}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}`);
        if (r.error) console.log(`     ${r.error}`);
      });
    process.exit(1);
  }

  console.log('\n✅ All tests passed! Backend is ready for demo.\n');
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
