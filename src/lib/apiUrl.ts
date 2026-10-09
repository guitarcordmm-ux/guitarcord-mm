import { Capacitor } from '@capacitor/core';

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const apiBase = configuredApiBase || (Capacitor.isNativePlatform() ? 'https://guitarcordmm.com' : '');

/**
 * Return an API URL that works in both the browser and the packaged Capacitor app.
 * In the native app, relative /api paths must target the live Cloudflare Pages site,
 * not the app's local WebView origin.
 */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`;
}
