import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TeamMemberCard } from '../TeamMemberCard';
import type { TeamMember } from '../../../types';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('TeamMemberCard', () => {
  const mockTeamMember: TeamMember = {
    id: 'tm-1',
    name: 'Alice Johnson',
    isDeleted: false,
  };

  it('should render team member name', () => {
    renderWithRouter(<TeamMemberCard member={mockTeamMember} pendingChores={5} />);

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('should display pending chores count', () => {
    renderWithRouter(<TeamMemberCard member={mockTeamMember} pendingChores={3} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('should show zero pending chores', () => {
    renderWithRouter(<TeamMemberCard member={mockTeamMember} pendingChores={0} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('should render as a clickable link', () => {
    renderWithRouter(<TeamMemberCard member={mockTeamMember} pendingChores={5} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/team/tm-1');
  });

  it('should use correct plural form for pending chores', () => {
    const { rerender } = renderWithRouter(
      <TeamMemberCard member={mockTeamMember} pendingChores={1} />
    );

    expect(screen.getByText(/1 pending chore/i)).toBeInTheDocument();

    rerender(<BrowserRouter><TeamMemberCard member={mockTeamMember} pendingChores={5} /></BrowserRouter>);
    expect(screen.getByText(/5 pending chores/i)).toBeInTheDocument();
  });

  it('should have accessible semantic HTML', () => {
    renderWithRouter(<TeamMemberCard member={mockTeamMember} pendingChores={5} />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    
    // Should have proper heading for screen readers
    expect(screen.getByRole('heading', { name: 'Alice Johnson' })).toBeInTheDocument();
  });

  it('should apply hover states for interactivity', () => {
    renderWithRouter(<TeamMemberCard member={mockTeamMember} pendingChores={5} />);

    const link = screen.getByRole('link');
    expect(link.className).toMatch(/hover/); // Check if hover classes are applied
  });
});
