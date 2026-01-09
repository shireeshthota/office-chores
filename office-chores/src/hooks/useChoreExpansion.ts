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
      
      // Use gray/strikethrough styling for completed chores
      const eventColor = chore.isCompleted ? '#9CA3AF' : color;
      const eventTitle = chore.isCompleted ? `✓ ${chore.title}` : chore.title;

      if (!chore.isRecurring || !chore.rrule) {
        events.push({
          id: chore.id,
          title: eventTitle,
          start: chore.startDate,
          end: chore.endDate,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: chore.isCompleted ? '#6B7280' : '#FFFFFF',
          extendedProps: {
            choreId: chore.id,
            description: chore.description,
            assignee: assignee?.name,
            isCompleted: chore.isCompleted,
          },
        });
      } else {
        const occurrences = getOccurrences(chore.rrule, range.start, range.end);
        occurrences.forEach((date, idx) => {
          events.push({
            id: `${chore.id}-${idx}`,
            title: eventTitle,
            start: date,
            allDay: true,
            backgroundColor: eventColor,
            borderColor: eventColor,
            textColor: chore.isCompleted ? '#6B7280' : '#FFFFFF',
            extendedProps: {
              choreId: chore.id,
              description: chore.description,
              assignee: assignee?.name,
              isRecurring: true,
              isCompleted: chore.isCompleted,
            },
          });
        });
      }
    }

    return events;
  }, [chores, teamMembers, range]);
}
