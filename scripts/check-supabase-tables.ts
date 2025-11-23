/**
 * Check Supabase Tables and Frontend Connections
 * 
 * This script:
 * 1. Lists all tables in the database
 * 2. Checks which tables the frontend is using
 * 3. Verifies connections are working
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables that the frontend code is using (from grep results)
const FRONTEND_TABLES = [
  'positioning_flows',
  'positioning_icps',
  'positioning_value_props',
  'positioning_design_assets',
  'brand_manifests',
  'brand_manifest_history',
  'user_profiles',
  'landing_pages',
  'leads',
  'flows', // Legacy table (might be archived)
];

async function checkTables() {
  console.log('\n🔍 Checking Supabase Tables and Frontend Connections\n');
  console.log('=' .repeat(60));

  // Test each table that frontend uses
  const results: Array<{
    table: string;
    exists: boolean;
    accessible: boolean;
    error?: string;
    rowCount?: number;
  }> = [];

  for (const table of FRONTEND_TABLES) {
    try {
      // Try to query the table (limit 1 to check if it exists and is accessible)
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          results.push({
            table,
            exists: false,
            accessible: false,
            error: 'Table does not exist',
          });
        } else {
          // Table exists but might have RLS issues
          results.push({
            table,
            exists: true,
            accessible: false,
            error: error.message,
          });
        }
      } else {
        results.push({
          table,
          exists: true,
          accessible: true,
          rowCount: count || 0,
        });
      }
    } catch (err: any) {
      results.push({
        table,
        exists: false,
        accessible: false,
        error: err.message || 'Unknown error',
      });
    }
  }

  // Print results
  console.log('\n📊 Table Status:\n');
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  const inaccessible = results.filter(r => r.exists && !r.accessible);

  console.log('✅ Existing & Accessible Tables:');
  existing.filter(r => r.accessible).forEach(r => {
    console.log(`   ✓ ${r.table.padEnd(35)} (${r.rowCount || 0} rows)`);
  });

  if (inaccessible.length > 0) {
    console.log('\n⚠️  Existing but Inaccessible Tables:');
    inaccessible.forEach(r => {
      console.log(`   ⚠ ${r.table.padEnd(35)} Error: ${r.error}`);
    });
  }

  if (missing.length > 0) {
    console.log('\n❌ Missing Tables:');
    missing.forEach(r => {
      console.log(`   ✗ ${r.table.padEnd(35)} ${r.error}`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 Summary:');
  console.log(`   Total tables checked: ${FRONTEND_TABLES.length}`);
  console.log(`   ✅ Existing & accessible: ${existing.filter(r => r.accessible).length}`);
  console.log(`   ⚠️  Existing but inaccessible: ${inaccessible.length}`);
  console.log(`   ❌ Missing: ${missing.length}`);

  // Check for tables that exist but aren't used by frontend
  console.log('\n🔍 Checking for additional tables in database...');
  try {
    // We can't directly query information_schema via Supabase client
    // But we can try to detect by attempting common table names
    const commonTables = ['users', 'auth.users', 'profiles'];
    const additionalTables: string[] = [];
    
    for (const table of commonTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          additionalTables.push(table);
        }
      } catch {
        // Ignore
      }
    }

    if (additionalTables.length > 0) {
      console.log('   Found additional tables:', additionalTables.join(', '));
    }
  } catch (err) {
    // Can't query information_schema directly
  }

  // Test a real query on a key table
  console.log('\n🧪 Testing Real Query (positioning_flows):');
  try {
    const { data, error } = await supabase
      .from('positioning_flows')
      .select('id, title, user_id, created_at')
      .limit(5);

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      console.log(`   ✅ Success! Found ${data?.length || 0} flows`);
      if (data && data.length > 0) {
        console.log('   Sample flows:');
        data.slice(0, 3).forEach((flow: any) => {
          console.log(`      - ${flow.title || 'Untitled'} (${flow.id.substring(0, 8)}...)`);
        });
      }
    }
  } catch (err: any) {
    console.log(`   ❌ Exception: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Next Steps:');
  
  if (missing.length > 0) {
    console.log('   1. Run missing migrations:');
    missing.forEach(r => {
      console.log(`      - Check migrations for: ${r.table}`);
    });
  }

  if (inaccessible.length > 0) {
    console.log('   2. Fix RLS policies for inaccessible tables');
    console.log('      - Check supabase/migrations/*_rls*.sql');
  }

  console.log('   3. Verify environment variables are set correctly');
  console.log('   4. Check Supabase dashboard for table existence\n');
}

// Run the check
checkTables().catch(console.error);

