import { useMemo } from 'react';
import type { EventInput } from '@fullcalendar/core';
import type { Chore, TeamMember, DateRange } from '../types';
import { getOccurrences } from '../utils/rruleHelpers';

export function useChoreExpansion(
  chores: Chore[],
  teamMembers: TeamMember[],
  range: DateRange | null
): EventInput[] {
  return useMemo(() => {
    if (!range) return [];

    const events: EventInput[] = [];

    for (const chore of chores) {
      const assignee = teamMembers.find((m) => m.id === chore.assigneeId);
      const color = assignee?.color ?? '#6B7280';

      if (!chore.isRecurring || !chore.rrule) {
        events.push({
          id: chore.id,
          title: chore.title,
          start: chore.startDate,
          end: chore.endDate,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            choreId: chore.id,
            description: chore.description,
            assignee: assignee?.name,
          },
        });
      } else {
        const occurrences = getOccurrences(chore.rrule, range.start, range.end);
        occurrences.forEach((date, idx) => {
          events.push({
            id: `${chore.id}-${idx}`,
            title: chore.title,
            start: date,
            allDay: true,
            backgroundColor: color,
            borderColor: color,
            extendedProps: {
              choreId: chore.id,
              description: chore.description,
              assignee: assignee?.name,
              isRecurring: true,
            },
          });
        });
      }
    }

    return events;
  }, [chores, teamMembers, range]);
}
