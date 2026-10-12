# Android App Build (GuitarCordMM)

This project uses Capacitor to package the existing React web app as an Android app. The Android package ID is `com.guitarcordmm.app`.

## Build an installable APK with GitHub Actions

1. In GitHub, open **Settings → Secrets and variables → Actions**.
2. Add these repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_USERNAME` (optional)
   - `VITE_ADMIN_EMAIL` (optional)
3. Open **Actions → Build Android APK → Run workflow** on the `main` branch.
4. When the run succeeds, open that run and download the `guitarcordmm-debug-apk` artifact.
5. Extract the ZIP and install `app-debug.apk` on an Android device. Android may ask you to allow installation from that source.

The APK uses the bundled web UI and connects to the production API at `https://guitarcord-mm.pages.dev`. Internet access is required for current songs and Supabase-backed features. `VITE_API_BASE_URL` can override this endpoint at build time; changing it requires rebuilding and installing a new APK.

Every `cap sync android` runs `scripts/configure-android-theme.mjs` to give the generated Android launch and app themes a black window background. This is required for edge-to-edge system bars, where the old StatusBar background-color option does not apply. Capacitor SystemBars controls the light icons and safe-area insets.

## Build locally on Windows

Install Node.js 22 or newer and Android Studio with an Android SDK. Then open PowerShell in the repository folder:

```powershell
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio, wait for Gradle sync to finish, then select **Build → Build Bundle(s) / APK(s) → Build APK(s)**. Android Studio will show the output path when the build completes.

If the `android` directory already exists, skip `npx cap add android` and run `npm run build`, `npx cap sync android`, then open Android Studio.

## Before publishing on Google Play

The workflow creates a **debug APK for testing**, not a signed production release. Before publishing, configure the production app icon/splash screen, confirm Google OAuth and password-reset deep links for the native app, test authentication/data/export on real devices, and generate a signed Android App Bundle (AAB) with a release keystore.
