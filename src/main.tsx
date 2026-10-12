import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './app/App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { initCapacitorMobile } from './lib/capacitor';
import { Capacitor } from '@capacitor/core';

// Native apps already bundle assets. An old service worker can otherwise serve
// a previous APK's JavaScript (including its obsolete API endpoint).
if (Capacitor.isNativePlatform()) {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then(async registrations => {
      const removed = await Promise.all(registrations.map(registration => registration.unregister()));
      if (removed.some(Boolean) && navigator.serviceWorker.controller) window.location.reload();
    }).catch(error => console.warn('Could not clear native service workers:', error));
  }
} else {
  registerSW({ immediate: true });
}

// Initialize native mobile features (StatusBar, Android back button).
initCapacitorMobile();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
