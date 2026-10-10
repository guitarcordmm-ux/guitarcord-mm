import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Initialize Capacitor native features for iOS and Android
 */
export async function initCapacitorMobile(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Keep the operating system status bar visible above the app.
    // DARK means light-colored status icons/text, suitable for a black status bar.
    await StatusBar.show();
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#000000' });
  } catch (err) {
    console.warn('Status bar configuration error:', err);
  }

  try {
    // Handle Android hardware back button
    await CapApp.addListener('backButton', ({ canGoBack }) => {
      // Check if any modal or overlay is open, or navigate back in browser history
      if (window.history.length > 1 && canGoBack) {
        window.history.back();
      } else {
        // Exit app if at the root page
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.warn('Back button listener setup error:', err);
  }
}
