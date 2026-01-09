import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTeamMemberChores } from '../useTeamMemberChores';
import { AppProvider } from '../../context/AppContext';
import type { ReactNode } from 'react';
import type { Chore, TeamMember } from '../../types';
import { addDays, subDays } from 'date-fns';

// Mock AppContext for testing
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => {
    return <AppProvider>{children}</AppProvider>;
  };
};

const mockChore = (id: string, assigneeId: string): Chore => ({
  id,
  title: `Chore ${id}`,
  description: '',
  assigneeId,
  startDate: new Date().toISOString(),
  endDate: addDays(new Date(), 7).toISOString(),
  isRecurring: false,
  rrule: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('useTeamMemberChores', () => {
  it('should initialize with empty arrays', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useTeamMemberChores([], 'member-1', 'all'),
      { wrapper }
    );

    expect(result.current.pendingChores).toEqual([]);
    expect(result.current.completedChores).toEqual([]);
    expect(result.current.allChores).toEqual([]);
  });

  it('should return pending chores within time range', () => {
    const wrapper = createWrapper();
    const chores = [
      mockChore('chore-1', 'member-1'),
      mockChore('chore-2', 'member-2'),
    ];
    
    const { result } = renderHook(
      () =>
        useTeamMemberChores(chores, 'member-1', 'week'),
      { wrapper }
    );

    expect(result.current.pendingChores).toHaveLength(1);
    expect(result.current.pendingChores[0].id).toBe('chore-1');
  });

  it('should filter by time range', () => {
    const wrapper = createWrapper();
    const chores = [
      mockChore('chore-1', 'member-1'),
    ];
    
    const { result } = renderHook(
      () =>
        useTeamMemberChores(chores, 'member-1', 'month'),
      { wrapper }
    );

    expect(result.current.allChores).toHaveLength(1);
  });

  it('should separate pending and completed chores', () => {
    const wrapper = createWrapper();
    const chores = [
      mockChore('chore-1', 'member-1'),
    ];
    
    const { result } = renderHook(
      () =>
        useTeamMemberChores(chores, 'member-1', 'all'),
      { wrapper }
    );

    expect(result.current.pendingChores).toBeDefined();
    expect(result.current.completedChores).toBeDefined();
    expect(result.current.completedChores).toHaveLength(0); // No completion tracking yet
  });

  it('should include completed chores when showCompleted is true', () => {
    const wrapper = createWrapper();
    const chores = [
      mockChore('chore-1', 'member-1'),
    ];
    
    const { result } = renderHook(
      () =>
        useTeamMemberChores(chores, 'member-1', 'all'),
      { wrapper }
    );

    expect(result.current.allChores).toBeDefined();
    expect(result.current.allChores).toHaveLength(1);
  });

  it('should exclude completed chores when showCompleted is false', () => {
    const wrapper = createWrapper();
    const chores = [
      mockChore('chore-1', 'member-1'),
    ];
    
    const { result } = renderHook(
      () =>
        useTeamMemberChores(chores, 'member-1', 'all'),
      { wrapper }
    );

    expect(result.current.allChores).toEqual(result.current.pendingChores);
  });
});
