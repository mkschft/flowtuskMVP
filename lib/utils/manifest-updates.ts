import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { CopilotWorkspaceData, PositioningDesignAssets } from "@/lib/types/design-assets";
import type { UiValueProp } from "@/lib/hooks/design-studio/use-workspace-data";
import type { ChatMessage } from "@/lib/design-studio-mock-data";

// --- Manifest to DesignAssets Converter ---

/**
 * Converts BrandManifest to PositioningDesignAssets format
 * This ensures UI components get immediate updates without waiting for API calls
 */
function convertManifestToDesignAssets(
    manifest: BrandManifest,
    flowId: string,
    icpId: string,
    existingDesignAssets: PositioningDesignAssets | null
): PositioningDesignAssets {
    // Normalization helpers (same as workspace API)
    const normalizeColorArray = (colors: any): { name: string; hex: string; usage?: string }[] => {
        if (!colors) return [];
        if (Array.isArray(colors)) return colors;
        if (typeof colors === 'string') return [{ name: 'Color', hex: colors }];
        if (typeof colors === 'object' && colors.hex) return [colors];
        return [];
    };

    const normalizeStringArrayField = (value: any): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return [value];
        return [];
    };

    const normalizeArrayField = (value: any): any[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return [];
    };

    const normalizeSpacing = (spacing: any): { name: string; value: string }[] => {
        if (!spacing) return [];
        if (Array.isArray(spacing)) return spacing;
        if (typeof spacing === 'object') {
            return Object.entries(spacing).map(([key, value]) => ({
                name: key,
                value: String(value)
            }));
        }
        return [];
    };

    const normalizeBorderRadius = (borderRadius: any): { name: string; value: string }[] => {
        if (!borderRadius) return [];
        if (Array.isArray(borderRadius)) return borderRadius;
        if (typeof borderRadius === 'string') {
            const baseValue = parseInt(borderRadius) || 8;
            return [
                { name: 'sm', value: `${Math.floor(baseValue * 0.5)}px` },
                { name: 'md', value: `${baseValue}px` },
                { name: 'lg', value: `${Math.floor(baseValue * 1.5)}px` },
                { name: 'xl', value: `${baseValue * 2}px` }
            ];
        }
        return [];
    };

    const normalizeButtons = (buttons: any): { variant: string; description: string }[] => {
        if (!buttons) return [];
        if (Array.isArray(buttons)) return buttons;
        const result = [];
        if (buttons.primary) {
            result.push({
                variant: 'Primary',
                description: buttons.primary.description || 'Main call-to-action button'
            });
        }
        if (buttons.secondary) {
            result.push({
                variant: 'Secondary',
                description: buttons.secondary.description || 'Secondary action button'
            });
        }
        if (buttons.outline) {
            result.push({
                variant: 'Outline',
                description: buttons.outline.description || 'Subtle action button'
            });
        }
        return result;
    };

    const normalizePersonalityTraits = (traits: any): { id: string; label: string; value: number; leftLabel: string; rightLabel: string }[] => {
        if (!traits) return [];
        if (!Array.isArray(traits)) return [];
        return traits.map((trait, idx) => ({
            id: `trait-${idx}`,
            label: trait.trait || trait.label || 'Personality',
            value: trait.value || 50,
            leftLabel: trait.leftLabel || '',
            rightLabel: trait.rightLabel || ''
        }));
    };

    // Preserve existing ID and timestamps if available
    const baseDesignAssets: PositioningDesignAssets = existingDesignAssets || {
        id: 'from-manifest',
        icp_id: icpId,
        parent_flow: flowId,
        brand_guide: null,
        style_guide: null,
        landing_page: null,
        generation_state: { brand: false, style: false, landing: false },
        generation_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    return {
        ...baseDesignAssets,
        id: existingDesignAssets?.id || 'from-manifest',
        icp_id: icpId,
        parent_flow: flowId,
        brand_guide: {
            colors: {
                primary: normalizeColorArray(manifest.identity?.colors?.primary),
                secondary: normalizeColorArray(manifest.identity?.colors?.secondary),
                accent: normalizeColorArray(manifest.identity?.colors?.accent),
                neutral: normalizeColorArray(manifest.identity?.colors?.neutral)
            },
            typography: [
                {
                    category: 'heading',
                    fontFamily: manifest.identity?.typography?.heading?.family || 'Inter',
                    weights: manifest.identity?.typography?.heading?.weights || ['700'],
                    sizes: manifest.identity?.typography?.heading?.sizes || {}
                },
                {
                    category: 'body',
                    fontFamily: manifest.identity?.typography?.body?.family || 'Inter',
                    weights: manifest.identity?.typography?.body?.weights || ['400'],
                    sizes: manifest.identity?.typography?.body?.sizes || {}
                }
            ],
            toneOfVoice: normalizeStringArrayField(manifest.identity?.tone?.keywords),
            personalityTraits: normalizePersonalityTraits(manifest.identity?.tone?.personality),
            logoVariations: normalizeArrayField(manifest.identity?.logo?.variations)
        },
        style_guide: {
            buttons: normalizeButtons(manifest.components?.buttons),
            cards: manifest.components?.cards ? [{ variant: 'default', description: 'Card component', ...manifest.components.cards }] : [],
            spacing: normalizeSpacing(manifest.components?.spacing?.scale),
            borderRadius: normalizeBorderRadius(manifest.components?.cards?.borderRadius),
            formElements: [],
            shadows: []
        },
        landing_page: {
            navigation: {
                logo: manifest.brandName || manifest.previews?.landingPage?.navigation?.logo || '',
                links: manifest.previews?.landingPage?.navigation?.links || []
            },
            hero: manifest.previews?.landingPage?.hero || { headline: '', subheadline: '', cta: { primary: '', secondary: '' } },
            features: manifest.previews?.landingPage?.features || [],
            socialProof: manifest.previews?.landingPage?.socialProof || [],
            footer: manifest.previews?.landingPage?.footer || { sections: [] }
        },
        generation_state: {
            brand: true,
            style: true,
            landing: true
        },
        generation_metadata: manifest.metadata || {},
        updated_at: new Date().toISOString()
    };
}

