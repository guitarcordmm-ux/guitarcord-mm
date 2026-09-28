import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './app/App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { initCapacitorMobile } from './lib/capacitor';

// Register service worker for offline support.
registerSW({ immediate: true });

// Initialize native mobile features (StatusBar, Android back button).
initCapacitorMobile();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
