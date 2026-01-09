import { useMemo } from 'react';
import type { Chore } from '../types';
import { useApp } from '../context/AppContext';

export function useTeamMemberChores(
  chores: Chore[],
  memberId: string,
  timeRange: 'all' | 'week' | 'month'
) {
  const { state } = useApp();

  const { pendingChores, completedChores, allChores } = useMemo(() => {
    // Filter chores for this specific member
    const memberChores = chores.filter((chore) => chore.assigneeId === memberId);

    // Separate completed and pending chores
    const pending = memberChores.filter((chore) => !chore.isCompleted);
    const completed = memberChores.filter((chore) => chore.isCompleted);

    return {
      pendingChores: pending,
      completedChores: completed,
      allChores: memberChores,
    };
  }, [chores, memberId]);

  return {
    pendingChores,
    completedChores,
    allChores,
  };
}
