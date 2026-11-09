// Mock Google sign-in. Authentication is disabled for now, so the Google
// button signs in a demo user straight away, with no popup and no Firebase.
import { AuthUser } from './authService';

const startLocalSession = (user: AuthUser, token: string): AuthUser => {
  localStorage.setItem('kisanmitra_user', JSON.stringify(user));
  localStorage.setItem('kisanmitra_auth_token', token);
  return user;
};

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  const now = new Date().toISOString();
  const user = startLocalSession({
    id: `google-${Date.now()}`,
    name: 'Farmer (Google Account)',
    phone: 'N/A',
    location: 'India',
    state: 'India',
    joinedDate: now,
    createdAt: now,
    user_metadata: {
      name: 'Farmer (Google Account)',
    }
  }, 'mock-google-token');

  return { success: true, user };
};

export const continueAsGuest = (): AuthUser => {
  const now = new Date().toISOString();
  return startLocalSession({
    id: `guest-${Date.now()}`,
    name: 'Guest Farmer',
    phone: 'N/A',
    location: 'India',
    state: 'India',
    joinedDate: now,
    createdAt: now,
    user_metadata: {
      name: 'Guest Farmer',
    }
  }, 'guest-token');
};

export const signOutFirebase = async (): Promise<void> => {
  localStorage.removeItem('kisanmitra_user');
  localStorage.removeItem('kisanmitra_auth_token');
};
