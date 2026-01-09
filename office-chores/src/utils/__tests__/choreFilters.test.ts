import { describe, it, expect } from 'vitest';
import {
  filterActiveChores,
  filterByTimeRange,
  filterByCompletionStatus,
  getPendingChoresCount,
  isChoreOverdue,
} from '../choreFilters';
import type { Chore, TeamMember } from '../../types';
import { addDays, subDays, format } from 'date-fns';

const createMockTeamMember = (overrides?: Partial<TeamMember>): TeamMember => ({
  id: 'member-1',
  name: 'Test Member',
  color: '#FF0000',
  isDeleted: false,
  ...overrides,
});

const createMockChore = (overrides?: Partial<Chore>): Chore => ({
  id: 'chore-1',
  title: 'Test Chore',
  assigneeId: 'member-1',
  startDate: new Date().toISOString(),
  isRecurring: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('choreFilters', () => {
  describe('filterActiveChores', () => {
    it('should return chores assigned to active members', () => {
      const members: TeamMember[] = [
        createMockTeamMember({ id: 'member-1', isDeleted: false }),
        createMockTeamMember({ id: 'member-2', isDeleted: false }),
      ];
      
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', assigneeId: 'member-1' }),
        createMockChore({ id: 'chore-2', assigneeId: 'member-2' }),
      ];

      const result = filterActiveChores(chores, members);
      expect(result).toHaveLength(2);
    });

    it('should exclude chores assigned to deleted members', () => {
      const members: TeamMember[] = [
        createMockTeamMember({ id: 'member-1', isDeleted: false }),
        createMockTeamMember({ id: 'member-2', isDeleted: true }),
      ];
      
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', assigneeId: 'member-1' }),
        createMockChore({ id: 'chore-2', assigneeId: 'member-2' }),
      ];

      const result = filterActiveChores(chores, members);
      expect(result).toHaveLength(1);
      expect(result[0].assigneeId).toBe('member-1');
    });

    it('should exclude chores with no assignee', () => {
      const members: TeamMember[] = [
        createMockTeamMember({ id: 'member-1', isDeleted: false }),
      ];
      
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', assigneeId: 'member-1' }),
        createMockChore({ id: 'chore-2', assigneeId: null }),
      ];

      const result = filterActiveChores(chores, members);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chore-1');
    });
  });

  describe('filterByTimeRange', () => {
    it('should return chores within time range', () => {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const dayAfter = addDays(today, 2);

      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', startDate: today.toISOString() }),
        createMockChore({ id: 'chore-2', startDate: tomorrow.toISOString() }),
        createMockChore({ id: 'chore-3', startDate: dayAfter.toISOString() }),
      ];

      const result = filterByTimeRange(chores, 2);
      expect(result).toHaveLength(3);
    });

    it('should exclude chores outside time range', () => {
      const today = new Date();
      const inFuture = addDays(today, 10);

      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', startDate: today.toISOString() }),
        createMockChore({ id: 'chore-2', startDate: inFuture.toISOString() }),
      ];

      const result = filterByTimeRange(chores, 3);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chore-1');
    });

    it('should exclude chores with no start date', () => {
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', startDate: new Date().toISOString() }),
        createMockChore({ id: 'chore-2', startDate: '' }),
      ];

      const result = filterByTimeRange(chores, 3);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chore-1');
    });

    it('should exclude chores from the past', () => {
      const yesterday = subDays(new Date(), 1);
      const today = new Date();

      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', startDate: yesterday.toISOString() }),
        createMockChore({ id: 'chore-2', startDate: today.toISOString() }),
      ];

      const result = filterByTimeRange(chores, 3);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chore-2');
    });
  });

  describe('filterByCompletionStatus', () => {
    it('should return all chores when showCompleted is true', () => {
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1' }),
        createMockChore({ id: 'chore-2' }),
      ];

      const result = filterByCompletionStatus(chores, true);
      expect(result).toHaveLength(2);
    });

    it('should exclude completed chores when showCompleted is false', () => {
      const past = subDays(new Date(), 1);
      const future = addDays(new Date(), 1);

      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', endDate: past.toISOString() }),
        createMockChore({ id: 'chore-2', endDate: future.toISOString() }),
      ];

      const result = filterByCompletionStatus(chores, false);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('chore-2');
    });

    it('should include chores with no end date', () => {
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', endDate: undefined }),
        createMockChore({ id: 'chore-2', endDate: undefined }),
      ];

      const result = filterByCompletionStatus(chores, false);
      expect(result).toHaveLength(2);
    });
  });

  describe('getPendingChoresCount', () => {
    it('should count pending chores for a member', () => {
      const members: TeamMember[] = [
        createMockTeamMember({ id: 'member-1', isDeleted: false }),
      ];

      const today = new Date();
      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', assigneeId: 'member-1', startDate: today.toISOString() }),
        createMockChore({ id: 'chore-2', assigneeId: 'member-1', startDate: addDays(today, 1).toISOString() }),
      ];

      const count = getPendingChoresCount('member-1', chores, members, 3);
      expect(count).toBe(2);
    });

    it('should exclude chores from deleted members', () => {
      const members: TeamMember[] = [
        createMockTeamMember({ id: 'member-1', isDeleted: true }),
      ];

      const chores: Chore[] = [
        createMockChore({ id: 'chore-1', assigneeId: 'member-1' }),
      ];

      const count = getPendingChoresCount('member-1', chores, members, 3);
      expect(count).toBe(0);
    });

    it('should return 0 for member with no chores', () => {
      const members: TeamMember[] = [
        createMockTeamMember({ id: 'member-1', isDeleted: false }),
      ];

      const count = getPendingChoresCount('member-1', [], members, 3);
      expect(count).toBe(0);
    });
  });

  describe('isChoreOverdue', () => {
    it('should return true for chore with start date in the past', () => {
      const yesterday = subDays(new Date(), 1);
      const chore = createMockChore({ startDate: yesterday.toISOString() });

      expect(isChoreOverdue(chore)).toBe(true);
    });

    it('should return false for chore with start date in the future', () => {
      const tomorrow = addDays(new Date(), 1);
      const chore = createMockChore({ startDate: tomorrow.toISOString() });

      expect(isChoreOverdue(chore)).toBe(false);
    });

    it('should return false for completed chore', () => {
      const yesterday = subDays(new Date(), 1);
      const chore = createMockChore({
        startDate: yesterday.toISOString(),
        endDate: yesterday.toISOString(),
      });

      expect(isChoreOverdue(chore)).toBe(false);
    });

    it('should return false for chore with no start date', () => {
      const chore = createMockChore({ startDate: '' });

      expect(isChoreOverdue(chore)).toBe(false);
    });
  });
});
