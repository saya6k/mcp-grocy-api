import { describe, it, expect } from 'vitest';
import { compareVersions, checkGrocyVersion } from '../src/services/grocy-api/version-checker.js';

describe('Version Checker', () => {
  describe('compareVersions', () => {
    it('should correctly compare equal versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('3.3.0', '3.3.0')).toBe(0);
      expect(compareVersions('4.5.0', '4.5.0')).toBe(0);
    });

    it('should correctly compare different major versions', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('5.0.0', '4.5.0')).toBe(1);
    });

    it('should correctly compare different minor versions', () => {
      expect(compareVersions('1.1.0', '1.2.0')).toBe(-1);
      expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
      expect(compareVersions('4.6.0', '4.5.0')).toBe(1);
    });

    it('should correctly compare different patch versions', () => {
      expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
      expect(compareVersions('1.0.2', '1.0.1')).toBe(1);
      expect(compareVersions('4.5.1', '4.5.0')).toBe(1);
    });

    it('should handle versions with different number of segments', () => {
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.0.1', '1.0.0')).toBe(1);
      expect(compareVersions('1.0', '1.0.1')).toBe(-1);
    });
  });

  describe('checkGrocyVersion', () => {
    it('should correctly identify compatible versions', () => {
      const result = checkGrocyVersion('3.3.0');
      expect(result.isCompatible).toBe(true);
      expect(result.warnings.length).toBe(0);
      expect(result.criticalIssues.length).toBe(0);
    });

    it('should return critical issues for too old versions', () => {
      const result = checkGrocyVersion('3.2.0');
      expect(result.isCompatible).toBe(false);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.criticalIssues[0]).toContain('older than minimum supported version');
    });

    it('should return warnings for newer versions', () => {
      const result = checkGrocyVersion('4.6.0');
      expect(result.isCompatible).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('newer than the highest tested version');
    });

    it('should handle version with additional text', () => {
      const result = checkGrocyVersion('4.0.0-beta');
      expect(result.isCompatible).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('numeric values without quotes'))).toBe(true);
    });

    it('should return critical issue for undefined version', () => {
      const result = checkGrocyVersion(undefined);
      expect(result.isCompatible).toBe(false);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.criticalIssues[0]).toBe('Could not determine Grocy version');
    });

    it('should identify data type changes in version 4.0.0 and above', () => {
      const resultBefore = checkGrocyVersion('3.9.0');
      expect(resultBefore.warnings.some(w => w.includes('numeric values without quotes'))).toBe(false);
      
      const resultAfter = checkGrocyVersion('4.0.0');
      expect(resultAfter.warnings.some(w => w.includes('numeric values without quotes'))).toBe(true);
    });
  });
});
