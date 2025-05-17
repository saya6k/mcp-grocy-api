import { describe, it, expect } from 'vitest';
import { convertStringToNumber, ensureNumericParams } from '../src/services/grocy-api/type-converter.js';

describe('Type Converter', () => {
  describe('convertStringToNumber', () => {
    it('should convert string numbers to actual numbers', () => {
      expect(convertStringToNumber('42')).toBe(42);
      expect(convertStringToNumber('3.14')).toBe(3.14);
      expect(convertStringToNumber('-10')).toBe(-10);
    });

    it('should not convert non-numeric strings', () => {
      expect(convertStringToNumber('abc')).toBe('abc');
      expect(convertStringToNumber('123abc')).toBe('123abc');
      expect(convertStringToNumber('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(convertStringToNumber(null)).toBe(null);
      expect(convertStringToNumber(undefined)).toBe(undefined);
    });

    it('should process arrays recursively', () => {
      const input = ['1', '2', 'three', '4.5'];
      const expected = [1, 2, 'three', 4.5];
      expect(convertStringToNumber(input)).toEqual(expected);
    });

    it('should process objects recursively', () => {
      const input = {
        id: '1',
        name: 'Product',
        price: '9.99',
        tags: ['1', '2', 'tag3'],
        details: {
          weight: '500',
          unit: 'g'
        }
      };
      
      const expected = {
        id: 1,
        name: 'Product',
        price: 9.99,
        tags: [1, 2, 'tag3'],
        details: {
          weight: 500,
          unit: 'g'
        }
      };
      
      expect(convertStringToNumber(input)).toEqual(expected);
    });

    it('should not convert non-string types', () => {
      expect(convertStringToNumber(42)).toBe(42);
      expect(convertStringToNumber(true)).toBe(true);
      expect(convertStringToNumber(false)).toBe(false);
    });

    it('should handle empty spaces in strings', () => {
      expect(convertStringToNumber(' 42 ')).toBe(42);
      expect(convertStringToNumber('  ')).toBe('  ');
    });
  });

  describe('ensureNumericParams', () => {
    it('should convert known numeric parameters from strings to numbers', () => {
      const input = {
        amount: '5',
        price: '9.99',
        productId: '123',
        name: 'Test Product',
        note: 'Test note'
      };
      
      const expected = {
        amount: 5,
        price: 9.99,
        productId: 123,
        name: 'Test Product',
        note: 'Test note'
      };
      
      expect(ensureNumericParams(input)).toEqual(expected);
    });

    it('should handle null and undefined parameter values', () => {
      const input = {
        amount: null,
        price: undefined,
        productId: '123'
      };
      
      const expected = {
        amount: null,
        price: undefined,
        productId: 123
      };
      
      expect(ensureNumericParams(input)).toEqual(expected);
    });

    it('should not convert non-numeric strings', () => {
      const input = {
        productId: '123abc',
        amount: 'five'
      };
      
      expect(ensureNumericParams(input)).toEqual(input);
    });

    it('should handle non-object inputs', () => {
      expect(ensureNumericParams(null)).toBe(null);
      expect(ensureNumericParams(undefined)).toBe(undefined);
      expect(ensureNumericParams('string')).toBe('string');
      expect(ensureNumericParams(42)).toBe(42);
    });

    it('should not affect parameters that are already numbers', () => {
      const input = {
        amount: 5,
        price: 9.99,
        productId: 123
      };
      
      expect(ensureNumericParams(input)).toEqual(input);
    });

    it('should only convert parameters in the numeric parameters list', () => {
      const input = {
        amount: '5',
        customField: '123',
        nonNumericId: '456'
      };
      
      const expected = {
        amount: 5,
        customField: '123',
        nonNumericId: '456'
      };
      
      expect(ensureNumericParams(input)).toEqual(expected);
    });
  });
});
