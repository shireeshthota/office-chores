import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, DatesSetArg } from '@fullcalendar/core';
import { useApp } from '../../context/AppContext';
import { useChoreExpansion } from '../../hooks/useChoreExpansion';
import type { DateRange } from '../../types';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  onEventClick: (choreId: string) => void;
}

export interface CalendarViewRef {
  goToToday: () => void;
}

export const CalendarView = forwardRef<CalendarViewRef, CalendarViewProps>(
  ({ onDateSelect, onEventClick }, ref) => {
    const { state } = useApp();
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const calendarRef = useRef<FullCalendar>(null);

    useImperativeHandle(ref, () => ({
      goToToday: () => {
        calendarRef.current?.getApi().today();
      },
    }));

    const events = useChoreExpansion(state.chores, state.teamMembers, dateRange);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({ start: arg.start, end: arg.end });
  }, []);

  const handleDateSelect = useCallback(
    (arg: DateSelectArg) => {
      onDateSelect(arg.start);
    },
    [onDateSelect]
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const choreId = arg.event.extendedProps.choreId as string;
      onEventClick(choreId);
    },
    [onEventClick]
  );

  return (
    <div className="h-full p-6">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        height="100%"
        eventDisplay="block"
        dayMaxEvents={3}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
    </div>
  );
});
