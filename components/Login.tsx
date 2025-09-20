
import React from 'react';
import useCalendarStore from '../hooks/useCalendarStore';
import { GoogleIcon, SparklesIcon } from './icons';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Login() {
  const handleLogin = () => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Determine the redirect URI and log it for easier debugging by the user.
    const redirectUri = window.location.origin;
    console.log(
        'Attempting to login with Google. Ensure this redirect URI is in your Google Cloud Console authorized list:', 
        redirectUri
    );

    const options = {
      redirect_uri: redirectUri,
      client_id: GOOGLE_CLIENT_ID,
      access_type: 'online',
      response_type: 'token',
      prompt: 'consent',
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
    };

    const qs = new URLSearchParams(options).toString();
    window.location.assign(`${rootUrl}?${qs}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900">
      <div className="text-center p-8 max-w-lg">
        <SparklesIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
          AI Calendar Assistant
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your personal scheduling genius. Let Gemini AI organize your life, one event at a time.
        </p>
        <button
          onClick={handleLogin}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          Sign in with Google
        </button>
      </div>
      <footer className="absolute bottom-4 text-gray-500 dark:text-gray-400 text-sm">
        Built with React, Gemini, and Tailwind CSS
      </footer>
    </div>
  );
}

export default Login;