// --- Types ---

export type ToastType = "success" | "info" | "download" | "link";

export interface LegacyUpdates {
    updateType?: string;
    executionSteps?: Array<{ step: string }>;
    reasoning?: string;

    // Persona
    persona?: {
        name?: string;
        company?: string;
        location?: string;
        country?: string;
    };
    location?: string; // Legacy
    country?: string; // Legacy

    // Value Prop
    valueProp?: Partial<UiValueProp>;
    targetAudience?: string; // Legacy
    problem?: string; // Legacy
    solution?: string; // Legacy
    outcome?: string; // Legacy
    benefits?: string[]; // Legacy
    headline?: string; // Legacy
    subheadline?: string; // Legacy

    // Brand
    brandUpdates?: {
        colors?: string[];
        fonts?: {
            heading?: string;
            body?: string;
        };
    };
    colors?: string[]; // Legacy
    fonts?: { heading?: string; body?: string }; // Legacy

    // Style Guide
    styleGuide?: {
        borderRadius?: any;
        buttonStyle?: any;
        cardStyle?: any;
        shadows?: any;
    };

    // Landing Page
    landingPage?: {
        features?: any[];
        socialProof?: any[];
        footer?: any;
    };
}

export type ParsedUpdate =
    | { type: 'manifest'; data: BrandManifest }
    | { type: 'legacy'; data: LegacyUpdates };

export interface UpdateContext {
    workspaceData: CopilotWorkspaceData | null;
    designAssets: PositioningDesignAssets | null;

    setWorkspaceData: React.Dispatch<React.SetStateAction<CopilotWorkspaceData | null>>;
    setDesignAssets: React.Dispatch<React.SetStateAction<PositioningDesignAssets | null>>;
    setUiValueProp: React.Dispatch<React.SetStateAction<UiValueProp | null>>;
    setManifest: React.Dispatch<React.SetStateAction<BrandManifest | null>>;

    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setGenerationSteps: React.Dispatch<React.SetStateAction<Array<{ id: string; label: string; icon: string; status: 'pending' | 'loading' | 'complete' }>>>;
    setActiveTab: (tab: "value-prop" | "brand" | "style" | "landing") => void;

    addToast: (message: string, type: ToastType) => void;
    addToHistory: (manifest: BrandManifest, type: string, description: string) => void;
    loadWorkspaceData: () => Promise<void>;
    
    // Additional context for manifest conversion
    flowId?: string;
    icpId?: string;
}

