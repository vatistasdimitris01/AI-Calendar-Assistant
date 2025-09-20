
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

  const formattedEvents = useMemo(() => {
    if (!events) return [];
    // Events from the store are already filtered based on selected calendars.
    // We just need to map them to the format react-big-calendar expects.
    return events
      .filter(event => event && event.start && event.end)
      .map((event: GCalEvent) => ({
        id: event.id,
        title: event.summary || '',
        start: new Date(event.start.dateTime || event.start.date!),
        end: new Date(event.end.dateTime || event.end.date!),
        allDay: !!event.start.date,
        resource: event,
      }));
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