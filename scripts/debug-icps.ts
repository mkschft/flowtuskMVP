#!/usr/bin/env tsx
/**
 * Debug script to test ICP insertion and diagnose the "Failed to load persona data" issue
 * 
 * Usage: npx tsx scripts/debug-icps.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Simple .env.local parser
function loadEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    const env: Record<string, string> = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
    return env;
  } catch (e) {
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testICPInsertion() {
  console.log('🔍 Testing ICP insertion flow...\n');

  // Step 1: Check if positioning_flows table exists and has data
  console.log('1️⃣ Checking positioning_flows table...');
  const { data: flows, error: flowsError } = await supabase
    .from('positioning_flows')
    .select('id, user_id, title, metadata')
    .order('created_at', { ascending: false })
    .limit(3);

  if (flowsError) {
    console.error('❌ Error fetching flows:', flowsError);
    return;
  }

  if (!flows || flows.length === 0) {
    console.log('⚠️  No flows found. Create a flow first at http://localhost:3000/app');
    return;
  }

  console.log(`✅ Found ${flows.length} recent flows:`);
  flows.forEach((flow, i) => {
    const isDemo = flow.metadata?.feature_flags?.is_demo;
    console.log(`   ${i + 1}. ${flow.title} (${flow.id.slice(0, 8)}...) ${isDemo ? '[DEMO]' : ''}`);
  });

  // Step 2: Try to insert a test ICP
  const testFlow = flows[0];
  console.log(`\n2️⃣ Testing ICP insertion for flow: ${testFlow.title}`);

  const testICP = {
    parent_flow: testFlow.id,
    website_url: 'https://example.com',
    persona_name: 'Test Persona',
    persona_role: 'Head of Marketing',
    persona_company: 'Test Corp (Series B)',
    location: 'San Francisco, CA',
    country: 'USA',
    title: 'Marketing Leaders at Series B SaaS',
    description: 'Test ICP for debugging',
    pain_points: ['Time constraints', 'Manual processes'],
    goals: ['Grow pipeline'],
    fit_score: 90,
    profiles_found: 12,
  };

  const { data: insertedICP, error: insertError } = await supabase
    .from('positioning_icps')
    .insert(testICP)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Failed to insert ICP:');
    console.error('   Error:', insertError.message);
    console.error('   Code:', insertError.code);
    console.error('   Details:', insertError.details);
    console.error('   Hint:', insertError.hint);
    
    if (insertError.code === '42501') {
      console.log('\n💡 This is an RLS (Row Level Security) error.');
      console.log('   Likely causes:');
      console.log('   - You are not authenticated (no auth.uid())');
      console.log('   - The flow belongs to a different user');
      console.log('   - Demo mode is not properly configured');
      console.log('\n   Check your RLS policies in Supabase.');
    } else if (insertError.code === '23503') {
      console.log('\n💡 This is a foreign key constraint error.');
      console.log('   The parent_flow ID does not exist in positioning_flows.');
    }
    
    return;
  }

  console.log('✅ Successfully inserted test ICP:', insertedICP.id);

  // Step 3: Try to fetch the ICP back
  console.log('\n3️⃣ Testing ICP retrieval...');
  const { data: fetchedICP, error: fetchError } = await supabase
    .from('positioning_icps')
    .select('*')
    .eq('id', insertedICP.id)
    .eq('parent_flow', testFlow.id)
    .single();

  if (fetchError) {
    console.error('❌ Failed to fetch ICP:', fetchError);
    return;
  }

  console.log('✅ Successfully fetched ICP:', fetchedICP.persona_name);

  // Step 4: Check existing ICPs
  console.log('\n4️⃣ Checking all ICPs for this flow...');
  const { data: allICPs, error: allICPsError } = await supabase
    .from('positioning_icps')
    .select('id, persona_name, title')
    .eq('parent_flow', testFlow.id);

  if (allICPsError) {
    console.error('❌ Error fetching ICPs:', allICPsError);
    return;
  }

  console.log(`✅ Found ${allICPs?.length || 0} ICPs for this flow`);
  allICPs?.forEach((icp, i) => {
    console.log(`   ${i + 1}. ${icp.persona_name} (${icp.id.slice(0, 8)}...)`);
  });

  // Cleanup
  console.log('\n5️⃣ Cleaning up test ICP...');
  await supabase
    .from('positioning_icps')
    .delete()
    .eq('id', insertedICP.id);
  console.log('✅ Test ICP deleted');

  console.log('\n✅ All tests passed! ICP insertion/retrieval is working.');
}

async function checkAuth() {
  console.log('\n🔑 Checking authentication status...');
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('⚠️  Not authenticated (using anon key)');
    console.log('   This matches demo mode behavior');
  } else {
    console.log('✅ Authenticated as:', user.email);
  }
}

async function main() {
  console.log('🚀 ICP Debug Script\n');
  console.log('Environment:', {
    supabaseUrl: supabaseUrl?.slice(0, 30) + '...',
    hasAnonKey: !!supabaseKey,
    demoMode: env.NEXT_PUBLIC_DEMO_MODE_ENABLED || process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED,
  });
  console.log('');

  await checkAuth();
  console.log('');
  await testICPInsertion();
}

main().catch(console.error);