// --- Parsing Functions ---

export function parseUpdateResponse(response: string): ParsedUpdate | null {
    if (!response || typeof response !== 'string' || response.trim().length === 0) {
        console.warn('⚠️ [Parse Update] Empty or invalid response');
        return null;
    }

    try {
        console.log('🔍 [Parse Update] Checking response for updates...', {
            responseLength: response.length,
            hasManifestSignal: response.includes('__MANIFEST_UPDATED__'),
            hasFunctionCallSignal: response.includes('__FUNCTION_CALL__'),
            firstChars: response.substring(0, 100)
        });
        
        // Method 1: Check for MANIFEST update signal (primary method)
        const manifestMatch = response.match(/__MANIFEST_UPDATED__([\s\S]*?)(?=\n\n__|$)/);
        if (manifestMatch && manifestMatch[1]) {
            try {
                console.log('✅ [Parse Update] Found __MANIFEST_UPDATED__ signal');
                const manifestJson = manifestMatch[1].trim();
                
                // Try to parse the JSON
                let updatedManifest;
                try {
                    updatedManifest = JSON.parse(manifestJson);
                } catch (parseError) {
                    // If parsing fails, try to extract JSON from potentially malformed string
                    console.warn('⚠️ [Parse Update] Initial parse failed, trying to extract JSON...');
                    const jsonExtract = manifestJson.match(/\{[\s\S]*\}/);
                    if (jsonExtract) {
                        updatedManifest = JSON.parse(jsonExtract[0]);
                        console.log('✅ [Parse Update] Recovered JSON from malformed string');
                    } else {
                        throw parseError;
                    }
                }
                
                // Validate manifest structure
                if (!updatedManifest || typeof updatedManifest !== 'object') {
                    console.error('❌ [Parse Update] Parsed manifest is not an object');
                    return null;
                }
                
                console.log('✅ [Parse Update] Manifest parsed successfully', {
                    hasStrategy: !!updatedManifest.strategy,
                    hasIdentity: !!updatedManifest.identity,
                    hasComponents: !!updatedManifest.components,
                    updateType: updatedManifest.metadata?.generationHistory?.slice(-1)[0]?.action
                });
                
                return { type: 'manifest', data: updatedManifest };
            } catch (error) {
                console.error('❌ [Parse Update] Failed to parse manifest from signal:', error);
                // Continue to try other methods
            }
        }

        // Method 2: Legacy function call signal
        const functionCallMatch = response.match(/__FUNCTION_CALL__([\s\S]*?)(?=\n\n__|$)/);
        if (functionCallMatch && functionCallMatch[1]) {
            try {
                const parsed = JSON.parse(functionCallMatch[1].trim());
                console.log('✅ [Parse Update] Found legacy function call signal');
                return { type: 'legacy', data: parsed };
            } catch (error) {
                console.warn('⚠️ [Parse Update] Failed to parse function call signal:', error);
            }
        }

        // Method 3: Look for standalone JSON objects with "updates" key
        const updatesJsonMatch = response.match(/\{[\s\S]*?"updates"[\s\S]*?\}/);
        if (updatesJsonMatch) {
            try {
                const parsed = JSON.parse(updatesJsonMatch[0]);
                if (parsed.updates) {
                    console.log('✅ [Parse Update] Found legacy updates format');
                    return { type: 'legacy', data: parsed.updates };
                }
            } catch (error) {
                console.warn('⚠️ [Parse Update] Failed to parse legacy updates format:', error);
            }
        }

        // Method 4: Look for any complete JSON object that might be a manifest
        // This is a last resort for malformed responses
        const anyJsonMatch = response.match(/\{[\s\S]{100,}\}/); // At least 100 chars to avoid false positives
        if (anyJsonMatch) {
            try {
                const parsed = JSON.parse(anyJsonMatch[0]);
                // Check if it looks like a manifest (has strategy, identity, or components)
                if (parsed.strategy || parsed.identity || parsed.components) {
                    console.log('✅ [Parse Update] Found manifest-like JSON object');
                    return { type: 'manifest', data: parsed };
                }
            } catch (error) {
                // Ignore - this is just a fallback
            }
        }

        console.log('⚠️ [Parse Update] No valid update format found in response');
        return null;
    } catch (error) {
        console.error("❌ [Parse Update] Error parsing update response:", error);
        return null;
    }
}

