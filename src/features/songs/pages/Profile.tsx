import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuitarCordProfile as ProfileContent } from '../components/GuitarCordUI';
import type { User } from '../../../types';
import { isUserAdmin } from '../../../services/auth/authService';

export function GuitarCordProfile({ user }: { user?: User | null }) {
  const navigate = useNavigate();

  useEffect(() => {
    const findButton = (label: string) =>
      Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.trim() === label
      );

    const setupProfileActions = () => {
      const settingsButton = findButton('Settings');
      if (settingsButton && !settingsButton.dataset.profileSettingsBound) {
        const handleSettingsClick = () => navigate('/settings');
        settingsButton.addEventListener('click', handleSettingsClick);
        settingsButton.dataset.profileSettingsBound = 'true';
        (settingsButton as HTMLButtonElement & { __guitarCordSettingsHandler?: EventListener }).__guitarCordSettingsHandler = handleSettingsClick;
      }

      if (!isUserAdmin(user ?? null)) return;

      const adminButtonExists = document.querySelector('[data-admin-profile-item="true"]');
      if (adminButtonExists) return;

      const settings = findButton('Settings');
      if (!settings?.parentElement) return;

      const adminButton = document.createElement('button');
      adminButton.type = 'button';
      adminButton.dataset.adminProfileItem = 'true';
      adminButton.className = 'w-full flex items-center gap-3 py-4 border-b border-white/10 text-sm';
      adminButton.innerHTML = `
        <span class="text-[#FFD600] text-lg leading-none">🛡</span>
        <span class="flex-1 text-left">
          <span class="block font-semibold text-[#FFD600]">Admin Dashboard</span>
          <span class="block text-[10px] text-white/35 mt-0.5">Manage songs, approvals and submissions</span>
        </span>
        <span class="text-[#FFD600]/50">›</span>
      `;
      adminButton.addEventListener('click', () => navigate('/admin-panel'));
      settings.parentElement.insertBefore(adminButton, settings.nextSibling);
    };

    const observer = new MutationObserver(setupProfileActions);
    observer.observe(document.body, { childList: true, subtree: true });
    const frame = window.requestAnimationFrame(setupProfileActions);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      const adminButton = document.querySelector('[data-admin-profile-item="true"]');
      adminButton?.remove();

      const settingsButton = findButton('Settings') as (HTMLButtonElement & { __guitarCordSettingsHandler?: EventListener }) | undefined;
      if (settingsButton?.__guitarCordSettingsHandler) {
        settingsButton.removeEventListener('click', settingsButton.__guitarCordSettingsHandler);
        delete settingsButton.__guitarCordSettingsHandler;
        delete settingsButton.dataset.profileSettingsBound;
      }
    };
  }, [navigate, user]);

  return <ProfileContent user={user} />;
}

export default GuitarCordProfile;
