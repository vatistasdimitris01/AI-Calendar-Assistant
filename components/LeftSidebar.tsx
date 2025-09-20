
import React, { useEffect } from 'react';
import { PlusIcon, ChevronDownIcon, XIcon } from './icons';
import useCalendarStore from '../hooks/useCalendarStore';
// FIX: Changed date-fns imports to use named imports to fix call signature errors.
import { getDaysInMonth } from 'date-fns/getDaysInMonth';
import { startOfMonth } from 'date-fns/startOfMonth';
import { getDay } from 'date-fns/getDay';
import { addDays } from 'date-fns/addDays';
import { isSameDay } from 'date-fns/isSameDay';
import { isSameMonth } from 'date-fns/isSameMonth';

const MiniCalendar: React.FC = () => {
    const { currentDate, setCurrentDate } = useCalendarStore();
    const monthStart = startOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const startingDay = getDay(monthStart);

    const days = [];
    for (let i = 0; i < startingDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const day = addDays(monthStart, i - 1);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, currentDate);
        const isCurrentMonth = isSameMonth(day, currentDate);
        
        days.push(
            <div key={i} className="flex items-center justify-center">
                 <button 
                    onClick={() => setCurrentDate(day)}
                    className={`w-8 h-8 rounded-full text-xs flex items-center justify-center
                        ${isToday ? 'bg-blue-600 text-white' : ''}
                        ${isSelected && !isToday ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                        ${!isCurrentMonth ? 'text-gray-400' : ''}
                    `}
                 >
                    {i}
                 </button>
            </div>
        );
    }

    return (
        <div className="mt-4 pr-4">
             <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-gray-500">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={index}>{day}</div>)}
             </div>
             <div className="grid grid-cols-7 gap-y-1 mt-2">
                {days}
             </div>
        </div>
    )
}

const CalendarCheckbox: React.FC<{ label: string; color: string; isChecked: boolean; onToggle: () => void; }> = ({ label, color, isChecked, onToggle }) => {
    return (
        <label className="flex items-center space-x-3 cursor-pointer">
            <input 
                type="checkbox" 
                checked={isChecked}
                onChange={onToggle}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500"
                style={{ accentColor: color }}
            />
            <span className="text-sm">{label}</span>
        </label>
    );
};

function LeftSidebar() {
  const { openEventModal, isSidebarOpen, toggleSidebar, calendars, calendarFilters, toggleCalendarFilter } = useCalendarStore();

  return (
    <aside className={`absolute inset-y-0 left-0 z-30 w-64 p-4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex justify-between items-center lg:hidden mb-4">
        <span className="text-lg font-bold">Menu</span>
        <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <button onClick={() => openEventModal()} className="flex items-center justify-center w-36 h-12 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
        <PlusIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <span className="ml-2 text-sm font-medium">Create</span>
        <ChevronDownIcon className="ml-2 w-5 h-5 text-gray-500" />
      </button>

      <MiniCalendar />
      
      <div className="mt-8 space-y-4 pr-4">
         <div>
            <input type="text" placeholder="Search for people" className="w-full p-2 text-sm border-none rounded bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"/>
         </div>
         <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">My calendars</h3>
            {calendars.map(cal => (
                <CalendarCheckbox
                    key={cal.id}
                    label={cal.summary}
                    color={cal.backgroundColor}
                    isChecked={!!calendarFilters[cal.id]}
                    onToggle={() => toggleCalendarFilter(cal.id)}
                />
            ))}
         </div>
      </div>
    </aside>
  );
}

export default LeftSidebar;