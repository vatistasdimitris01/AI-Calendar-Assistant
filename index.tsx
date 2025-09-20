
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This app requires several dependencies to be installed:
// npm install react react-dom @react-oauth/google @google/genai zustand react-big-calendar date-fns lucide-react

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