// --- Application Functions ---

export function applyManifestUpdate(
    manifest: BrandManifest,
    context: UpdateContext
) {
    const updateType = manifest.metadata?.generationHistory?.slice(-1)[0]?.action || 'update';
    
    console.log('🔄 [Manifest Update] Starting real-time update', {
        updateType,
        hasManifest: !!manifest,
        flowId: context.flowId,
        icpId: context.icpId,
        timestamp: new Date().toISOString()
    });

    // Step 1: Update manifest state immediately
    console.log('📦 [Manifest Update] Setting manifest state...');
    context.setManifest(manifest);

    // Step 2: Convert manifest to designAssets format IMMEDIATELY (no API call needed)
    if (context.flowId && context.icpId) {
        console.log('🔄 [Manifest Update] Converting manifest to designAssets...');
        const updatedDesignAssets = convertManifestToDesignAssets(
            manifest,
            context.flowId,
            context.icpId,
            context.designAssets
        );
        
        console.log('✅ [Manifest Update] DesignAssets converted', {
            hasBrandGuide: !!updatedDesignAssets.brand_guide,
            hasStyleGuide: !!updatedDesignAssets.style_guide,
            hasLandingPage: !!updatedDesignAssets.landing_page,
            primaryColors: updatedDesignAssets.brand_guide?.colors.primary.length || 0
        });
        
        // Update designAssets state immediately
        // Create new object reference to ensure React detects the change
        context.setDesignAssets({ ...updatedDesignAssets });
        
        // Also update workspaceData if it exists
        if (context.workspaceData) {
            context.setWorkspaceData({
                ...context.workspaceData,
                designAssets: { ...updatedDesignAssets }  // ← Add spread here too
            });
        }
    } else {
        console.warn('⚠️ [Manifest Update] Missing flowId or icpId, skipping designAssets conversion');
    }

    // Step 3: Update UI value prop from manifest immediately
    console.log('📝 [Manifest Update] Updating UI value prop...');
    const valueProp = manifest.strategy?.valueProp;
    if (valueProp) {
        context.setUiValueProp({
            headline: valueProp.headline || '',
            subheadline: valueProp.subheadline || '',
            problem: valueProp.problem || '',
            solution: valueProp.solution || '',
            outcome: valueProp.outcome || '',
            benefits: valueProp.benefits || [],
            targetAudience: valueProp.targetAudience || ''
        });
        console.log('✅ [Manifest Update] UI value prop updated', {
            hasHeadline: !!valueProp.headline,
            hasProblem: !!valueProp.problem,
            benefitsCount: valueProp.benefits?.length || 0
        });
    }

    // Step 4: Add to history
    console.log('📚 [Manifest Update] Adding to history...');
    context.addToHistory(
        manifest,
        updateType,
        `AI updated: ${updateType}`
    );

    // Step 5: Determine which tab to switch to based on update type
    const tabMap: Record<string, "value-prop" | "brand" | "style" | "landing"> = {
        'market_shift': 'value-prop',
        'messaging': 'value-prop',
        'styling': 'brand',
        'refinement': 'brand'
    };
    const targetTab = tabMap[updateType] || 'brand';
    console.log('🎯 [Manifest Update] Switching to tab:', targetTab);
    setTimeout(() => context.setActiveTab(targetTab), 300);

    // Step 6: Show success toast
    const changedFields: string[] = [];
    if (valueProp?.headline) changedFields.push('headline');
    if (manifest.identity?.colors?.primary?.length) changedFields.push('colors');
    if (manifest.identity?.typography) changedFields.push('typography');
    if (manifest.components) changedFields.push('components');
    
    const toastMessage = changedFields.length > 0
        ? `✨ Updated: ${changedFields.slice(0, 3).join(', ')}${changedFields.length > 3 ? '...' : ''}`
        : `Brand updated: ${updateType}`;
    
    context.addToast(toastMessage, "success");
    console.log('✅ [Manifest Update] Toast shown:', toastMessage);

    // Step 7: Reload workspace data in background (for consistency, but not blocking)
    // This ensures the API state matches, but UI already updated from manifest
    console.log('🔄 [Manifest Update] Reloading workspace data in background...');
    context.loadWorkspaceData().then(() => {
        console.log('✅ [Manifest Update] Workspace data reloaded (background sync complete)');
    }).catch((err) => {
        console.warn('⚠️ [Manifest Update] Background workspace reload failed (non-critical):', err);
    });

    console.log('🎉 [Manifest Update] Real-time update complete!');
}

