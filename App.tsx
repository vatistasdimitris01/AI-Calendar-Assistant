
import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import useCalendarStore from './hooks/useCalendarStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { accessToken, checkTokenExpiry } = useCalendarStore();

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);
  
  if (!GOOGLE_CLIENT_ID) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-2">Configuration Error</h1>
                <p>The Google Client ID is missing.</p>
                <p className="mt-4 text-sm">Please create a <code>.env.local</code> file and add your Google Client ID as <br/><code>VITE_GOOGLE_CLIENT_ID=your_client_id_here</code></p>
                <p className="mt-2 text-sm">For Vercel deployment, add this as an environment variable in your project settings.</p>
            </div>
        </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen text-gray-800 dark:text-gray-200">
        {accessToken ? <Dashboard /> : <Login />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
