/**
 * Debug script to inspect brand manifest data
 * Usage: npx tsx scripts/debug-manifest.ts <flowId>
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugManifest(flowId: string) {
    console.log('🔍 Debugging manifest for flowId:', flowId);
    console.log('');

    // 1. Check if manifest exists
    const { data: manifests, error: manifestError } = await supabase
        .from('brand_manifests')
        .select('*')
        .eq('flow_id', flowId);

    if (manifestError) {
        console.error('❌ Error fetching manifest:', manifestError);
        return;
    }

    if (!manifests || manifests.length === 0) {
        console.log('⚠️ No manifest found for this flowId');
        console.log('');

        // Check if design assets exist
        const { data: assets } = await supabase
            .from('positioning_design_assets')
            .select('id, generation_state, brand_guide, style_guide')
            .eq('parent_flow', flowId)
            .single();

        if (assets) {
            console.log('✅ Design assets exist:');
            console.log('Generation state:', JSON.stringify(assets.generation_state, null, 2));
            console.log('');
            console.log('Brand guide sample:', JSON.stringify(assets.brand_guide?.colors, null, 2));
        } else {
            console.log('❌ No design assets found either');
        }
        return;
    }

    console.log(`✅ Found ${manifests.length} manifest(s)`);
    console.log('');

    const manifest = manifests[0];
    const manifestData = manifest.manifest;

    console.log('📋 Manifest Metadata:');
    console.log('  Brand Key:', manifest.brand_key);
    console.log('  Version:', manifest.version);
    console.log('  Created:', manifest.created_at);
    console.log('  Updated:', manifest.updated_at);
    console.log('');

    console.log('📦 Manifest Structure:');
    console.log('  Brand Name:', manifestData.brandName);
    console.log('  Brand Key:', manifestData.brandKey);
    console.log('  Last Updated:', manifestData.lastUpdated);
    console.log('');

    console.log('🎯 Strategy Section:');
    console.log('  Persona:', manifestData.strategy?.persona ? '✅' : '❌');
    if (manifestData.strategy?.persona) {
        console.log('    Name:', manifestData.strategy.persona.name);
        console.log('    Role:', manifestData.strategy.persona.role);
        console.log('    Company:', manifestData.strategy.persona.company);
    }
    console.log('  Value Prop:', manifestData.strategy?.valueProp ? '✅' : '❌');
    if (manifestData.strategy?.valueProp) {
        console.log('    Headline:', manifestData.strategy.valueProp.headline);
        console.log('    Subheadline:', manifestData.strategy.valueProp.subheadline);
    }
    console.log('');

    console.log('🎨 Identity Section:');
    console.log('  Colors:', manifestData.identity?.colors ? '✅' : '❌');
    if (manifestData.identity?.colors) {
        console.log('    Primary:', manifestData.identity.colors.primary?.length || 0, 'colors');
        console.log('    Secondary:', manifestData.identity.colors.secondary?.length || 0, 'colors');
    }
    console.log('  Typography:', manifestData.identity?.typography ? '✅' : '❌');
    if (manifestData.identity?.typography) {
        console.log('    Heading:', manifestData.identity.typography.heading?.family);
        console.log('    Body:', manifestData.identity.typography.body?.family);
    }
    console.log('  Tone:', manifestData.identity?.tone ? '✅' : '❌');
    if (manifestData.identity?.tone) {
        console.log('    Keywords:', manifestData.identity.tone.keywords);
        console.log('    Personality:', manifestData.identity.tone.personality?.length || 0, 'traits');
    }
    console.log('  Logo:', manifestData.identity?.logo ? '✅' : '❌');
    console.log('');

    console.log('🧩 Components Section:');
    console.log('  Buttons:', manifestData.components?.buttons ? '✅' : '❌');
    console.log('  Cards:', manifestData.components?.cards ? '✅' : '❌');
    console.log('');

    console.log('📄 Full Manifest JSON:');
    console.log(JSON.stringify(manifestData, null, 2));
}

const flowId = process.argv[2];

if (!flowId) {
    console.error('❌ Please provide a flowId as argument');
    console.log('Usage: npx tsx scripts/debug-manifest.ts <flowId>');
    process.exit(1);
}

debugManifest(flowId).then(() => process.exit(0));
