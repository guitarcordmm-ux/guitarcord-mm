import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

/**
 * Initialize Capacitor native features for iOS and Android
 */
export async function initCapacitorMobile(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Edge-to-edge bars use the app/native theme background on Android 15+.
    await SystemBars.setStyle({ style: SystemBarsStyle.Dark });
    await SystemBars.show();
  } catch (err) {
    console.warn('Status bar configuration error:', err);
  }

  if (Capacitor.getPlatform() !== 'android') return;

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
