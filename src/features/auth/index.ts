export { LoginPage } from './pages/LoginPage';
export { UserDashboard } from './pages/UserDashboard';
export type { UnifiedUser } from '../../services/auth/authService';
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
} from '../../services/auth/authService';