export function applyLegacyUpdate(
    updates: LegacyUpdates,
    context: UpdateContext
) {
    const { workspaceData, designAssets } = context;
    if (!workspaceData || !designAssets) return;

    const updateType = updates.updateType || 'refinement';
    console.log(`🔄 [Design Studio] Applying ${updateType} updates`, updates);

    // Show progress steps for complex updates
    if (updateType === 'market_shift') {
        handleMarketShiftProgress(updates, context);
    }

    // Track what changed for comprehensive summary
    const changedFields: string[] = [];

    // Apply updates to state
    applyPersonaUpdates(updates, context, changedFields);
    applyValuePropUpdates(updates, context, changedFields);
    applyBrandUpdates(updates, context, changedFields);
    applyStyleGuideUpdates(updates, context, changedFields);
    applyLandingPageUpdates(updates, context, changedFields);

    // Show summary and toast
    handleUpdateSummary(updates, updateType, changedFields, context);
}

// --- Helper Functions ---

function handleMarketShiftProgress(updates: LegacyUpdates, context: UpdateContext) {
    // Add progress indicator to chat
    context.setChatMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.content.includes('__UPDATE_PROGRESS__')) {
            return prev;
        }
        const filtered = prev.filter(m => m.content !== '__UPDATE_PROGRESS__');
        return [...filtered, { role: 'ai', content: '__UPDATE_PROGRESS__' }];
    });

    // Generate steps
    let executionSteps;
    if (updates.executionSteps && updates.executionSteps.length > 0) {
        executionSteps = updates.executionSteps.map((step: any, idx: number) => ({
            id: `exec_${idx}`,
            label: step.step.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, ''),
            icon: step.step.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '⚡',
            status: 'complete' as const
        }));
    } else {
        const steps = [];
        if (updates.persona?.location || updates.persona?.country || updates.location || updates.country) {
            const loc = updates.persona?.location || updates.location || '';
            const country = updates.persona?.country || updates.country || '';
            steps.push({
                id: 'location',
                label: `Updating location to ${loc}${country ? ', ' + country : ''}`,
                icon: '🌍',
                status: 'complete' as const
            });
        }
        // ... other fallback steps ...
        if (steps.length === 0) {
            steps.push(
                { id: 'update1', label: 'Analyzing market context', icon: '🔍', status: 'complete' as const },
                { id: 'update2', label: 'Applying changes', icon: '✨', status: 'complete' as const }
            );
        }
        executionSteps = steps;
    }
    context.setGenerationSteps(executionSteps);
}

function applyPersonaUpdates(updates: LegacyUpdates, context: UpdateContext, changedFields: string[]) {
    if (updates.persona) {
        context.setWorkspaceData((prev: any) => {
            if (!prev) return prev;
            const personaUpdates: any = {};
            if (updates.persona?.name) { personaUpdates.persona_name = updates.persona.name; changedFields.push(`persona name`); }
            if (updates.persona?.company) { personaUpdates.persona_company = updates.persona.company; changedFields.push(`company`); }
            if (updates.persona?.location) { personaUpdates.location = updates.persona.location; changedFields.push(`location`); }
            if (updates.persona?.country) { personaUpdates.country = updates.persona.country; changedFields.push(`country`); }
            return { ...prev, persona: { ...prev.persona, ...personaUpdates } };
        });
    }
    // Legacy
    if (updates.location || updates.country) {
        context.setWorkspaceData((prev: any) => {
            if (!prev) return prev;
            const legacyUpdates: any = {};
            if (updates.location) { legacyUpdates.location = updates.location; changedFields.push(`location`); }
            if (updates.country) { legacyUpdates.country = updates.country; changedFields.push(`country`); }
            return { ...prev, persona: { ...prev.persona, ...legacyUpdates } };
        });
    }
}

