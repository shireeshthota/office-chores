import { describe, it, expect } from 'vitest';
import {
  paginate,
  calculateTotalPages,
  clamp,
  isValidPage,
} from '../pagination';

describe('pagination', () => {
  describe('paginate', () => {
    it('should return correct items for first page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, { page: 1, pageSize: 3 });
      
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return correct items for middle page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, { page: 2, pageSize: 3 });
      
      expect(result).toEqual([4, 5, 6]);
    });

    it('should return correct items for last page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, { page: 4, pageSize: 3 });
      
      expect(result).toEqual([10]);
    });

    it('should return empty array for page beyond range', () => {
      const items = [1, 2, 3, 4, 5];
      const result = paginate(items, { page: 10, pageSize: 3 });
      
      expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
      const items: number[] = [];
      const result = paginate(items, { page: 1, pageSize: 10 });
      
      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const items = [1];
      const result = paginate(items, { page: 1, pageSize: 10 });
      
      expect(result).toEqual([1]);
    });

    it('should handle page size larger than items', () => {
      const items = [1, 2, 3];
      const result = paginate(items, { page: 1, pageSize: 10 });
      
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('calculateTotalPages', () => {
    it('should return correct page count', () => {
      expect(calculateTotalPages(100, 25)).toBe(4);
    });

    it('should round up for partial pages', () => {
      expect(calculateTotalPages(26, 25)).toBe(2);
    });

    it('should return 1 for empty items', () => {
      expect(calculateTotalPages(0, 25)).toBe(1);
    });

    it('should return 1 for single item', () => {
      expect(calculateTotalPages(1, 25)).toBe(1);
    });

    it('should handle exact multiples', () => {
      expect(calculateTotalPages(50, 25)).toBe(2);
    });

    it('should handle large numbers', () => {
      expect(calculateTotalPages(1000, 50)).toBe(20);
    });
  });

  describe('clamp', () => {
    it('should return value if within range', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('should return min if value below min', () => {
      expect(clamp(0, 1, 10)).toBe(1);
    });

    it('should return max if value above max', () => {
      expect(clamp(15, 1, 10)).toBe(10);
    });

    it('should handle value equal to min', () => {
      expect(clamp(1, 1, 10)).toBe(1);
    });

    it('should handle value equal to max', () => {
      expect(clamp(10, 1, 10)).toBe(10);
    });

    it('should handle negative numbers', () => {
      expect(clamp(-5, -10, 0)).toBe(-5);
    });
  });

  describe('isValidPage', () => {
    it('should return true for valid page', () => {
      expect(isValidPage(1, 5)).toBe(true);
      expect(isValidPage(3, 5)).toBe(true);
      expect(isValidPage(5, 5)).toBe(true);
    });

    it('should return false for page less than 1', () => {
      expect(isValidPage(0, 5)).toBe(false);
      expect(isValidPage(-1, 5)).toBe(false);
    });

    it('should return false for page greater than total', () => {
      expect(isValidPage(6, 5)).toBe(false);
      expect(isValidPage(10, 5)).toBe(false);
    });

    it('should handle single page', () => {
      expect(isValidPage(1, 1)).toBe(true);
      expect(isValidPage(2, 1)).toBe(false);
    });
  });
});
