import type { Chore, TeamMember } from '../types';
import { startOfDay, addDays } from 'date-fns';

/**
 * Filter chores to exclude those assigned to deleted team members
 */
export function filterActiveChores(
  chores: Chore[],
  members: TeamMember[]
): Chore[] {
  const activeMemberIds = new Set(
    members.filter((m) => !m.isDeleted).map((m) => m.id)
  );

  return chores.filter(
    (chore) => chore.assigneeId && activeMemberIds.has(chore.assigneeId)
  );
}

/**
 * Filter chores by time range (next N days from today)
 * Excludes chores with no due date
 */
export function filterByTimeRange(
  chores: Chore[],
  daysFromToday: number
): Chore[] {
  const today = startOfDay(new Date());
  const endDate = addDays(today, daysFromToday);

  return chores.filter((chore) => {
    if (!chore.startDate) return false;
    
    const choreStart = startOfDay(new Date(chore.startDate));
    return choreStart >= today && choreStart <= endDate;
  });
}

/**
 * Filter chores by completion status
 * Note: Currently assumes endDate in the past means completed
 * This may need to be updated if completion tracking is added to Chore type
 */
export function filterByCompletionStatus(
  chores: Chore[],
  showCompleted: boolean
): Chore[] {
  if (showCompleted) return chores;

  const now = new Date();
  return chores.filter((chore) => {
    // No end date = not completed (ongoing or future)
    if (!chore.endDate) return true;
    // End date in future = not completed
    return new Date(chore.endDate) >= now;
  });
}

/**
 * Get count of pending chores for a specific member within time range
 */
export function getPendingChoresCount(
  memberId: string,
  chores: Chore[],
  members: TeamMember[],
  timeRangeDays: number
): number {
  const activeChores = filterActiveChores(chores, members);
  const memberChores = activeChores.filter((c) => c.assigneeId === memberId);
  const pendingChores = filterByCompletionStatus(memberChores, false);
  const upcomingChores = filterByTimeRange(pendingChores, timeRangeDays);
  
  return upcomingChores.length;
}

/**
 * Check if a chore is overdue
 */
export function isChoreOverdue(chore: Chore): boolean {
  if (!chore.startDate) return false;
  
  const now = new Date();
  const choreStart = new Date(chore.startDate);
  
  // If has end date and it's in the past, it's completed (not overdue)
  if (chore.endDate && new Date(chore.endDate) < now) {
    return false;
  }
  
  // If start date is in the past and not completed, it's overdue
  return choreStart < now;
}
