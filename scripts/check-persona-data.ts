import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPersonaData() {
  console.log('🔍 Checking persona data...\n');

  // Get the most recent flow
  const { data: flows, error: flowError } = await supabase
    .from('positioning_flows')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (flowError || !flows || flows.length === 0) {
    console.error('❌ No flows found');
    return;
  }

  const flow = flows[0];
  console.log('📊 Flow ID:', flow.id);
  console.log('📅 Created:', flow.created_at);

  // Get ICPs for this flow
  const { data: icps, error: icpError } = await supabase
    .from('positioning_icps')
    .select('*')
    .eq('parent_flow', flow.id);

  if (icpError || !icps) {
    console.error('❌ Error fetching ICPs:', icpError);
    return;
  }

  console.log(`\n✅ Found ${icps.length} ICP(s)\n`);

  icps.forEach((icp, idx) => {
    console.log(`\n📋 ICP ${idx + 1}: ${icp.title}`);
    console.log('   ID:', icp.id);
    console.log('   👤 Name:', icp.persona_name || '(empty)');
    console.log('   💼 Role:', icp.persona_role || '(empty)');
    console.log('   🏢 Company:', icp.persona_company || '(empty)');
    console.log('   📍 Location:', icp.location || '(empty)');
    console.log('   🌍 Country:', icp.country || '(empty)');
    console.log('   💡 Pain Points:', icp.pain_points?.length || 0);
    console.log('   🎯 Goals:', icp.goals?.length || 0);
  });

  // Also check the manifest
  const { data: manifest, error: manifestError } = await supabase
    .from('brand_manifests')
    .select('manifest')
    .eq('flow_id', flow.id)
    .single();

  if (manifestError) {
    console.log('\n⚠️ No manifest found for this flow');
    return;
  }

  const persona = manifest.manifest?.strategy?.persona;
  console.log('\n\n📄 Manifest Persona Data:');
  console.log('   👤 Name:', persona?.name || '(empty)');
  console.log('   💼 Role:', persona?.role || '(empty)');
  console.log('   🏢 Company:', persona?.company || '(empty)');
  console.log('   📍 Location:', persona?.location || '(empty)');
  console.log('   🌍 Country:', persona?.country || '(empty)');
}

checkPersonaData().catch(console.error);
