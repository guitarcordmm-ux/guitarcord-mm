import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Capacitor generates these themes on CI. Preserve unrelated/custom items,
// and fail loudly if a future template changes the expected theme names.
export function configureAndroidThemes(xml) {
  const common = {
    'android:windowBackground': '#000000',
    'android:statusBarColor': '#000000',
    'android:navigationBarColor': '#000000',
    'android:windowLightStatusBar': 'false',
    'android:windowLightNavigationBar': 'false',
  };
  const themes = {
    AppTheme: common,
    'AppTheme.NoActionBar': common,
    'AppTheme.NoActionBarLaunch': {
      ...common,
      windowSplashScreenBackground: '#000000',
      postSplashScreenTheme: '@style/AppTheme.NoActionBar',
    },
  };

  for (const [name, items] of Object.entries(themes)) {
    const escapedName = name.replaceAll('.', '\\.');
    const pattern = new RegExp(`(<style\\b[^>]*\\bname="${escapedName}"[^>]*>)([\\s\\S]*?)(</style>)`);
    if (!pattern.test(xml)) throw new Error(`Missing Android theme: ${name}`);
    xml = xml.replace(pattern, (_, opening, body, closing) => {
      for (const [key, value] of Object.entries(items)) {
        const item = `<item name="${key}">${value}</item>`;
        const existing = new RegExp(`<item\\b[^>]*\\bname="${key}"[^>]*>[\\s\\S]*?</item>`);
        body = existing.test(body)
          ? body.replace(existing, item)
          : `${body.trimEnd()}\n        ${item}\n    `;
      }
      return opening + body + closing;
    });
  }
  return xml;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (!process.env.CAPACITOR_PLATFORM_NAME || process.env.CAPACITOR_PLATFORM_NAME === 'android') {
    const root = process.env.CAPACITOR_ROOT_DIR || process.cwd();
    const config = JSON.parse(process.env.CAPACITOR_CONFIG || '{}');
    const file = path.resolve(root, config.android?.path || 'android', 'app/src/main/res/values/styles.xml');
    const original = await readFile(file, 'utf8');
    const updated = configureAndroidThemes(original);
    if (updated !== original) await writeFile(file, updated);
    console.log('Android window, launch and system-bar themes configured for a black background.');
  }
}
