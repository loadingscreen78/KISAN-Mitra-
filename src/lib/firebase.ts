import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { AuthUser } from './authService';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey.length > 5 && 
    !firebaseConfig.apiKey.includes('your_') &&
    firebaseConfig.authDomain && 
    !firebaseConfig.authDomain.includes('your_')
  );
};

// Initialize Firebase safely
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export { auth, googleProvider };

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  // If Firebase is configured with real credentials, trigger Google OAuth popup
  if (isFirebaseConfigured() && auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const token = await fbUser.getIdToken();

      const authUser: AuthUser = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google Farmer',
        phone: fbUser.phoneNumber || 'N/A',
        location: 'India',
        state: 'India',
        avatar: fbUser.photoURL || undefined,
        joinedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        email: fbUser.email || undefined,
        user_metadata: {
          name: fbUser.displayName || 'Google Farmer',
          email: fbUser.email || undefined,
          avatar: fbUser.photoURL || undefined,
        }
      };

      // Store in localStorage for seamless compatibility across the app
      localStorage.setItem('kisanmitra_user', JSON.stringify(authUser));
      localStorage.setItem('kisanmitra_auth_token', token);

      return { success: true, user: authUser };
    } catch (error: any) {
      console.error('Firebase Google Sign-In Error:', error);
      return { 
        success: false, 
        error: error.message || 'Google sign-in failed. Please check popup permissions.' 
      };
    }
  }

  // Graceful Local/Dev Fallback when Firebase API keys are pending
  // Allows testing the complete Google Auth experience immediately
  console.info('Using quick Google sign-in demo mode (configure VITE_FIREBASE_API_KEY in .env for production OAuth)');
  
  const demoGoogleUser: AuthUser = {
    id: `google-${Date.now()}`,
    name: 'Farmer (Google Account)',
    phone: 'N/A',
    location: 'Punjab',
    state: 'India',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80',
    joinedDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    email: 'kisan.farmer@gmail.com',
    user_metadata: {
      name: 'Farmer (Google Account)',
      email: 'kisan.farmer@gmail.com',
    }
  };

  localStorage.setItem('kisanmitra_user', JSON.stringify(demoGoogleUser));
  localStorage.setItem('kisanmitra_auth_token', 'demo-google-token');

  return { success: true, user: demoGoogleUser };
};

export const continueAsGuest = (): AuthUser => {
  const guestUser: AuthUser = {
    id: `guest-${Date.now()}`,
    name: 'Guest Farmer',
    phone: 'N/A',
    location: 'India',
    state: 'India',
    joinedDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    user_metadata: {
      name: 'Guest Farmer',
    }
  };

  localStorage.setItem('kisanmitra_user', JSON.stringify(guestUser));
  localStorage.setItem('kisanmitra_auth_token', 'guest-token');
  return guestUser;
};

export const signOutFirebase = async (): Promise<void> => {
  try {
    if (auth) {
      await firebaseSignOut(auth);
    }
  } catch (error) {
    console.error('Firebase signout error:', error);
  } finally {
    localStorage.removeItem('kisanmitra_user');
    localStorage.removeItem('kisanmitra_auth_token');
  }
};
