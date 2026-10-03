import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuitarCordProfile as ProfileContent } from '../components/GuitarCordUI';
import type { User } from '../../../types';
import { isUserAdmin } from '../../../services/auth/authService';

export function GuitarCordProfile({ user }: { user?: User | null }) {
  const navigate = useNavigate();

  useEffect(() => {
    const settingsButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent?.trim() === 'Settings'
    );

    if (settingsButton) {
      const handleSettingsClick = () => navigate('/settings');
      settingsButton.addEventListener('click', handleSettingsClick);
      return () => settingsButton.removeEventListener('click', handleSettingsClick);
    }

    return undefined;
  }, [navigate]);

  useEffect(() => {
    if (!isUserAdmin(user as any)) return;

    const settingsButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent?.trim() === 'Settings'
    );
    if (!settingsButton || settingsButton.parentElement?.querySelector('[data-admin-profile-item="true"]')) return;

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
    settingsButton.parentElement?.insertBefore(adminButton, settingsButton.nextSibling);

    return () => {
      adminButton.remove();
    };
  }, [navigate, user]);

  return <ProfileContent user={user} />;
}

export default GuitarCordProfile;
