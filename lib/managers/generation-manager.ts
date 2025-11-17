/**
 * Generation Manager
 * Handles caching, deduplication, and progress tracking for AI generations
 */

export class GenerationManager {
  private cache: Map<string, unknown> = new Map();
  private pendingGenerations: Map<string, Promise<unknown>> = new Map();
  private completedGenerations: Set<string> = new Set();

  createKey(type: string, params: Record<string, unknown>): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  async generate<T>(
    type: string,
    params: Record<string, unknown>,
    generator: () => Promise<T>
  ): Promise<T> {
    const key = this.createKey(type, params);

    // Check cache first
    if (this.cache.has(key)) {
      console.log(`🎯 [GenerationManager] Cache hit for ${type}`);
      return this.cache.get(key) as T;
    }

    // Check if already generating
    if (this.pendingGenerations.has(key)) {
      console.log(`⏳ [GenerationManager] Waiting for existing generation: ${type}`);
      return this.pendingGenerations.get(key) as Promise<T>;
    }

    // Check if already completed
    if (this.completedGenerations.has(key)) {
      console.log(`✅ [GenerationManager] Already completed: ${type}`);
      return this.cache.get(key) as T;
    }

    // Start generation
    console.log(`🚀 [GenerationManager] Starting generation: ${type}`);
    const promise = this.executeGeneration(key, generator);
    this.pendingGenerations.set(key, promise);

    try {
      const result = await promise;
      this.cache.set(key, result);
      this.completedGenerations.add(key);
      return result;
    } finally {
      this.pendingGenerations.delete(key);
    }
  }

  private async executeGeneration<T>(key: string, generator: () => Promise<T>): Promise<T> {
    try {
      return await generator();
    } catch (error) {
      console.error(`❌ [GenerationManager] Generation failed for ${key}:`, error);
      throw error;
    }
  }

  isGenerating(type: string, params: Record<string, unknown>): boolean {
    const key = this.createKey(type, params);
    return this.pendingGenerations.has(key);
  }

  isCompleted(type: string, params: Record<string, unknown>): boolean {
    const key = this.createKey(type, params);
    return this.completedGenerations.has(key);
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingGenerations.clear();
    this.completedGenerations.clear();
  }
}

// Export singleton instance
export const generationManager = new GenerationManager();
