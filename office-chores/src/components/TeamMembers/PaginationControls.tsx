import React from 'react';
import { Button } from '../ui/Button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onPageSizeChange?: (size: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onNextPage,
  onPrevPage,
  onPageSizeChange,
}) => {
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages || totalPages === 0;

  return (
    <div className="flex items-center justify-between gap-4 py-4" role="navigation" aria-label="Pagination">
      <div className="text-sm text-gray-600">
        <span>
          Page {currentPage} of {totalPages} • {totalItems} items
        </span>
        {onPageSizeChange && (
          <span className="ml-2">
            ({pageSize} per page)
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onPrevPage}
          disabled={isPrevDisabled}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <Button
          onClick={onNextPage}
          disabled={isNextDisabled}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
