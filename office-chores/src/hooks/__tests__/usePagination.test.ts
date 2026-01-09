import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const items = [1, 2, 3, 4, 5];
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should paginate items correctly', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    expect(result.current.paginatedItems).toHaveLength(25);
    expect(result.current.paginatedItems[0]).toBe(1);
    expect(result.current.paginatedItems[24]).toBe(25);
    expect(result.current.totalPages).toBe(4);
  });

  it('should navigate to next page', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0]).toBe(26);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('should navigate to previous page', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    act(() => {
      result.current.nextPage();
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    const items = [1, 2, 3];
    const { result } = renderHook(() => usePagination(items));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not go beyond total pages', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    act(() => {
      result.current.nextPage();
      result.current.nextPage();
      result.current.nextPage();
      result.current.nextPage();
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(4);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should go to specific page', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedItems[0]).toBe(51);
  });

  it('should clamp invalid page numbers', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    act(() => {
      result.current.goToPage(10);
    });

    expect(result.current.currentPage).toBe(4);

    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should change page size', () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(items, { defaultPageSize: 25 })
    );

    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.pageSize).toBe(50);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(1);
  });

  it('should clamp page size to min/max', () => {
    const items = [1, 2, 3];
    const { result } = renderHook(() =>
      usePagination(items, { minPageSize: 25, maxPageSize: 50 })
    );

    act(() => {
      result.current.setPageSize(10);
    });

    expect(result.current.pageSize).toBe(25);

    act(() => {
      result.current.setPageSize(100);
    });

    expect(result.current.pageSize).toBe(50);
  });

  it('should reset to page 1 when items length changes', () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items, { defaultPageSize: 25 }),
      { initialProps: { items: Array.from({ length: 100 }, (_, i) => i + 1) } }
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    // Change to different number of items
    rerender({ items: Array.from({ length: 25 }, (_, i) => i + 101) });

    // Should reset to page 1 because items.length changed
    expect(result.current.currentPage).toBe(1);
  });

  it('should adjust page when total pages decrease', () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items, { defaultPageSize: 25 }),
      { initialProps: { items: Array.from({ length: 100 }, (_, i) => i + 1) } }
    );

    act(() => {
      result.current.goToPage(4);
    });

    expect(result.current.currentPage).toBe(4);

    // Change to items that only have 1 page
    rerender({ items: [1, 2, 3] });

    expect(result.current.currentPage).toBe(1);
  });

  it('should handle empty items', () => {
    const { result } = renderHook(() => usePagination([]));

    expect(result.current.paginatedItems).toEqual([]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });
});
