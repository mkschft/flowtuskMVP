// Automated scraping test runner
// Usage: node test-scraping.js
// Make sure dev server is running: npm run dev

const testUrls = [
  { name: 'Normal B2B SaaS', url: 'https://linear.app' },
  { name: 'Another SaaS', url: 'https://notion.so' },
  { name: 'Large enterprise site', url: 'https://aws.amazon.com' },
  { name: 'Simple static site', url: 'https://example.com' },
  { name: 'Marketing site', url: 'https://stripe.com' },
  { name: 'Protected site (may fail)', url: 'https://netflix.com' },
];

async function testScrape(name, url) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      console.log(`   ❌ Failed (${response.status}) in ${duration}ms`);
      const error = await response.json();
      console.log(`   Error: ${error.error || 'Unknown'}`);
      return { name, url, success: false, duration, error: error.error };
    }
    
    const data = await response.json();
    const cached = data.cached ? ' (CACHED ⚡)' : '';
    console.log(`   ✅ Success in ${duration}ms${cached}`);
    console.log(`   Source: ${data.source}`);
    console.log(`   Content: ${(data.content?.length || 0).toLocaleString()} chars`);
    console.log(`   Facts: ${data.factsJson?.facts?.length || 0}`);
    console.log(`   Value Props: ${data.factsJson?.valueProps?.length || 0}`);
    
    return { 
      name, 
      url, 
      success: true, 
      duration, 
      source: data.source, 
      cached: data.cached,
      facts: data.factsJson?.facts?.length || 0 
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Network error in ${duration}ms`);
    console.log(`   ${error.message}`);
    return { name, url, success: false, duration, error: error.message };
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Flowtusk Scraping Test Runner           ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('Make sure dev server is running: npm run dev\n');
  
  const results = [];
  
  // First pass - no cache
  console.log('═══════════════════════════════════════════════');
  console.log('  FIRST PASS (Cold start - no cache)');
  console.log('═══════════════════════════════════════════════');
  
  for (const test of testUrls) {
    const result = await testScrape(test.name, test.url);
    results.push({ ...result, pass: 1 });
    await new Promise(r => setTimeout(r, 1000)); // 1s between tests
  }
  
  // Second pass - should use cache
  console.log('\n\n═══════════════════════════════════════════════');
  console.log('  SECOND PASS (Cache test)');
  console.log('═══════════════════════════════════════════════');
  
  for (const test of testUrls) {
    const result = await testScrape(test.name, test.url);
    results.push({ ...result, pass: 2 });
    await new Promise(r => setTimeout(r, 500)); // 500ms between cached tests
  }
  
  // Summary statistics
  console.log('\n\n╔════════════════════════════════════════════╗');
  console.log('║   TEST SUMMARY                             ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const pass1 = results.filter(r => r.pass === 1);
  const pass2 = results.filter(r => r.pass === 2);
  
  const pass1Success = pass1.filter(r => r.success);
  const pass2Success = pass2.filter(r => r.success);
  
  console.log('First Pass (No Cache):');
  console.log(`  ✅ Success: ${pass1Success.length}/${pass1.length} (${Math.round(pass1Success.length/pass1.length*100)}%)`);
  console.log(`  ⏱️  Avg time: ${Math.round(pass1.reduce((sum, r) => sum + r.duration, 0) / pass1.length).toLocaleString()}ms`);
  console.log(`  🚀 Fastest: ${Math.min(...pass1Success.map(r => r.duration))}ms`);
  console.log(`  🐌 Slowest: ${Math.max(...pass1Success.map(r => r.duration)).toLocaleString()}ms`);
  
  console.log('\nSecond Pass (Cache):');
  console.log(`  ✅ Success: ${pass2Success.length}/${pass2.length} (${Math.round(pass2Success.length/pass2.length*100)}%)`);
  console.log(`  ⚡ Cached: ${pass2.filter(r => r.cached).length}/${pass2Success.length}`);
  console.log(`  ⏱️  Avg time: ${Math.round(pass2.reduce((sum, r) => sum + r.duration, 0) / pass2.length).toLocaleString()}ms`);
  console.log(`  🚀 Fastest: ${Math.min(...pass2Success.map(r => r.duration))}ms`);
  
  const avgTime1 = pass1.reduce((sum, r) => sum + r.duration, 0) / pass1.length;
  const avgTime2 = pass2.reduce((sum, r) => sum + r.duration, 0) / pass2.length;
  const speedup = (avgTime1 / avgTime2).toFixed(1);
  
  console.log(`\n🎉 Cache speedup: ${speedup}x faster`);
  
  // Performance ratings
  console.log('\n📊 Performance Rating:');
  const avgFirstPass = Math.round(avgTime1);
  if (avgFirstPass < 5000) {
    console.log('  🌟 EXCELLENT - Average first scrape < 5s');
  } else if (avgFirstPass < 8000) {
    console.log('  ✅ GOOD - Average first scrape < 8s');
  } else if (avgFirstPass < 12000) {
    console.log('  ⚠️  ACCEPTABLE - Average first scrape < 12s');
  } else {
    console.log('  ❌ NEEDS IMPROVEMENT - Average first scrape > 12s');
  }
  
  const cacheHitRate = pass2.filter(r => r.cached).length / pass2Success.length;
  if (cacheHitRate >= 0.8) {
    console.log(`  🌟 EXCELLENT - ${Math.round(cacheHitRate * 100)}% cache hit rate`);
  } else if (cacheHitRate >= 0.6) {
    console.log(`  ✅ GOOD - ${Math.round(cacheHitRate * 100)}% cache hit rate`);
  } else {
    console.log(`  ⚠️  LOW - ${Math.round(cacheHitRate * 100)}% cache hit rate (check cache implementation)`);
  }
  
  // Failed tests
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(f => {
      console.log(`  - ${f.name} (Pass ${f.pass}): ${f.error}`);
    });
  }
  
  console.log('\n✅ Test run complete!\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error);
  process.exit(1);
});
