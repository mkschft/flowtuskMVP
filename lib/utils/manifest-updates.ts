import type { BrandManifest } from "@/lib/types/brand-manifest";
import type { CopilotWorkspaceData, PositioningDesignAssets } from "@/lib/types/design-assets";
import type { UiValueProp } from "@/lib/hooks/design-studio/use-workspace-data";
import type { ChatMessage } from "@/lib/design-studio-mock-data";

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
}

// --- Parsing Functions ---

export function parseUpdateResponse(response: string): ParsedUpdate | null {
    try {
        // Check for MANIFEST update signal
        const manifestMatch = response.match(/__MANIFEST_UPDATED__(.+)/);
        if (manifestMatch) {
            const updatedManifest = JSON.parse(manifestMatch[1]);
            return { type: 'manifest', data: updatedManifest };
        }

        // Legacy fallback
        const functionCallMatch = response.match(/__FUNCTION_CALL__(.+)/);
        if (functionCallMatch) {
            const parsed = JSON.parse(functionCallMatch[1]);
            return { type: 'legacy', data: parsed };
        }

        // Fallback: Look for legacy JSON format
        const jsonMatch = response.match(/\{[\s\S]*"updates"[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { type: 'legacy', data: parsed.updates };
        }

        return null;
    } catch (error) {
        console.error("Error parsing update response:", error);
        return null;
    }
}

// --- Application Functions ---

export function applyManifestUpdate(
    manifest: BrandManifest,
    context: UpdateContext
) {
    console.log('🔄 [Design Studio] Received manifest update');

    // Add to history
    const updateType = manifest.metadata?.generationHistory?.slice(-1)[0]?.action || 'update';
    context.addToHistory(
        manifest,
        updateType,
        `AI updated: ${updateType}`
    );

    context.setManifest(manifest);
    // Reload workspace data from updated manifest
    context.loadWorkspaceData();

    // Show success toast
    context.addToast(`Brand updated: ${updateType}`, "success");
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