function applyValuePropUpdates(updates: LegacyUpdates, context: UpdateContext, changedFields: string[]) {
    if (updates.valueProp) {
        const vp = updates.valueProp;
        context.setUiValueProp((prev: any) => {
            if (!prev) return prev;
            const vpUpdates: any = {};
            if (vp.headline) { vpUpdates.headline = vp.headline; changedFields.push('headline'); }
            if (vp.subheadline) { vpUpdates.subheadline = vp.subheadline; changedFields.push('subheadline'); }
            if (vp.problem) { vpUpdates.problem = vp.problem; changedFields.push('problem'); }
            if (vp.solution) { vpUpdates.solution = vp.solution; changedFields.push('solution'); }
            if (vp.outcome) { vpUpdates.outcome = vp.outcome; changedFields.push('outcome'); }
            if (vp.targetAudience) { vpUpdates.targetAudience = vp.targetAudience; changedFields.push('target audience'); }
            if (vp.benefits && Array.isArray(vp.benefits)) { vpUpdates.benefits = vp.benefits; changedFields.push('benefits'); }
            return { ...prev, ...vpUpdates };
        });
    }
    // Legacy
    if (updates.targetAudience || updates.problem || updates.solution || updates.outcome || updates.benefits || updates.headline) {
        context.setUiValueProp((prev: any) => {
            if (!prev) return prev;
            const legacyVpUpdates: any = {};
            if (updates.headline) { legacyVpUpdates.headline = updates.headline; changedFields.push('headline'); }
            if (updates.subheadline) { legacyVpUpdates.subheadline = updates.subheadline; changedFields.push('subheadline'); }
            if (updates.problem) { legacyVpUpdates.problem = updates.problem; changedFields.push('problem'); }
            if (updates.solution) { legacyVpUpdates.solution = updates.solution; changedFields.push('solution'); }
            if (updates.outcome) { legacyVpUpdates.outcome = updates.outcome; changedFields.push('outcome'); }
            if (updates.targetAudience) { legacyVpUpdates.targetAudience = updates.targetAudience; changedFields.push('target audience'); }
            if (updates.benefits && Array.isArray(updates.benefits)) { legacyVpUpdates.benefits = updates.benefits; changedFields.push('benefits'); }
            return { ...prev, ...legacyVpUpdates };
        });
    }
}

function applyBrandUpdates(updates: LegacyUpdates, context: UpdateContext, changedFields: string[]) {
    if (updates.brandUpdates) {
        context.setDesignAssets((prev: any) => {
            if (!prev || !prev.brand_guide) return prev;
            const updated = { ...prev };
            if (updates.brandUpdates?.colors && Array.isArray(updates.brandUpdates.colors)) {
                updates.brandUpdates.colors.forEach((hex: string, idx: number) => {
                    if (updated.brand_guide.colors.primary[idx]) {
                        updated.brand_guide.colors.primary[idx].hex = hex;
                    }
                });
                changedFields.push('colors');
            }
            if (updates.brandUpdates?.fonts) {
                if (updates.brandUpdates.fonts.heading) {
                    const headingFont = updated.brand_guide.typography.find((t: any) => t.category === "heading");
                    if (headingFont) headingFont.fontFamily = updates.brandUpdates.fonts.heading;
                    changedFields.push('heading font');
                }
                if (updates.brandUpdates.fonts.body) {
                    const bodyFont = updated.brand_guide.typography.find((t: any) => t.category === "body");
                    if (bodyFont) bodyFont.fontFamily = updates.brandUpdates.fonts.body;
                    changedFields.push('body font');
                }
            }
            return updated;
        });
    }
    // Legacy
    context.setDesignAssets((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev };
        let hasChanges = false;
        if (updates.colors && Array.isArray(updates.colors) && updated.brand_guide) {
            updates.colors.forEach((hex: string, idx: number) => {
                if (updated.brand_guide.colors.primary[idx]) {
                    updated.brand_guide.colors.primary[idx].hex = hex;
                }
            });
            changedFields.push('colors');
            hasChanges = true;
        }
        if (updates.fonts && updated.brand_guide) {
            if (updates.fonts.heading) {
                const headingFont = updated.brand_guide.typography.find((t: any) => t.category === "heading");
                if (headingFont) headingFont.fontFamily = updates.fonts.heading;
                changedFields.push('heading font');
                hasChanges = true;
            }
            if (updates.fonts.body) {
                const bodyFont = updated.brand_guide.typography.find((t: any) => t.category === "body");
                if (bodyFont) bodyFont.fontFamily = updates.fonts.body;
                changedFields.push('body font');
                hasChanges = true;
            }
        }
        return hasChanges ? updated : prev;
    });
}

