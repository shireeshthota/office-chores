import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TeamListPage } from '../TeamListPage';
import { AppProvider } from '../../../context/AppContext';
import type { TeamMember, Chore } from '../../../types';

// Mock data
const mockTeamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Alice Johnson', isDeleted: false },
  { id: 'tm-2', name: 'Bob Smith', isDeleted: false },
  { id: 'tm-3', name: 'Charlie Brown', isDeleted: false },
];

const mockChores: Chore[] = [
  {
    id: 'chore-1',
    title: 'Clean kitchen',
    description: 'Wipe counters',
    assigneeId: 'tm-1',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-15T23:59:59Z',
    isRecurring: true,
    rrule: 'FREQ=WEEKLY;BYDAY=MO',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'chore-2',
    title: 'Take out trash',
    description: 'Empty bins',
    assigneeId: 'tm-1',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-15T23:59:59Z',
    isRecurring: true,
    rrule: 'FREQ=DAILY',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'chore-3',
    title: 'Vacuum office',
    description: 'Vacuum all carpets',
    assigneeId: 'tm-2',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-15T23:59:59Z',
    isRecurring: true,
    rrule: 'FREQ=WEEKLY;BYDAY=FR',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {ui}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('TeamListPage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render page title', () => {
    renderWithContext(<TeamListPage />);

    expect(screen.getByRole('heading', { name: /team members/i })).toBeInTheDocument();
  });

  it('should display all team members', () => {
    // Pre-populate localStorage with team members
    localStorage.setItem(
      'office-chores-data',
      JSON.stringify({
        teamMembers: mockTeamMembers,
        chores: mockChores,
      })
    );

    renderWithContext(<TeamListPage />);

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('should show pending chore counts for each member', () => {
    localStorage.setItem(
      'office-chores-data',
      JSON.stringify({
        teamMembers: mockTeamMembers,
        chores: mockChores,
      })
    );

    renderWithContext(<TeamListPage />);

    // Alice has 2 pending chores
    expect(screen.getByText(/2 pending/i)).toBeInTheDocument();
    // Bob has 1 pending chore
    expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
  });

  it('should show empty state when no team members', () => {
    renderWithContext(<TeamListPage />);

    expect(screen.getByText(/no team members/i)).toBeInTheDocument();
  });

  it('should filter out deleted team members', () => {
    const membersWithDeleted = [
      ...mockTeamMembers,
      { id: 'tm-deleted', name: 'Deleted User', isDeleted: true },
    ];

    localStorage.setItem(
      'office-chores-data',
      JSON.stringify({
        teamMembers: membersWithDeleted,
        chores: mockChores,
      })
    );

    renderWithContext(<TeamListPage />);

    expect(screen.queryByText('Deleted User')).not.toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('should render team member cards as clickable links', () => {
    localStorage.setItem(
      'office-chores-data',
      JSON.stringify({
        teamMembers: mockTeamMembers,
        chores: mockChores,
      })
    );

    renderWithContext(<TeamListPage />);

    const aliceLink = screen.getByRole('link', { name: /alice johnson/i });
    expect(aliceLink).toHaveAttribute('href', '/team/tm-1');
  });

  it('should have proper semantic HTML structure', () => {
    localStorage.setItem(
      'office-chores-data',
      JSON.stringify({
        teamMembers: mockTeamMembers,
        chores: [],
      })
    );

    renderWithContext(<TeamListPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
