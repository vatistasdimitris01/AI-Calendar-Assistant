
import React, { useEffect } from 'react';
import { GoogleOAuthProvider, hasGrantedAllScopesGoogle } from '@react-oauth/google';
import useCalendarStore from './hooks/useCalendarStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import type { UserProfile } from './types';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { accessToken, checkTokenExpiry, setLoginData } = useCalendarStore();

  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  useEffect(() => {
    // This effect handles the redirect from Google's OAuth flow.
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      const expiresInStr = params.get('expires_in');
      
      if (token && expiresInStr) {
        const expiresIn = parseInt(expiresInStr, 10);
        const grantedScopes = params.get('scope') || '';
        
        // FIX: A spread argument must either have a tuple type or be passed to a rest parameter.
        // To fix this, `requestedScopes` is defined as a const array, which TypeScript infers as a tuple-like type.
        const requestedScopes = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/calendar.events'] as const;

        // FIX: The `TokenResponse` type from `@react-oauth/google` requires `token_type` and `prompt` properties.
        const tokenResponse = {
            access_token: token,
            scope: grantedScopes,
            expires_in: expiresIn,
            token_type: 'Bearer',
            prompt: '',
        };
        const hasGrantedAll = hasGrantedAllScopesGoogle(tokenResponse, ...requestedScopes);

        if (hasGrantedAll) {
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(res => res.json())
          .then((profile: UserProfile) => {
            setLoginData(token, expiresIn, profile);
            // Clean the URL by removing the hash
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          })
          .catch(err => console.error("Failed to fetch user profile after redirect", err));
        } else {
          console.error("Login failed: Not all requested scopes were granted.");
          // Optionally, show an error to the user.
        }
      }
    }
  }, [setLoginData]);
  
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
