import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PaginationControls } from '../PaginationControls';

describe('PaginationControls', () => {
  const mockOnNextPage = vi.fn();
  const mockOnPrevPage = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  it('should render pagination information', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    );

    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/100 items/i)).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <PaginationControls
        currentPage={5}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should call onNextPage when next button clicked', async () => {
    const user = userEvent.setup();
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockOnNextPage).toHaveBeenCalledTimes(1);
  });

  it('should call onPrevPage when previous button clicked', async () => {
    const user = userEvent.setup();
    render(
      <PaginationControls
        currentPage={2}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(mockOnPrevPage).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(
      <PaginationControls
        currentPage={2}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    prevButton.focus();
    expect(prevButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(mockOnPrevPage).toHaveBeenCalled();
  });

  it('should display page size information when provided', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        pageSize={25}
        totalItems={100}
        onNextPage={mockOnNextPage}
        onPrevPage={mockOnPrevPage}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(screen.getByText(/25 per page/i)).toBeInTheDocument();
  });
});
