// Authentication Service for KisanMitra App
// Mock authentication: every login and sign-up succeeds and the session lives
// only in this browser. Nothing is sent to a server, so do not treat a
// "logged in" user as verified.

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  location: string;
  state: string;
  avatar?: string;
  joinedDate: string;
  createdAt: string;
  created_at?: string;
  email?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    location?: string;
    state?: string;
    avatar?: string;
    [key: string]: any;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  location: string;
  state: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  };
  error?: string;
  details?: string;
}

type MockProfile = Pick<AuthUser, 'name' | 'phone' | 'location' | 'state'>;

class AuthService {
  private storagePrefix = 'kisanmitra_';
  private authKey = `${this.storagePrefix}auth_token`;
  private userKey = `${this.storagePrefix}user`;
  // Profiles from sign-up, kept so a later login with the same phone shows the same name
  private accountsKey = `${this.storagePrefix}mock_accounts`;

  // Check if user is authenticated
  isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem(this.authKey);
      const user = localStorage.getItem(this.userKey);
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get current authenticated user with backward compatibility
  getCurrentUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.userKey);
      if (!userData) return null;

      const user = JSON.parse(userData);

      // Migrate old user data format to new format
      if (user && !user.name && user.user_metadata?.name) {
        user.name = user.user_metadata.name;
      }
      if (user && !user.phone && user.user_metadata?.phone) {
        user.phone = user.user_metadata.phone;
      }
      if (user && !user.location && user.user_metadata?.location) {
        user.location = user.user_metadata.location;
      }
      if (user && !user.state && user.user_metadata?.state) {
        user.state = user.user_metadata.state;
      }

      // Ensure required fields exist with fallbacks
      if (user) {
        user.name = user.name || user.user_metadata?.name || 'Farmer';
        user.phone = user.phone || user.user_metadata?.phone || 'N/A';
        user.location = user.location || user.user_metadata?.location || 'India';
        user.state = user.state || user.user_metadata?.state || 'India';
        user.joinedDate = user.joinedDate || user.created_at || new Date().toISOString();
        user.createdAt = user.createdAt || user.created_at || new Date().toISOString();

        // Save migrated data back to storage
        this.updateUser(user);
      }

      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Start a local session for this profile. Always succeeds.
  private startSession(profile: MockProfile, message: string): AuthResponse {
    const now = new Date().toISOString();
    const user: AuthUser = {
      id: `local-${profile.phone}`,
      ...profile,
      joinedDate: now,
      createdAt: now,
      user_metadata: { ...profile },
    };
    const token = `mock-token-${Date.now()}`;

    localStorage.setItem(this.authKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));

    return {
      success: true,
      message,
      user,
      session: { access_token: token, refresh_token: token },
    };
  }

  private getSavedAccounts(): Record<string, MockProfile> {
    try {
      return JSON.parse(localStorage.getItem(this.accountsKey) || '{}');
    } catch {
      return {};
    }
  }

  // Login: any email and password are accepted
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const phone = credentials.email?.split('@')[0] || 'guest';
    return this.loginWithPhone(phone, credentials.password);
  }

  // Register: any details are accepted
  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.registerWithPhone(userData.phone, userData.password, userData.name, userData.location, userData.state);
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear authentication data
      localStorage.removeItem(this.authKey);
      localStorage.removeItem(this.userKey);

      // Clear any voice-related data
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Clear any ongoing audio
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Update user data
  updateUser(user: AuthUser): void {
    try {
      if (this.isAuthenticated()) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  // Get safe navigation path based on authentication
  getSafeNavigationPath(): string {
    return this.isAuthenticated() ? '/' : '/login';
  }

  // Get auth token for API requests
  getAuthToken(): string | null {
    return localStorage.getItem(this.authKey);
  }

  // Phone login: any phone number and PIN are accepted
  async loginWithPhone(phone: string, _pin: string): Promise<AuthResponse> {
    const cleanPhone = phone.trim() || 'guest';
    const saved = this.getSavedAccounts()[cleanPhone];
    const profile: MockProfile = saved || {
      name: `Farmer ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      location: 'India',
      state: 'India',
    };
    return this.startSession(profile, 'Login successful');
  }

  // Phone sign-up: any details are accepted
  async registerWithPhone(phone: string, _pin: string, name?: string, location?: string, state?: string): Promise<AuthResponse> {
    const cleanPhone = phone.trim() || 'guest';
    const profile: MockProfile = {
      name: name?.trim() || `Farmer ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      location: location?.trim() || 'India',
      state: state?.trim() || 'India',
    };

    const accounts = this.getSavedAccounts();
    accounts[cleanPhone] = profile;
    localStorage.setItem(this.accountsKey, JSON.stringify(accounts));

    return this.startSession(profile, 'Registration successful');
  }

  // Clear all user data (for complete logout)
  clearAllUserData(): void {
    try {
      const user = this.getCurrentUser();
      if (user) {
        // Clear user-specific data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.storagePrefix)) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
