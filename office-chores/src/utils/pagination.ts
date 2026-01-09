/**
 * Paginate an array of items
 */
export function paginate<T>(
  items: T[],
  options: { page: number; pageSize: number }
): T[] {
  const { page, pageSize } = options;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return items.slice(startIndex, endIndex);
}

/**
 * Calculate total number of pages
 */
export function calculateTotalPages(
  totalItems: number,
  pageSize: number
): number {
  if (totalItems === 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Validate page number is within valid range
 */
export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= totalPages;
}
