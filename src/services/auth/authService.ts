export {
  ADMIN_EMAIL,
  ADMIN_USERNAME,
  isUserAdmin,
  getCurrentUser,
  subscribeToAuthChanges,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogleOAuth,
  signOutUser,
} from '../../lib/supabaseAuth';

export type { UnifiedUser } from '../../lib/supabase';