function applyStyleGuideUpdates(updates: LegacyUpdates, context: UpdateContext, changedFields: string[]) {
    if (updates.styleGuide) {
        context.setDesignAssets((prev: any) => {
            if (!prev || !prev.style_guide) return prev;
            const updated = { ...prev };
            const sg = updates.styleGuide!;
            if (sg.borderRadius) { updated.style_guide.borderRadius = sg.borderRadius; changedFields.push('border radius'); }
            if (sg.buttonStyle) { updated.style_guide.buttons = [{ variant: 'primary', style: sg.buttonStyle }]; changedFields.push('button style'); }
            if (sg.cardStyle) { updated.style_guide.cards = [{ variant: 'default', style: sg.cardStyle }]; changedFields.push('card style'); }
            if (sg.shadows) { updated.style_guide.shadows = sg.shadows; changedFields.push('shadows'); }
            return updated;
        });
    }
}

function applyLandingPageUpdates(updates: LegacyUpdates, context: UpdateContext, changedFields: string[]) {
    if (updates.landingPage) {
        context.setDesignAssets((prev: any) => {
            if (!prev || !prev.landing_page) return prev;
            const updated = { ...prev };
            const lp = updates.landingPage!;
            if (lp.features) { updated.landing_page.features = lp.features; changedFields.push('features'); }
            if (lp.socialProof) { updated.landing_page.socialProof = lp.socialProof; changedFields.push('testimonials'); }
            if (lp.footer) { updated.landing_page.footer = lp.footer; changedFields.push('footer'); }
            return updated;
        });
    }
    // Legacy
    context.setDesignAssets((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev };
        let hasChanges = false;
        if (updates.headline && updated.landing_page) {
            updated.landing_page.hero.headline = updates.headline;
            hasChanges = true;
        }
        if (updates.subheadline && updated.landing_page) {
            updated.landing_page.hero.subheadline = updates.subheadline;
            hasChanges = true;
        }
        return hasChanges ? updated : prev;
    });
}

function handleUpdateSummary(
    updates: LegacyUpdates,
    updateType: string,
    changedFields: string[],
    context: UpdateContext
) {
    if (changedFields.length > 0) {
        const uniqueFields = [...new Set(changedFields)];

        // Toast
        if (updateType === 'market_shift') {
            context.addToast(`🌍 Market shift complete! Updated: ${uniqueFields.slice(0, 3).join(', ')}${uniqueFields.length > 3 ? '...' : ''}`, "success");
        } else if (uniqueFields.length > 3) {
            context.addToast(`✨ ${uniqueFields.length} elements updated successfully!`, "success");
        } else {
            context.addToast(`✓ Updated: ${uniqueFields.join(', ')}`, "success");
        }

        // Chat Summary
        if (updateType === 'market_shift' && uniqueFields.length >= 3) {
            setTimeout(() => {
                context.setChatMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.content.includes('✅ Updated:')) return prev;

                    const summaryParts = [];
                    if (updates.persona) {
                        if (updates.persona.location || updates.persona.country) {
                            summaryParts.push(`✅ **Location**: ${updates.persona.location || ''}${updates.persona.country ? ', ' + updates.persona.country : ''}`);
                        }
                        if (updates.persona.name) {
                            summaryParts.push(`✅ **Persona**: ${updates.persona.name}${updates.persona.company ? ' at ' + updates.persona.company : ''}`);
                        }
                    }
                    if (updates.valueProp && Object.keys(updates.valueProp).length > 0) {
                        summaryParts.push(`✅ **Value Proposition**: Regenerated for new market`);
                    }

                    const summaryMessage = `\n\n**🎉 Update Complete!**\n\n${summaryParts.join('\n')}\n\n${updates.reasoning || 'Changes applied successfully.'}`;
                    return [...prev, { role: 'ai', content: summaryMessage }];
                });

                setTimeout(() => {
                    context.setGenerationSteps([]);
                }, 500);
            }, 300);
        }

        // Tab Switching
        if (updateType === 'market_shift' || updates.valueProp || updates.targetAudience) {
            setTimeout(() => context.setActiveTab("value-prop"), 800);
        } else if (updateType === 'styling' || updates.brandUpdates) {
            setTimeout(() => context.setActiveTab("brand"), 500);
        }
    }
}
