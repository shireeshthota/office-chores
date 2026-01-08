import { useEffect, useRef, useCallback } from 'react';
import type { Chore, TeamMember } from '../types';
import { getOccurrences } from '../utils/rruleHelpers';
import {
  requestNotificationPermission,
  showNotification,
  getNotificationPermission,
} from '../utils/notifications';

interface ScheduledNotification {
  choreId: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export function useNotifications(chores: Chore[], teamMembers: TeamMember[]) {
  const scheduledRef = useRef<ScheduledNotification[]>([]);

  const clearScheduled = useCallback(() => {
    scheduledRef.current.forEach(({ timeoutId }) => clearTimeout(timeoutId));
    scheduledRef.current = [];
  }, []);

  const scheduleNotifications = useCallback(() => {
    clearScheduled();

    if (getNotificationPermission() !== 'granted') {
      return;
    }

    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    for (const chore of chores) {
      if (chore.reminderMinutesBefore === undefined) continue;

      let choreDates: Date[] = [];

      if (chore.isRecurring && chore.rrule) {
        choreDates = getOccurrences(chore.rrule, now, endOfDay);
      } else {
        const choreDate = new Date(chore.startDate);
        if (choreDate >= now && choreDate <= endOfDay) {
          choreDates = [choreDate];
        }
      }

      for (const choreDate of choreDates) {
        const reminderTime = new Date(
          choreDate.getTime() - chore.reminderMinutesBefore * 60 * 1000
        );

        if (reminderTime <= now) continue;

        const delay = reminderTime.getTime() - now.getTime();
        const assignee = teamMembers.find((m) => m.id === chore.assigneeId);

        const timeoutId = setTimeout(() => {
          const assigneeText = assignee ? ` (assigned to ${assignee.name})` : '';
          showNotification(
            'Chore Reminder',
            `${chore.title}${assigneeText} is coming up!`
          );
        }, delay);

        scheduledRef.current.push({
          choreId: chore.id,
          timeoutId,
        });
      }
    }
  }, [chores, teamMembers, clearScheduled]);

  useEffect(() => {
    scheduleNotifications();
    return clearScheduled;
  }, [scheduleNotifications, clearScheduled]);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      scheduleNotifications();
    }
    return granted;
  }, [scheduleNotifications]);

  return {
    permission: getNotificationPermission(),
    requestPermission,
  };
}
