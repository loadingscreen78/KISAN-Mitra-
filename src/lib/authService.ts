// Authentication Service for KisanMitra App
// Handles user authentication, session management, and logout

import { getAuthApiUrl } from './apiConfig';

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

class AuthService {
  private storagePrefix = 'kisanmitra_';
  private authKey = `${this.storagePrefix}auth_token`;
  private userKey = `${this.storagePrefix}user`;
  private baseURL = getAuthApiUrl(); // Backend API base URL ('' in dev to use /api proxy)

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

  // Login user with backend API
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store auth token and user data
        if (data.session?.access_token) {
          localStorage.setItem(this.authKey, data.session.access_token);
        }
        if (data.user) {
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
        }
        return data;
      } else {
        return {
          success: false,
          message: data.error || 'Login failed',
          error: data.error,
          details: data.details
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'Network error during login',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Register user with backend API
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      console.log('Registration response:', { status: response.status, data });

      if (response.ok && data.success) {
        // Store auth token and user data
        if (data.session?.access_token) {
          localStorage.setItem(this.authKey, data.session.access_token);
        }
        if (data.user) {
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
        }
        return data;
      } else {
        // Log error details for debugging
        console.error('Registration failed:', {
          status: response.status,
          error: data.error,
          details: data.details
        });
        
        return {
          success: false,
          message: data.error || 'Registration failed',
          error: data.error,
          details: data.details
        };
      }
    } catch (error) {
      console.error('Error during registration:', error);
      return {
        success: false,
        message: 'Network error during registration',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(this.authKey);
      
      // Call backend logout if token exists
      if (token) {
        try {
          await fetch(`${this.baseURL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Backend logout error:', error);
          // Continue with local cleanup even if backend call fails
        }
      }
      
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

  // Create phone-based login (for backward compatibility)
  async loginWithPhone(phone: string, pin: string): Promise<AuthResponse> {
    // Convert phone/pin to email/password format for backend
    // Supabase requires passwords to be at least 6 characters, so pad the PIN
    const email = `${phone}@kisanmitra.local`;
    const password = `KM${pin}${phone.slice(-2)}`; // KM + 4-digit PIN + last 2 digits of phone = 8 chars

    // First try normal backend-based login
    const result = await this.login({ email, password });

    if (result.success) {
      return result;
    }

    // Temporary fallback: allow a default demo login without requiring signup
    // NOTE: This is only for local/demo use and should be removed or secured for production.
    // Demo users (phone-based) allowed for local use
    const demoPhones = ['9347750071'];
    const isDemoUser = demoPhones.includes(phone) && pin === '1234';

    if (isDemoUser) {
      const demoUser: AuthUser = {
        id: 'demo-user-9347750071',
        name: 'Demo Farmer',
        phone,
        location: 'Chennai',
        state: 'Tamil Nadu',
        avatar: undefined,
        joinedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        email: `${phone}@kisanmitra.local`,
        user_metadata: {
          name: 'Demo Farmer',
          phone,
          location: 'Chennai',
          state: 'Tamil Nadu',
        },
      };

      // Store demo session locally so the rest of the app treats this as logged in
      localStorage.setItem(this.authKey, 'demo-access-token');
      localStorage.setItem(this.userKey, JSON.stringify(demoUser));

      return {
        success: true,
        message: 'Demo login successful',
        user: demoUser,
        session: {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_at: undefined,
        },
      };
    }

    // If not demo user, return the original backend error
    return result;
  }

  // Create phone-based registration (for backward compatibility)
  async registerWithPhone(phone: string, pin: string, name?: string, location?: string, state?: string): Promise<AuthResponse> {
    // Convert phone/pin to email/password format for backend
    // Supabase requires passwords to be at least 6 characters, so pad the PIN
    const email = `${phone}@kisanmitra.local`;
    const password = `KM${pin}${phone.slice(-2)}`; // KM + 4-digit PIN + last 2 digits of phone = 8 chars
    
    return this.register({
      email,
      password,
      name: name || `Farmer ${phone.slice(-4)}`,
      phone,
      location: location || 'Chennai',
      state: state || 'Tamil Nadu'
    });
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
