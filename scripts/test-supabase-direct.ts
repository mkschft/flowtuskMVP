/**
 * Test Direct Supabase Connection
 * Bypass Next.js to test raw database access
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcaymdcqraatzuprvgkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYXltZGNxcmFhdHp1cHJ2Z2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMzE1MTMsImV4cCI6MjA3ODYwNzUxM30.lu9bPkdbldJ36Tv8QLZ-FmLPIHwPbi-B25N6sRrWA6g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n🔌 Testing Direct Supabase Connection\n');
  
  // Test 1: Check tables exist
  console.log('1️⃣ Checking if positioning_flows table exists...');
  const { data: flows, error: flowsError } = await supabase
    .from('positioning_flows')
    .select('id, title, user_id, created_at')
    .limit(5);
  
  if (flowsError) {
    console.error('❌ Error reading positioning_flows:');
    console.error('   Code:', flowsError.code);
    console.error('   Message:', flowsError.message);
    console.error('   Details:', flowsError.details);
    console.error('   Hint:', flowsError.hint);
    
    if (flowsError.code === '42P01') {
      console.error('\n💡 Table does not exist! You need to run migrations.');
      console.error('   Check: supabase/migrations/*.sql files');
    }
    return;
  }
  
  console.log('✅ positioning_flows table exists');
  console.log('   Found', flows?.length || 0, 'flows');
  
  if (flows && flows.length > 0) {
    flows.forEach(f => {
      console.log(`   - ${f.title || 'Untitled'} (${f.id.substring(0, 8)}...) user: ${f.user_id || 'NULL'}`);
    });
  } else {
    console.log('   ⚠️  No flows found (this might be normal for a fresh database)');
  }
  
  // Test 2: Check RLS policies
  console.log('\n2️⃣ Testing RLS with demo mode...');
  
  // Try to insert a test flow
  const { data: newFlow, error: insertError } = await supabase
    .from('positioning_flows')
    .insert({
      title: 'Test Flow ' + Date.now(),
      website_url: 'https://test.com',
      step: 'initial',
      user_id: null, // Demo mode - null user_id
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('❌ Error inserting test flow:');
    console.error('   Code:', insertError.code);
    console.error('   Message:', insertError.message);
    
    if (insertError.code === '42501') {
      console.error('\n💡 RLS Policy blocking insert!');
      console.error('   The database has Row Level Security enabled but no policy allows inserts.');
      console.error('   Check: Migration 011 might not be applied.');
    }
    return;
  }
  
  console.log('✅ Successfully inserted test flow:', newFlow?.id);
  
  // Test 3: Try ICPs table
  console.log('\n3️⃣ Checking positioning_icps table...');
  const { data: icps, error: icpsError } = await supabase
    .from('positioning_icps')
    .select('id, title, parent_flow')
    .limit(5);
  
  if (icpsError) {
    console.error('❌ Error reading positioning_icps:');
    console.error('   Code:', icpsError.code);
    console.error('   Message:', icpsError.message);
    return;
  }
  
  console.log('✅ positioning_icps table exists');
  console.log('   Found', icps?.length || 0, 'ICPs');
  
  console.log('\n✅ Database connection is working!');
  console.log('   Problem is likely in the Next.js API routes, not Supabase itself.');
}

testConnection().catch(err => {
  console.error('\n💥 Connection test crashed:', err.message);
  console.error('   Full error:', err);
});
