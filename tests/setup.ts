/**
 * Vitest Setup File
 * 
 * Global test configuration and utilities
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'sk-test';

// Mock fetch globally for tests that don't need actual API calls
beforeAll(() => {
  global.fetch = vi.fn();
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Helper function to create mock responses
export function mockFetchResponse(data: any, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response);
}

// Export for use in tests
export { vi };

