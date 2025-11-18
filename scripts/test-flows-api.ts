/**
 * Test Flows API
 * Quick test to see if flows are being created
 */

async function testFlowsAPI() {
  const baseUrl = 'http://localhost:3002';
  
  console.log('\n🧪 Testing Flows API\n');
  
  // Test 1: Create a flow
  console.log('1️⃣ Creating a test flow...');
  const createRes = await fetch(`${baseUrl}/api/flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Flow ' + Date.now(),
      step: 'initial',
    }),
  });
  
  if (!createRes.ok) {
    console.error('❌ Failed to create flow:', createRes.status, createRes.statusText);
    const error = await createRes.json();
    console.error('   Error:', error);
    return;
  }
  
  const { flow } = await createRes.json();
  console.log('✅ Flow created:', flow.id);
  console.log('   user_id:', flow.user_id || 'NULL (demo)');
  console.log('   title:', flow.title);
  
  // Test 2: List flows
  console.log('\n2️⃣ Listing flows...');
  const listRes = await fetch(`${baseUrl}/api/flows`);
  
  if (!listRes.ok) {
    console.error('❌ Failed to list flows:', listRes.status);
    return;
  }
  
  const { flows } = await listRes.json();
  console.log('✅ Found', flows?.length || 0, 'flows');
  flows?.slice(0, 3).forEach((f: any) => {
    console.log(`   - ${f.title} (${f.id.substring(0, 8)}...)`);
  });
  
  // Test 3: Save ICPs to that flow
  console.log('\n3️⃣ Saving test ICPs...');
  const testIcps = [
    {
      id: 'temp-1',
      title: 'Test Persona',
      description: 'A test persona',
      personaName: 'Test User',
      personaRole: 'Developer',
      personaCompany: 'Test Co',
      location: 'San Francisco',
      country: 'USA',
      painPoints: ['Testing'],
      goals: ['Working features'],
    },
  ];
  
  const saveIcpsRes = await fetch(`${baseUrl}/api/positioning-icps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      icps: testIcps,
      flowId: flow.id,
      websiteUrl: 'https://test.com',
    }),
  });
  
  if (!saveIcpsRes.ok) {
    console.error('❌ Failed to save ICPs:', saveIcpsRes.status);
    const error = await saveIcpsRes.json();
    console.error('   Error:', error.error);
    console.error('   Details:', error.details);
    return;
  }
  
  const { icps: savedIcps } = await saveIcpsRes.json();
  console.log('✅ Saved', savedIcps?.length || 0, 'ICPs');
  savedIcps?.forEach((icp: any) => {
    console.log(`   - ${icp.title} (${icp.id})`);
  });
  
  console.log('\n✅ All tests passed! Your database is working.');
}

testFlowsAPI().catch(err => {
  console.error('\n❌ Test failed:', err.message);
});
