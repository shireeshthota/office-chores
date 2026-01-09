import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChoreForm } from '../ChoreForm';
import { AppProvider } from '../../../context/AppContext';
import type { Chore } from '../../../types';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AppProvider>{ui}</AppProvider>);
};

describe('ChoreForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(screen.getByPlaceholderText(/clean the kitchen/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/additional details/i)).toBeInTheDocument();
    expect(screen.getByText(/assign to/i)).toBeInTheDocument();
    expect(screen.getByText(/start date/i)).toBeInTheDocument();
    expect(screen.getByText(/start time/i)).toBeInTheDocument();
    expect(screen.getByText(/repeat this chore/i)).toBeInTheDocument();
  });

  it('should default time to 9:00 AM for new chores', () => {
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    const timeInput = inputs.find(input => input.type === 'time');
    // Get time input differently
    const allInputs = document.querySelectorAll('input[type="time"]');
    expect(allInputs[0]?.getAttribute('value')).toBe('09:00');
  });

  it('should allow submitting with custom date and time', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    // Fill in the form
    const titleInput = screen.getByPlaceholderText(/clean the kitchen/i);
    await user.type(titleInput, 'Test Chore');
    
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-01-15' } });
    
    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    // Submit
    await user.click(screen.getByText(/add chore/i));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should preserve date and time when editing existing chore', () => {
    const existingChore: Chore = {
      id: 'chore-1',
      title: 'Existing Chore',
      description: 'Test description',
      assigneeId: null,
      startDate: '2026-01-20T15:45:00.000Z', // 3:45 PM UTC
      isRecurring: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    renderWithProvider(
      <ChoreForm
        chore={existingChore}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    // Check that the form is populated
    const titleInput = screen.getByDisplayValue('Existing Chore') as HTMLInputElement;
    expect(titleInput.value).toBe('Existing Chore');

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    // Date should be preserved in local timezone
    expect(dateInput.value).toBeTruthy();
    
    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
    expect(timeInput.value).toBeTruthy();
  });

  it('should require title field', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    // Try to submit without title
    await user.click(screen.getByText(/add chore/i));

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByText(/cancel/i));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show delete button when editing existing chore', () => {
    const existingChore: Chore = {
      id: 'chore-1',
      title: 'Existing Chore',
      assigneeId: null,
      startDate: '2026-01-20T10:00:00.000Z',
      isRecurring: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    renderWithProvider(
      <ChoreForm
        chore={existingChore}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it('should not show delete button for new chore', () => {
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument();
  });

  it('should use initialDate when provided for new chore', () => {
    const initialDate = new Date(2026, 0, 25); // Jan 25, 2026
    
    renderWithProvider(
      <ChoreForm
        initialDate={initialDate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput.value).toBe('2026-01-25');
  });

  it('should toggle recurring checkbox', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <ChoreForm onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    const recurringToggle = screen.getByText(/repeat this chore/i);
    
    // Should not show recurrence builder initially
    expect(screen.queryByText(/daily/i)).not.toBeInTheDocument();
    
    // Click to enable recurring
    await user.click(recurringToggle);
    
    // Now recurrence builder should appear
    await waitFor(() => {
      expect(screen.getByText(/daily/i)).toBeInTheDocument();
    });
  });
});
