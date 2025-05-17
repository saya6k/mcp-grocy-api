import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear the module cache to allow for clean imports with new environment variables
    vi.resetModules();
    // Clear any environment variables that might affect the tests
    delete process.env.GROCY_BASE_URL;
  });

  afterEach(() => {
    // Restore the original environment variables
    process.env = { ...originalEnv };
  });

  it('should use the provided GROCY_BASE_URL', () => {
    process.env.GROCY_BASE_URL = 'http://custom-grocy-url.com';
    const { apiUrl } = require('../src/services/grocy-api/config.js');
    expect(apiUrl).toBe('http://custom-grocy-url.com/api');
  });

  it('should default to localhost URL when GROCY_BASE_URL is not set', () => {
    const { apiUrl } = require('../src/services/grocy-api/config.js');
    expect(apiUrl).toBe('http://localhost:9283/api');
  });

  it('should export ApiError and formatError functions', () => {
    const { ApiError, formatError } = require('../src/services/grocy-api/config.js');
    expect(ApiError).toBeDefined();
    expect(typeof formatError).toBe('function');

    // Create an ApiError and make sure it has the right name
    const error = new ApiError('Test error');
    expect(error.name).toBe('ApiError');
  });
});
