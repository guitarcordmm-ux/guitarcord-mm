import assert from 'node:assert/strict';
import test from 'node:test';
import { configureAndroidThemes } from './configure-android-theme.mjs';

const fixture = `<resources>
<style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
  <item name="colorAccent">@color/brand</item>
  <item name="android:windowBackground">#ffffff</item>
</style>
<style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
  <item name="windowNoTitle">true</item>
</style>
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
  <item name="android:background">@drawable/splash</item>
</style>
<style name="CustomDialog" parent="Theme.AppCompat.Dialog">
  <item name="android:windowBackground">#ffffff</item>
</style>
</resources>`;

test('sets native backgrounds and white icons while preserving custom styles', () => {
  const result = configureAndroidThemes(fixture);
  assert.equal(result.match(/name="android:windowBackground">#000000/g)?.length, 3);
  assert.equal(result.match(/name="android:windowLightStatusBar">false/g)?.length, 3);
  assert.equal(result.match(/name="android:windowLightNavigationBar">false/g)?.length, 3);
  assert.ok(result.includes('<item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>'));
  assert.ok(result.includes('<item name="windowSplashScreenBackground">#000000</item>'));
  assert.ok(result.includes('<item name="colorAccent">@color/brand</item>'));
  assert.ok(result.includes('<item name="android:background">@drawable/splash</item>'));
  assert.ok(result.includes('<style name="CustomDialog" parent="Theme.AppCompat.Dialog">\n  <item name="android:windowBackground">#ffffff</item>'));
});

test('repeated Capacitor sync does not duplicate theme items', () => {
  const once = configureAndroidThemes(fixture);
  assert.equal(configureAndroidThemes(once), once);
});

test('fails when the generated Android template changes instead of silently shipping a light theme', () => {
  assert.throws(() => configureAndroidThemes('<resources></resources>'), /Missing Android theme/);
});
