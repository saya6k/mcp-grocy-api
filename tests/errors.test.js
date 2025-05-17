import { describe, it, expect } from 'vitest';
import { ApiError, formatError } from '../src/services/grocy-api/errors.js';

describe('Error Handling', () => {
  describe('ApiError', () => {
    it('should create an instance with the correct name and message', () => {
      const error = new ApiError('Test error message');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error message');
    });
    
    it('should be throwable and catchable', () => {
      expect(() => {
        throw new ApiError('Test error');
      }).toThrow('Test error');
    });
  });

  describe('formatError', () => {
    it('should format axios response errors', () => {
      const error = {
        message: 'Request failed with status code 400',
        response: {
          data: {
            error_message: 'Invalid input'
          }
        }
      };
      
      const formatted = formatError(error);
      expect(formatted).toContain('Request failed with status code 400');
      expect(formatted).toContain('"error_message":"Invalid input"');
    });

    it('should format axios request errors without responses', () => {
      const error = {
        message: 'Network Error',
        request: {}
      };
      
      const formatted = formatError(error);
      expect(formatted).toBe('No response received: Network Error');
    });

    it('should format simple errors', () => {
      const error = new Error('Simple error');
      const formatted = formatError(error);
      expect(formatted).toBe('Simple error');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const formatted = formatError(error);
      expect(formatted).toBe('String error');
      
      const error2 = { message: 'Object error' };
      const formatted2 = formatError(error2);
      expect(formatted2).toBe('Object error');
    });
  });
});
