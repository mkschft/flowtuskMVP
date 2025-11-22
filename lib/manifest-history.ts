import { BrandManifest } from './types/brand-manifest';

/**
 * Manifest History Entry
 * Stores a snapshot of the manifest along with metadata about the change
 */
export interface ManifestHistoryEntry {
    id: string;
    manifest: BrandManifest;
    timestamp: string;
    action: string; // e.g., "color_update", "market_shift", "template_applied"
    description?: string; // Human-readable description of the change
}

/**
 * Manifest History Manager
 * Manages undo/redo operations for brand manifests
 */
export class ManifestHistory {
    private history: ManifestHistoryEntry[] = [];
    private currentIndex: number = -1;
    private maxHistorySize: number = 50; // Limit history to prevent memory issues

    constructor(initialManifest?: BrandManifest) {
        if (initialManifest) {
            this.addToHistory(initialManifest, 'initial_load', 'Initial manifest loaded');
        }
    }

    /**
     * Add a new manifest snapshot to history
     * This clears any redo history beyond the current point
     */
    addToHistory(manifest: BrandManifest, action: string, description?: string): void {
        // Remove any redo history beyond current point
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Create new entry
        const entry: ManifestHistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            manifest: JSON.parse(JSON.stringify(manifest)), // Deep clone
            timestamp: new Date().toISOString(),
            action,
            description
        };

        // Add to history
        this.history.push(entry);
        this.currentIndex = this.history.length - 1;

        // Trim history if it exceeds max size
        if (this.history.length > this.maxHistorySize) {
            const removeCount = this.history.length - this.maxHistorySize;
            this.history = this.history.slice(removeCount);
            this.currentIndex -= removeCount;
        }

        console.log(`📚 [History] Added entry: ${action} (${this.history.length} total, index: ${this.currentIndex})`);
    }

    /**
     * Undo the last change
     * Returns the previous manifest or null if at the beginning
     */
    undo(): BrandManifest | null {
        if (!this.canUndo()) {
            console.warn('⚠️ [History] Cannot undo - at beginning of history');
            return null;
        }

        this.currentIndex--;
        const entry = this.history[this.currentIndex];
        console.log(`↩️ [History] Undo to: ${entry.action} (index: ${this.currentIndex})`);

        return JSON.parse(JSON.stringify(entry.manifest)); // Return deep clone
    }

    /**
     * Redo the last undone change
     * Returns the next manifest or null if at the end
     */
    redo(): BrandManifest | null {
        if (!this.canRedo()) {
            console.warn('⚠️ [History] Cannot redo - at end of history');
            return null;
        }

        this.currentIndex++;
        const entry = this.history[this.currentIndex];
        console.log(`↪️ [History] Redo to: ${entry.action} (index: ${this.currentIndex})`);

        return JSON.parse(JSON.stringify(entry.manifest)); // Return deep clone
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Get current manifest
     */
    getCurrent(): BrandManifest | null {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }
        return JSON.parse(JSON.stringify(this.history[this.currentIndex].manifest));
    }

    /**
     * Get full history
     */
    getHistory(): ManifestHistoryEntry[] {
        return this.history.map(entry => ({
            ...entry,
            manifest: JSON.parse(JSON.stringify(entry.manifest)) // Deep clone each
        }));
    }

    /**
     * Get history metadata (without full manifests for efficiency)
     */
    getHistoryMetadata(): Array<Omit<ManifestHistoryEntry, 'manifest'>> {
        return this.history.map(({ manifest, ...metadata }) => metadata);
    }

    /**
     * Get current position in history
     */
    getCurrentIndex(): number {
        return this.currentIndex;
    }

    /**
     * Get history size
     */
    getSize(): number {
        return this.history.length;
    }

    /**
     * Clear all history
     */
    clearHistory(): void {
        this.history = [];
        this.currentIndex = -1;
        console.log('🗑️ [History] Cleared all history');
    }

    /**
     * Reset to a specific point in history
     */
    resetToIndex(index: number): BrandManifest | null {
        if (index < 0 || index >= this.history.length) {
            console.warn(`⚠️ [History] Invalid index: ${index}`);
            return null;
        }

        this.currentIndex = index;
        const entry = this.history[this.currentIndex];
        console.log(`🔄 [History] Reset to index ${index}: ${entry.action}`);

        return JSON.parse(JSON.stringify(entry.manifest));
    }

    /**
     * Export history as JSON
     */
    exportHistory(): string {
        return JSON.stringify({
            history: this.history,
            currentIndex: this.currentIndex,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }

    /**
     * Import history from JSON
     */
    importHistory(jsonString: string): boolean {
        try {
            const data = JSON.parse(jsonString);

            if (!data.history || !Array.isArray(data.history)) {
                throw new Error('Invalid history format');
            }

            this.history = data.history;
            this.currentIndex = data.currentIndex ?? data.history.length - 1;

            console.log(`📥 [History] Imported ${this.history.length} entries`);
            return true;
        } catch (error) {
            console.error('❌ [History] Import failed:', error);
            return false;
        }
    }
}

/**
 * Create a diff between two manifests
 * Returns an object describing what changed
 */
export function createManifestDiff(
    oldManifest: BrandManifest,
    newManifest: BrandManifest
): {
    hasChanges: boolean;
    changes: Array<{
        path: string;
        oldValue: any;
        newValue: any;
        type: 'added' | 'removed' | 'modified';
    }>;
} {
    const changes: Array<{
        path: string;
        oldValue: any;
        newValue: any;
        type: 'added' | 'removed' | 'modified';
    }> = [];

    function compareObjects(obj1: any, obj2: any, path: string = '') {
        const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

        for (const key of keys) {
            const currentPath = path ? `${path}.${key}` : key;
            const val1 = obj1?.[key];
            const val2 = obj2?.[key];

            if (val1 === undefined && val2 !== undefined) {
                changes.push({
                    path: currentPath,
                    oldValue: undefined,
                    newValue: val2,
                    type: 'added'
                });
            } else if (val1 !== undefined && val2 === undefined) {
                changes.push({
                    path: currentPath,
                    oldValue: val1,
                    newValue: undefined,
                    type: 'removed'
                });
            } else if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
                if (Array.isArray(val1) && Array.isArray(val2)) {
                    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                        changes.push({
                            path: currentPath,
                            oldValue: val1,
                            newValue: val2,
                            type: 'modified'
                        });
                    }
                } else {
                    compareObjects(val1, val2, currentPath);
                }
            } else if (val1 !== val2) {
                changes.push({
                    path: currentPath,
                    oldValue: val1,
                    newValue: val2,
                    type: 'modified'
                });
            }
        }
    }

    compareObjects(oldManifest, newManifest);

    return {
        hasChanges: changes.length > 0,
        changes
    };
}
