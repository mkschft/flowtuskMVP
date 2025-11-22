/**
 * One-time migration script to convert all legacy positioning data to brand manifests
 * 
 * Usage: npx tsx scripts/migrate-all-to-manifests.ts
 * 
 * This script:
 * 1. Finds all flows with legacy data (ICPs, value props, design assets)
 * 2. Checks if they already have a brand manifest
 * 3. Migrates missing manifests using the existing transformation logic
 * 4. Reports progress and any errors
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface MigrationStats {
    total: number;
    alreadyMigrated: number;
    migrated: number;
    failed: number;
    errors: Array<{ flowId: string; error: string }>;
}

async function migrateAllToManifests() {
    console.log('🚀 Starting brand manifest migration...\n');

    const stats: MigrationStats = {
        total: 0,
        alreadyMigrated: 0,
        migrated: 0,
        failed: 0,
        errors: []
    };

    try {
        // 1. Get all flows
        const { data: flows, error: flowsError } = await supabase
            .from('positioning_flows')
            .select('id, user_id, title');

        if (flowsError) {
            console.error('❌ Failed to fetch flows:', flowsError);
            return;
        }

        console.log(`📊 Found ${flows?.length || 0} flows\n`);
        stats.total = flows?.length || 0;

        if (!flows || flows.length === 0) {
            console.log('No flows to migrate');
            return;
        }

        // 2. For each flow, check if it needs migration
        for (const flow of flows) {
            try {
                console.log(`\n🔍 Processing flow: ${flow.id} (${flow.title})`);

                // Check if manifest already exists
                const { data: existingManifest } = await supabase
                    .from('brand_manifests')
                    .select('id, brand_key')
                    .eq('flow_id', flow.id)
                    .single();

                if (existingManifest) {
                    console.log(`  ✅ Manifest already exists (${existingManifest.brand_key})`);
                    stats.alreadyMigrated++;
                    continue;
                }

                // Fetch legacy data for this flow
                const { data: icps } = await supabase
                    .from('positioning_icps')
                    .select('*')
                    .eq('parent_flow', flow.id);

                if (!icps || icps.length === 0) {
                    console.log('  ⏭️  No ICPs found, skipping');
                    continue;
                }

                // Use first ICP (most common case)
                const icp = icps[0];
                console.log(`  📝 Found ICP: ${icp.title}`);

                // Fetch value prop
                const { data: valueProp } = await supabase
                    .from('positioning_value_props')
                    .select('*')
                    .eq('icp_id', icp.id)
                    .single();

                // Fetch design assets
                const { data: designAssets } = await supabase
                    .from('positioning_design_assets')
                    .select('*')
                    .eq('icp_id', icp.id)
                    .single();

                // Check if we have enough data to migrate
                if (!designAssets?.brand_guide) {
                    console.log('  ⏭️  No design assets generated yet, skipping');
                    continue;
                }

                console.log('  🔄 Migrating to brand manifest...');

                // Generate brand key
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                let key = '';
                for (let i = 0; i < 8; i++) {
                    key += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                const brandKey = `FLOW-${key.substring(0, 4)}-${key.substring(4)}`;

                // Build manifest
                const primaryHex = designAssets?.brand_guide?.colors?.primary?.[0]?.hex || '#000000';
                const secondaryHex = designAssets?.brand_guide?.colors?.secondary?.[0]?.hex || '#333333';

                const manifest = {
                    version: '1.0',
                    brandName: icp.persona_company || flow.title || 'Brand',
                    brandKey,
                    lastUpdated: new Date().toISOString(),
                    strategy: {
                        persona: {
                            name: icp.persona_name || '',
                            role: icp.persona_role || '',
                            company: icp.persona_company || '',
                            industry: icp.industry || '',
                            location: icp.location || '',
                            country: icp.country || '',
                            painPoints: icp.pain_points || [],
                            goals: icp.goals || []
                        },
                        valueProp: valueProp ? {
                            headline: valueProp.headline || valueProp.summary?.mainInsight || '',
                            subheadline: valueProp.subheadline || valueProp.summary?.approachStrategy || '',
                            problem: valueProp.problem || (Array.isArray(icp.pain_points) ? icp.pain_points.join(', ') : ''),
                            solution: valueProp.solution || valueProp.summary?.approachStrategy || '',
                            outcome: valueProp.outcome || valueProp.summary?.expectedImpact || '',
                            benefits: valueProp.benefits || (Array.isArray(valueProp.variations) ? valueProp.variations.map((v: any) => v.text) : []),
                            targetAudience: valueProp.target_audience || icp.title || ''
                        } : {
                            headline: '', subheadline: '', problem: '', solution: '', outcome: '', benefits: [], targetAudience: ''
                        }
                    },
                    identity: {
                        colors: {
                            primary: [{ name: 'Primary', hex: primaryHex, usage: 'Main brand color' }],
                            secondary: [{ name: 'Secondary', hex: secondaryHex }],
                            accent: [],
                            neutral: []
                        },
                        typography: {
                            heading: {
                                family: designAssets?.brand_guide?.typography?.find((t: any) => t.category === 'heading')?.fontFamily || 'Inter',
                                weights: ['700'],
                                sizes: { h1: '48px', h2: '36px', h3: '30px' }
                            },
                            body: {
                                family: designAssets?.brand_guide?.typography?.find((t: any) => t.category === 'body')?.fontFamily || 'Inter',
                                weights: ['400'],
                                sizes: { base: '16px', small: '14px' }
                            }
                        },
                        logo: {
                            variations: designAssets?.brand_guide?.logoVariations || []
                        },
                        tone: {
                            keywords: designAssets?.brand_guide?.toneOfVoice || [],
                            personality: (designAssets?.brand_guide?.personalityTraits || []).map((trait: any) => ({
                                trait: trait.label || trait,
                                value: trait.value || 50,
                                leftLabel: trait.leftLabel || '',
                                rightLabel: trait.rightLabel || ''
                            }))
                        }
                    },
                    components: {
                        buttons: {
                            primary: {
                                style: designAssets?.style_guide?.buttons?.[0]?.style || 'solid',
                                borderRadius: designAssets?.style_guide?.borderRadius || '8px',
                                shadow: 'none'
                            },
                            secondary: { style: 'outline', borderRadius: '8px', shadow: 'none' },
                            outline: { style: 'ghost', borderRadius: '8px', shadow: 'none' }
                        },
                        cards: {
                            style: designAssets?.style_guide?.cards?.[0]?.style || 'flat',
                            borderRadius: designAssets?.style_guide?.borderRadius || '12px',
                            shadow: 'sm'
                        },
                        inputs: { style: 'outlined', borderRadius: '8px', focusStyle: 'ring' },
                        spacing: { scale: {} }
                    },
                    previews: {
                        landingPage: {
                            hero: {
                                headline: designAssets?.landing_page?.hero?.headline || '',
                                subheadline: designAssets?.landing_page?.hero?.subheadline || '',
                                cta: { primary: 'Get Started', secondary: 'Learn More' }
                            },
                            features: designAssets?.landing_page?.features || [],
                            socialProof: designAssets?.landing_page?.socialProof || [],
                            footer: designAssets?.landing_page?.footer || { sections: [] }
                        }
                    },
                    metadata: {
                        generationHistory: [{
                            timestamp: new Date().toISOString(),
                            action: 'migrated_from_legacy',
                            changedFields: ['strategy', 'identity', 'components', 'previews']
                        }],
                        regenerationCount: 0,
                        sourceFlowId: flow.id,
                        sourceIcpId: icp.id
                    }
                };

                // Insert manifest
                const { error: insertError } = await supabase
                    .from('brand_manifests')
                    .insert({
                        user_id: flow.user_id,
                        flow_id: flow.id,
                        manifest,
                        brand_key: brandKey,
                        version: '1.0'
                    });

                if (insertError) {
                    console.error(`  ❌ Failed to insert manifest:`, insertError.message);
                    stats.failed++;
                    stats.errors.push({ flowId: flow.id, error: insertError.message });
                } else {
                    console.log(`  ✅ Migrated successfully (${brandKey})`);
                    stats.migrated++;
                }

            } catch (flowError) {
                console.error(`  ❌ Error processing flow:`, flowError);
                stats.failed++;
                stats.errors.push({
                    flowId: flow.id,
                    error: flowError instanceof Error ? flowError.message : 'Unknown error'
                });
            }
        }

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary');
        console.log('='.repeat(60));
        console.log(`Total flows:           ${stats.total}`);
        console.log(`Already migrated:      ${stats.alreadyMigrated}`);
        console.log(`Newly migrated:        ${stats.migrated}`);
        console.log(`Failed:                ${stats.failed}`);
        console.log('='.repeat(60));

        if (stats.errors.length > 0) {
            console.log('\n❌ Errors:');
            stats.errors.forEach(({ flowId, error }) => {
                console.log(`  • Flow ${flowId}: ${error}`);
            });
        }

        if (stats.migrated > 0) {
            console.log('\n✅ Migration completed successfully!');
            console.log('You can now verify the migrated data in Supabase or using the debug script:');
            console.log('  npx tsx scripts/debug-manifest.ts <flowId>');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateAllToManifests()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
