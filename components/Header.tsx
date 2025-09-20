
import React, { useState, useRef, useEffect } from 'react';
// FIX: Changed date-fns imports to use named imports to fix call signature errors.
import { format } from 'date-fns/format';
import { addMonths } from 'date-fns/addMonths';
import { subMonths } from 'date-fns/subMonths';
import useCalendarStore from '../hooks/useCalendarStore';
import { MenuIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, HelpCircleIcon, SettingsIcon, ChevronDownIcon } from './icons';
import type { View } from 'react-big-calendar';

function Header() {
  const { userProfile, logout, currentDate, setCurrentDate, toggleSidebar, view, setView } = useCalendarStore();
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const handleOutsideClick = (event: MouseEvent) => {
    if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setIsViewDropdownOpen(false);
    }
    if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handlePrev = () => {
    const newDate = view === 'day' ? new Date(currentDate.setDate(currentDate.getDate() - 1))
                  : view === 'week' ? new Date(currentDate.setDate(currentDate.getDate() - 7))
                  : subMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = view === 'day' ? new Date(currentDate.setDate(currentDate.getDate() + 1))
                  : view === 'week' ? new Date(currentDate.setDate(currentDate.getDate() + 7))
                  : addMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleSetView = (newView: View) => {
    setView(newView);
    setIsViewDropdownOpen(false);
  };

  const viewLabels: { [key in View]: string } = {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda'
  }

  return (
    <header className="flex items-center justify-between p-2 pl-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </button>
        <CalendarIcon />
        <h1 className="text-xl text-gray-600 dark:text-gray-300 hidden md:block">Calendar</h1>
      </div>

      <div className="flex items-center space-x-2">
         <button onClick={handleToday} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600">
          Today
        </button>
        <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Previous">
            <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </button>
        <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Next">
            <ChevronRightIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </button>
        <h2 className="text-xl w-48 text-left text-gray-600 dark:text-gray-300">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center space-x-2">
         <button onClick={() => alert('Search feature not implemented.')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:inline-flex" aria-label="Search">
            <SearchIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </button>
         <button onClick={() => alert('Help feature not implemented.')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:inline-flex" aria-label="Help">
            <HelpCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </button>
         <button onClick={() => alert('Settings feature not implemented.')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:inline-flex" aria-label="Settings">
            <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </button>
        <div className="relative" ref={viewDropdownRef}>
            <button onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)} className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600 flex items-center capitalize">
                {viewLabels[view]} <ChevronDownIcon className="w-5 h-5 ml-1"/>
            </button>
            {isViewDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                    <button onClick={() => handleSetView('day')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Day</button>
                    <button onClick={() => handleSetView('week')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Week</button>
                    <button onClick={() => handleSetView('month')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Month</button>
                </div>
            )}
        </div>
        <div className="relative" ref={profileDropdownRef}>
            {userProfile && (
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} title={userProfile.name}>
                    <img src={userProfile.picture} alt={userProfile.name} className="w-8 h-8 rounded-full" />
                </button>
            )}
            {isProfileDropdownOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                    <div className="p-2 border-b dark:border-gray-700">
                        <p className="text-sm font-medium truncate">{userProfile?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                    </div>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                      Logout
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}

export default Header;