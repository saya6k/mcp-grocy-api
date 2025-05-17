import { describe, it, expect } from 'vitest';
import { validateNumeric, validateObject } from '../src/services/grocy-api/validator.js';

describe('Validator', () => {
  describe('validateNumeric', () => {
    it('should validate valid numbers', () => {
      const result1 = validateNumeric(42);
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe(42);
      
      const result2 = validateNumeric(0);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(0);
      
      const result3 = validateNumeric(-10.5);
      expect(result3.isValid).toBe(true);
      expect(result3.value).toBe(-10.5);
    });

    it('should validate numeric strings', () => {
      const result1 = validateNumeric('42');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe(42);
      
      const result2 = validateNumeric('  42  ');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(42);
      
      const result3 = validateNumeric('-10.5');
      expect(result3.isValid).toBe(true);
      expect(result3.value).toBe(-10.5);
    });

    it('should handle empty strings', () => {
      const result = validateNumeric('');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('');
    });

    it('should reject non-numeric strings', () => {
      const result1 = validateNumeric('abc');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toContain('must be a valid number');
      
      const result2 = validateNumeric('123abc');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('must be a valid number');
    });

    it('should allow undefined and null values', () => {
      const result1 = validateNumeric(undefined);
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBeUndefined();
      
      const result2 = validateNumeric(null);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBeNull();
    });

    it('should reject non-number objects', () => {
      const result1 = validateNumeric({});
      expect(result1.isValid).toBe(false);
      expect(result1.error).toContain('must be a number');
      
      const result2 = validateNumeric([]);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('must be a number');
    });

    it('should include field name in error messages', () => {
      const result = validateNumeric('abc', 'Quantity');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Quantity must be a valid number');
    });
  });

  describe('validateObject', () => {
    it('should validate objects with numeric fields', () => {
      const testObj = {
        id: 1,
        amount: '42',
        name: 'Test',
        price: 10.5
      };
      
      const result = validateObject(testObj, ['id', 'amount', 'price']);
      expect(result.isValid).toBe(true);
      expect(result.validatedObj.id).toBe(1);
      expect(result.validatedObj.amount).toBe(42);
      expect(result.validatedObj.price).toBe(10.5);
      expect(result.validatedObj.name).toBe('Test');
    });

    it('should collect validation errors', () => {
      const testObj = {
        id: 1,
        amount: 'abc',
        price: {}
      };
      
      const result = validateObject(testObj, ['id', 'amount', 'price']);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2);
      expect(result.errors.some(err => err.includes('amount must be a valid number'))).toBe(true);
      expect(result.errors.some(err => err.includes('price must be a number'))).toBe(true);
    });

    it('should ignore missing fields', () => {
      const testObj = {
        id: 1
      };
      
      const result = validateObject(testObj, ['id', 'amount', 'price']);
      expect(result.isValid).toBe(true);
      expect(result.validatedObj).toEqual({ id: 1 });
    });

    it('should reject non-object inputs', () => {
      const result1 = validateObject(null, []);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toEqual(['Invalid input: expected an object']);
      
      const result2 = validateObject('string', []);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toEqual(['Invalid input: expected an object']);
    });

    it('should keep original values for non-numeric fields', () => {
      const testObj = {
        id: 1,
        name: 'Test',
        tags: ['tag1', 'tag2']
      };
      
      const result = validateObject(testObj, ['id']);
      expect(result.isValid).toBe(true);
      expect(result.validatedObj).toEqual(testObj);
    });
  });
});
