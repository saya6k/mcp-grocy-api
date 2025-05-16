// Contents moved from src/tests/api.test.ts
// Keeping all original test functionality
import { describe, it, expect } from 'vitest';
import * as api from '../src/index.js';

describe('API', () => {
  it('should export the expected interfaces', () => {
    expect(api).toBeDefined();
    // Add more specific API tests as needed
  });
});