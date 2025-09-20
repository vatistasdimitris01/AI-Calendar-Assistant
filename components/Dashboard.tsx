import React, { useEffect, useState } from 'react';
import useCalendarStore from '../hooks/useCalendarStore';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import CalendarView from './CalendarView';
import AiAssistant from './AiAssistant';
import EventModal from './EventModal';
import { SparklesIcon } from './icons';

function Dashboard() {
  const { fetchEvents, fetchCalendars, isLoading, error, isSidebarOpen, toggleSidebar, isEventModalOpen } = useCalendarStore();
  const [isAiAssistantVisible, setIsAiAssistantVisible] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchCalendars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-sans overflow-hidden">
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/30 z-20 lg:hidden" aria-hidden="true"/>}
      <LeftSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 grid grid-cols-12 overflow-hidden">
          <div className={`${isAiAssistantVisible ? "col-span-12 lg:col-span-9" : "col-span-12"} p-4 md:p-6 lg:p-8 h-full flex flex-col`}>
             {isLoading && <div className="p-4 text-center">Loading events...</div>}
             {error && <div className="p-4 text-center text-red-500">{error}</div>}
             {!isLoading && !error && <CalendarView />}
          </div>
          {isAiAssistantVisible && (
            <div className="col-span-12 lg:col-span-3 border-l border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <AiAssistant />
            </div>
          )}
        </main>
      </div>

      <button
        onClick={() => setIsAiAssistantVisible(!isAiAssistantVisible)}
        title="Toggle AI Assistant"
        aria-label="Toggle AI Assistant"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <SparklesIcon className="w-7 h-7" />
      </button>

      {isEventModalOpen && <EventModal />}
    </div>
  );
}

export default Dashboard;
