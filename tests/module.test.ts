import { describe, it, expect } from 'vitest';
import * as api from '../src/index.js';

describe('Module', () => {
  it('should export required components', () => {
    expect(api).toBeDefined();
    // Add specific export checks as needed
  });

  // Include tests from module.test.js here
  // Add more module-level tests as needed
});