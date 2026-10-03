import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuitarCordProfile as ProfileContent } from '../components/GuitarCordUI';
import type { User } from '../../../types';

export function GuitarCordProfile({ user }: { user?: User | null }) {
  const navigate = useNavigate();

  useEffect(() => {
    const settingsButton = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent?.trim() === 'Settings'
    );

    if (!settingsButton) return;

    const handleSettingsClick = () => navigate('/settings');
    settingsButton.addEventListener('click', handleSettingsClick);
    return () => settingsButton.removeEventListener('click', handleSettingsClick);
  }, [navigate]);

  return <ProfileContent user={user} />;
}

export default GuitarCordProfile;
