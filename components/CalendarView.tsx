
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import useCalendarStore from '../hooks/useCalendarStore';
import type { CalendarEvent, GCalEvent } from '../types';

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

interface CalendarViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onSelectEvent, onSelectSlot }) => {
  const { events } = useCalendarStore();

  const formattedEvents = useMemo(() => {
    return events.map((event: GCalEvent) => ({
      id: event.id,
      title: event.summary,
      start: new Date(event.start.dateTime || event.start.date!),
      end: new Date(event.end.dateTime || event.end.date!),
      allDay: !!event.start.date,
      resource: event,
    }));
  }, [events]);

  return (
    <div className="p-4 h-full">
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        className="text-sm"
      />
    </div>
  );
};

export default CalendarView;
