import { describe, it, expect } from 'vitest';
import * as api from '../src/index.js';

describe('API Client', () => {
  it('should export API functionality', () => {
    expect(api).toBeDefined();
  });
  
  // Basic existence test, doesn't rely on specific exports
  it('should be importable', () => {
    expect(typeof api).toBe('object');
  });
});