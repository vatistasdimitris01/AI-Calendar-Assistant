
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
// FIX: Changed date-fns imports to use named imports to fix call signature errors.
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import useCalendarStore from '../hooks/useCalendarStore';
import type { CalendarEvent, GCalEvent } from '../types';
import type { View } from 'react-big-calendar';


const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});


const CalendarView: React.FC = () => {
  const { events, currentDate, setCurrentDate, view, setView, openEventModal } = useCalendarStore();

  const formattedEvents: CalendarEvent[] = useMemo(() => {
    if (!Array.isArray(events)) return [];
    
    return events
      .filter((event): event is GCalEvent => 
        !!(event && event.id && event.start && event.end && (event.start.dateTime || event.start.date) && (event.end.dateTime || event.end.date))
      )
      .map((event: GCalEvent) => {
        try {
          const start = new Date(event.start.dateTime || event.start.date!);
          const end = new Date(event.end.dateTime || event.end.date!);
          
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn('Skipping event with invalid date:', event);
            return null;
          }

          return {
            id: event.id,
            title: event.summary || '(No Title)',
            start, end,
            allDay: !!event.start.date,
            resource: event,
          };
        } catch (error) {
          console.error("Failed to process event:", event, error);
          return null;
        }
      })
      // FIX: Corrected the type predicate to correctly narrow the type after filtering out nulls.
      .filter((event): event is NonNullable<typeof event> => event !== null);
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    openEventModal(event);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    openEventModal({ start: slotInfo.start, end: slotInfo.end });
  };

  return (
    <div className="h-full">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        className="text-sm"
        toolbar={false}
        date={currentDate}
        view={view}
        views={Object.keys(Views) as View[]}
        onView={(v) => setView(v)}
        onNavigate={(date) => setCurrentDate(date)}
      />
    </div>
  );
};

export default CalendarView;
