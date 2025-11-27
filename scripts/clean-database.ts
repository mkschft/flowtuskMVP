import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Delete in reverse dependency order to avoid foreign key violations
    console.log('🗑️  Deleting brand_manifests...');
    const { error: manifestError, count: manifestCount } = await supabase
      .from('brand_manifests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (manifestError) {
      console.error('❌ Error deleting brand_manifests:', manifestError);
    } else {
      console.log(`✅ Deleted ${manifestCount || 0} brand manifests`);
    }

    console.log('\n🗑️  Deleting positioning_design_assets...');
    const { error: assetsError, count: assetsCount } = await supabase
      .from('positioning_design_assets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (assetsError) {
      console.error('❌ Error deleting design assets:', assetsError);
    } else {
      console.log(`✅ Deleted ${assetsCount || 0} design assets`);
    }

    console.log('\n🗑️  Deleting positioning_icps...');
    const { error: icpError, count: icpCount } = await supabase
      .from('positioning_icps')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (icpError) {
      console.error('❌ Error deleting ICPs:', icpError);
    } else {
      console.log(`✅ Deleted ${icpCount || 0} ICPs`);
    }

    console.log('\n🗑️  Deleting positioning_flows...');
    const { error: flowError, count: flowCount } = await supabase
      .from('positioning_flows')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (flowError) {
      console.error('❌ Error deleting flows:', flowError);
    } else {
      console.log(`✅ Deleted ${flowCount || 0} flows`);
    }

    console.log('\n✅ Database cleanup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Hard refresh browser (Cmd+Shift+R)');
    console.log('   2. Restart dev server (Ctrl+C, rm -rf .next, npm run dev)');
    console.log('   3. Start new flow with fresh business idea');
    console.log('   4. Watch terminal logs for value prop generation');
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    process.exit(1);
  }
}

cleanDatabase();
