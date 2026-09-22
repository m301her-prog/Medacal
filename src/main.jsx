import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {App as CapacitorApp} from '@capacitor/app';
import App from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

// Android back button: navigate through the SPA history first, then exit only
// when the user is already at the home route. This listener is ignored on web.
CapacitorApp.addListener('backButton', ({canGoBack}) => {
  const onHome = window.location.pathname === '/' || window.location.pathname === '';
  if (canGoBack && !onHome && window.history.length > 1) {
    window.history.back();
  } else if (onHome) {
    CapacitorApp.exitApp();
  }
}).catch(() => {});

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
