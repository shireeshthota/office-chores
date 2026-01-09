import { useState, useMemo, useEffect } from 'react';
import { paginate, calculateTotalPages, clamp } from '../utils/pagination';

export interface UsePaginationOptions {
  defaultPageSize?: number;
  minPageSize?: number;
  maxPageSize?: number;
}

export interface UsePaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const DEFAULT_PAGE_SIZE = 25;
const MIN_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const {
    defaultPageSize = DEFAULT_PAGE_SIZE,
    minPageSize = MIN_PAGE_SIZE,
    maxPageSize = MAX_PAGE_SIZE,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(
    clamp(defaultPageSize, minPageSize, maxPageSize)
  );

  // Calculate total pages
  const totalPages = useMemo(
    () => calculateTotalPages(items.length, pageSize),
    [items.length, pageSize]
  );

  // Get paginated items
  const paginatedItems = useMemo(
    () => paginate(items, { page: currentPage, pageSize }),
    [items, currentPage, pageSize]
  );

  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  // Ensure current page is valid when total pages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(clamp(page, 1, totalPages));
  };

  const setPageSize = (size: number) => {
    const clampedSize = clamp(size, minPageSize, maxPageSize);
    setPageSizeState(clampedSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
