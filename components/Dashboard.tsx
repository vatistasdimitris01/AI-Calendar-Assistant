
import React, { useEffect, useState, useCallback } from 'react';
import useCalendarStore from '../hooks/useCalendarStore';
import Header from './Header';
import CalendarView from './CalendarView';
import AiAssistant from './AiAssistant';
import EventModal from './EventModal';
import type { CalendarEvent, GCalEvent } from '../types';

function Dashboard() {
  const { fetchEvents, isLoading, error } = useCalendarStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };
  
  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-800 font-sans">
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
             {isLoading && <div className="p-4 text-center">Loading events...</div>}
             {error && <div className="p-4 text-center text-red-500">{error}</div>}
             {!isLoading && !error && <CalendarView onSelectEvent={handleSelectEvent} onSelectSlot={handleSelectSlot} />}
          </div>
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col h-full overflow-y-auto">
            <AiAssistant />
          </div>
        </main>
      </div>
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={closeModal}
          event={selectedEvent}
        />
      )}
    </div>
  );
}

export default Dashboard;
