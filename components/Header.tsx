
import React from 'react';
import useCalendarStore from '../hooks/useCalendarStore';
import { SparklesIcon } from './icons';

function Header() {
  const { userProfile, logout } = useCalendarStore();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <SparklesIcon className="w-8 h-8 text-blue-500 mr-2" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">AI Calendar Assistant</h1>
      </div>
      <div className="flex items-center space-x-4">
        {userProfile && (
          <div className="flex items-center space-x-2">
            <img src={userProfile.picture} alt={userProfile.name} className="w-8 h-8 rounded-full" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">{userProfile.name}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
