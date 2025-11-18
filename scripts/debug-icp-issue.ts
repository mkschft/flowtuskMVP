/**
 * Debug ICP Issue
 * Run this to check if ICPs are being saved to database
 * Usage: source .env.local && npx tsx scripts/debug-icp-issue.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('   Run: source .env.local && npx tsx scripts/debug-icp-issue.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugICPs() {
  console.log('\n🔍 Checking ICP Database State\n');
  
  // Check recent flows
  const { data: flows, error: flowsError } = await supabase
    .from('positioning_flows')
    .select('id, title, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (flowsError) {
    console.error('❌ Error fetching flows:', flowsError);
    return;
  }
  
  console.log('📋 Recent flows:');
  flows?.forEach(f => {
    console.log(`  - ${f.title} (${f.id.substring(0, 8)}...) user_id: ${f.user_id || 'NULL (demo)'}`);
  });
  
  // Check ICPs
  const { data: icps, error: icpsError } = await supabase
    .from('positioning_icps')
    .select('id, title, parent_flow, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (icpsError) {
    console.error('❌ Error fetching ICPs:', icpsError);
    console.error('   This might mean RLS is blocking or table doesn\'t exist');
    return;
  }
  
  console.log('\n👥 Recent ICPs:');
  if (!icps || icps.length === 0) {
    console.log('  ⚠️  NO ICPs found in database!');
    console.log('  This means ICPs are NOT being saved.');
  } else {
    icps?.forEach(icp => {
      console.log(`  - ${icp.title} (${icp.id.substring(0, 8)}...) flow: ${icp.parent_flow.substring(0, 8)}...`);
    });
  }
  
  // Check RLS policies
  const { data: policies, error: policiesError } = await supabase
    .rpc('pg_policies')
    .eq('tablename', 'positioning_icps');
  
  if (!policiesError && policies) {
    console.log('\n🔒 RLS Policies on positioning_icps:');
    console.log(policies);
  }
}

debugICPs().catch(console.error);
