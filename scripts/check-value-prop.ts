import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkValueProp() {
  const flowId = '4a788d0c-cc4b-46af-a1ea-5991e0d397c9';

  console.log('🔍 Checking value prop for flow:', flowId);

  const { data, error } = await supabase
    .from('brand_manifests')
    .select('manifest')
    .eq('flow_id', flowId)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data) {
    console.log('⚠️ No manifest found');
    return;
  }

  const valueProp = data.manifest?.strategy?.valueProp;

  console.log('\n📊 Value Prop in Database:');
  console.log(JSON.stringify(valueProp, null, 2));

  // Check if empty
  const isEmpty = !valueProp?.headline && !valueProp?.problem && !valueProp?.solution;

  if (isEmpty) {
    console.log('\n❌ Value prop is EMPTY in database');
    console.log('   - headline:', valueProp?.headline || '(empty)');
    console.log('   - problem:', valueProp?.problem || '(empty)');
    console.log('   - solution:', valueProp?.solution || '(empty)');
  } else {
    console.log('\n✅ Value prop has data:');
    console.log('   - headline:', valueProp?.headline?.substring(0, 60) + '...');
    console.log('   - problem:', valueProp?.problem?.substring(0, 60) + '...');
    console.log('   - solution:', valueProp?.solution?.substring(0, 60) + '...');
  }
}

checkValueProp().catch(console.error);
