import { describe, it, expect, vi } from 'vitest';
import { parseUpdateResponse, applyManifestUpdate, applyLegacyUpdate, type UpdateContext } from '../../../lib/utils/manifest-updates';
import type { BrandManifest } from '../../../lib/types/brand-manifest';

describe('manifest-updates', () => {
    describe('parseUpdateResponse', () => {
        it('should parse MANIFEST update signal', () => {
            const manifest = { lastUpdated: '2023-01-01', metadata: {} } as BrandManifest;
            const response = `Some text\n__MANIFEST_UPDATED__${JSON.stringify(manifest)}`;

            const result = parseUpdateResponse(response);
            expect(result).toEqual({ type: 'manifest', data: manifest });
        });

        it('should parse legacy function call', () => {
            const updates = { updateType: 'refinement', persona: { name: 'New Name' } };
            const response = `__FUNCTION_CALL__${JSON.stringify(updates)}`;

            const result = parseUpdateResponse(response);
            expect(result).toEqual({ type: 'legacy', data: updates });
        });

        it('should parse legacy JSON format', () => {
            const updates = { updateType: 'refinement', persona: { name: 'New Name' } };
            const response = `Some text\n{"updates": ${JSON.stringify(updates)}}`;

            const result = parseUpdateResponse(response);
            expect(result).toEqual({ type: 'legacy', data: updates });
        });

        it('should return null for invalid response', () => {
            const response = 'Just some text without updates';
            const result = parseUpdateResponse(response);
            expect(result).toBeNull();
        });
    });

    describe('applyManifestUpdate', () => {
        it('should update manifest and history', () => {
            const manifest = {
                lastUpdated: '2023-01-01',
                metadata: { generationHistory: [{ action: 'test' }] }
            } as unknown as BrandManifest;

            const context = {
                setManifest: vi.fn(),
                loadWorkspaceData: vi.fn(),
                addToHistory: vi.fn(),
                addToast: vi.fn(),
            } as unknown as UpdateContext;

            applyManifestUpdate(manifest, context);

            expect(context.setManifest).toHaveBeenCalledWith(manifest);
            expect(context.loadWorkspaceData).toHaveBeenCalled();
            expect(context.addToHistory).toHaveBeenCalledWith(manifest, 'test', 'AI updated: test');
            expect(context.addToast).toHaveBeenCalledWith('Brand updated: test', 'success');
        });
    });

    describe('applyLegacyUpdate', () => {
        it('should apply persona updates', () => {
            const updates = {
                updateType: 'refinement',
                persona: { name: 'New Name', company: 'New Co' }
            };

            const context = {
                workspaceData: { persona: { persona_name: 'Old', persona_company: 'Old Co' } },
                designAssets: {},
                setWorkspaceData: vi.fn((cb) => {
                    const prev = { persona: { persona_name: 'Old', persona_company: 'Old Co' } };
                    return cb(prev);
                }),
                setUiValueProp: vi.fn(),
                setDesignAssets: vi.fn(),
                setChatMessages: vi.fn(),
                setGenerationSteps: vi.fn(),
                setActiveTab: vi.fn(),
                addToast: vi.fn(),
            } as unknown as UpdateContext;

            applyLegacyUpdate(updates, context);

            // Verify setWorkspaceData was called and produced correct state
            const setter = (context.setWorkspaceData as any).mock.calls[0][0];
            const result = setter({ persona: { persona_name: 'Old', persona_company: 'Old Co' } });

            expect(result.persona.persona_name).toBe('New Name');
            expect(result.persona.persona_company).toBe('New Co');
            expect(context.addToast).toHaveBeenCalled();
        });
    });
});
