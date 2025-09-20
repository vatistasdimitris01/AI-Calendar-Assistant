
import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import useCalendarStore from './hooks/useCalendarStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const GOOGLE_CLIENT_ID = '883268379470-v87o8947f9gjcqflkj86euk62fsjf5eb.apps.googleusercontent.com';

function App() {
  const { accessToken, checkTokenExpiry } = useCalendarStore();

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  // FIX: Removed redundant check for placeholder GOOGLE_CLIENT_ID.
  // The original check caused a TypeScript error because it compared two incompatible string literals.
  // Since a valid client ID is provided, the check is unnecessary.

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen text-gray-800 dark:text-gray-200">
        {accessToken ? <Dashboard /> : <Login />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
