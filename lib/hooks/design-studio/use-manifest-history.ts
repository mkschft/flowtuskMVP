import { useState, useEffect, useCallback, useRef } from 'react';
import { ManifestHistory } from '@/lib/manifest-history';
import type { BrandManifest } from '@/lib/types/brand-manifest';

type ToastType = "success" | "info" | "download" | "link";

export function useManifestHistory(
    manifest: BrandManifest | null,
    onManifestUpdate: (newManifest: BrandManifest) => void,
    onReloadWorkspace: () => void,
    onToast: (message: string, type: ToastType) => void
) {
    const manifestHistoryRef = useRef<ManifestHistory | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Initialize history when manifest first loads
    useEffect(() => {
        if (manifest && !manifestHistoryRef.current) {
            manifestHistoryRef.current = new ManifestHistory(manifest);
            setCanUndo(false);
            setCanRedo(false);
            console.log('📚 [History] Initialized with current manifest');
        }
    }, [manifest]);

    // Update history state when manifest changes (from AI updates)
    useEffect(() => {
        if (manifest && manifestHistoryRef.current) {
            const history = manifestHistoryRef.current;
            setCanUndo(history.canUndo());
            setCanRedo(history.canRedo());
        }
    }, [manifest]);

    // Undo handler
    const undo = useCallback(() => {
        if (!manifestHistoryRef.current) return;

        const previousManifest = manifestHistoryRef.current.undo();
        if (previousManifest) {
            console.log('↩️ [History] Undoing to previous state');
            onManifestUpdate(previousManifest);

            // Update undo/redo availability
            setCanUndo(manifestHistoryRef.current.canUndo());
            setCanRedo(manifestHistoryRef.current.canRedo());

            // Reload workspace data from manifest
            onReloadWorkspace();

            onToast('Undone', 'info');
        }
    }, [onManifestUpdate, onReloadWorkspace, onToast]);

    // Redo handler
    const redo = useCallback(() => {
        if (!manifestHistoryRef.current) return;

        const nextManifest = manifestHistoryRef.current.redo();
        if (nextManifest) {
            console.log('↪️ [History] Redoing to next state');
            onManifestUpdate(nextManifest);

            // Update undo/redo availability
            setCanUndo(manifestHistoryRef.current.canUndo());
            setCanRedo(manifestHistoryRef.current.canRedo());

            // Reload workspace data from manifest
            onReloadWorkspace();

            onToast('Redone', 'info');
        }
    }, [onManifestUpdate, onReloadWorkspace, onToast]);

    // Helper to add to history manually (e.g. after AI update)
    const addToHistory = useCallback((newManifest: BrandManifest, type: string, description: string) => {
        if (manifestHistoryRef.current) {
            manifestHistoryRef.current.addToHistory(newManifest, type, description);
            setCanUndo(manifestHistoryRef.current.canUndo());
            setCanRedo(manifestHistoryRef.current.canRedo());
        }
    }, []);

    // Add keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Z or Cmd+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Ctrl+Shift+Z or Cmd+Shift+Z for redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return {
        canUndo,
        canRedo,
        undo,
        redo,
        addToHistory
    };
}
