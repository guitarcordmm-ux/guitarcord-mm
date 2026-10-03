import { GuitarCordProfile as ProfileContent } from '../components/GuitarCordUI';
import type { User } from '../../../types';

export function GuitarCordProfile({ user }: { user?: User | null }) {
  return <ProfileContent user={user} />;
}

export default GuitarCordProfile;
