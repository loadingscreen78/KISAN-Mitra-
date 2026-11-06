// Real Database Service for KisanMitra App
// This provides real data persistence and user-specific statistics

export interface User {
  id: string;
  name: string;
  phone: string;
  location: string;
  state: string;
  avatar?: string;
  joinedDate: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  crop: string;
  quantity: string;
  pricePerKg: number;
  market: string;
  transport: string;
  views: number;
  inquiries: number;
  totalPrice: number;
  status: 'active' | 'sold' | 'expired';
  postedDate: string;
  createdAt: string;
  soldDate?: string;
  soldPrice?: number;
  buyer?: string;
}

export interface DiagnosisRecord {
  id: string;
  userId: string;
  cropName: string;
  diagnosis: string;
  confidence: number;
  treatment: string;
  date: string;
  createdAt: string;
  status?: 'active' | 'completed' | 'discontinued';
  treatmentStartDate?: string;
  treatmentEndDate?: string;
}

export interface AdvisoryRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  savedDate: string;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  data: any;
  timestamp: string;
}

export interface UserStats {
  totalEarnings: number;
  activeListings: number;
  successfulSales: number;
  totalViews: number;
  avgRating: number;
  diagnosisCount: number;
  activeTreatments: number;
  advisorySaved: number;
  level: string;
  joinedDate: string;
}

class DataService {
  private storagePrefix = 'kisanmitra_';

  // User Management
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(`${this.storagePrefix}user`);
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      
      // Migrate old user data format and ensure required fields
      if (user) {
        // Extract from user_metadata if main fields are missing
        if (!user.name && user.user_metadata?.name) {
          user.name = user.user_metadata.name;
        }
        if (!user.phone && user.user_metadata?.phone) {
          user.phone = user.user_metadata.phone;
        }
        if (!user.location && user.user_metadata?.location) {
          user.location = user.user_metadata.location;
        }
        if (!user.state && user.user_metadata?.state) {
          user.state = user.user_metadata.state;
        }
        
        // Ensure required fields with fallbacks
        user.name = user.name || 'Farmer';
        user.phone = user.phone || 'N/A';
        user.location = user.location || 'India';
        user.state = user.state || 'India';
        user.joinedDate = user.joinedDate || user.created_at || new Date().toISOString();
        user.createdAt = user.createdAt || user.created_at || new Date().toISOString();
        user.id = user.id || Date.now().toString();
        
        // Save migrated data
        this.saveUser(user);
      }
      
      return user;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  saveUser(user: User): void {
    try {
      localStorage.setItem(`${this.storagePrefix}user`, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Listings Management
  getUserListings(userId: string): Listing[] {
    try {
      const listingsKey = `${this.storagePrefix}listings_${userId}`;
      const stored = localStorage.getItem(listingsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading listings:', error);
      return [];
    }
  }

  saveUserListings(userId: string, listings: Listing[]): void {
    try {
      const listingsKey = `${this.storagePrefix}listings_${userId}`;
      localStorage.setItem(listingsKey, JSON.stringify(listings));
      
      // Also save to global listings for search functionality
      this.updateGlobalListings();
    } catch (error) {
      console.error('Error saving listings:', error);
    }
  }

  addListing(listing: Listing): void {
    try {
      const currentListings = this.getUserListings(listing.userId);
      currentListings.push(listing);
      this.saveUserListings(listing.userId, currentListings);
      
      // Track activity
      this.trackUserActivity(listing.userId, 'listing_created', listing);
    } catch (error) {
      console.error('Error adding listing:', error);
    }
  }

  markListingAsSold(userId: string, listingId: string, soldPrice: number, buyer: string): void {
    try {
      const listings = this.getUserListings(userId);
      const listing = listings.find(l => l.id === listingId);
      
      if (listing) {
        listing.status = 'sold';
        listing.soldDate = new Date().toISOString();
        listing.soldPrice = soldPrice;
        listing.buyer = buyer;
        
        this.saveUserListings(userId, listings);
        this.trackUserActivity(userId, 'listing_sold', { listingId, soldPrice, buyer });
      }
    } catch (error) {
      console.error('Error marking listing as sold:', error);
    }
  }

  // Diagnosis Management
  getUserDiagnoses(userId: string): DiagnosisRecord[] {
    try {
      const diagnosesKey = `${this.storagePrefix}diagnoses_${userId}`;
      const stored = localStorage.getItem(diagnosesKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading diagnoses:', error);
      return [];
    }
  }

  addDiagnosis(diagnosis: DiagnosisRecord): void {
    try {
      const currentDiagnoses = this.getUserDiagnoses(diagnosis.userId);
      currentDiagnoses.push(diagnosis);
      
      const diagnosesKey = `${this.storagePrefix}diagnoses_${diagnosis.userId}`;
      localStorage.setItem(diagnosesKey, JSON.stringify(currentDiagnoses));
      
      this.trackUserActivity(diagnosis.userId, 'diagnosis_created', diagnosis);
    } catch (error) {
      console.error('Error adding diagnosis:', error);
    }
  }

  // Advisory Management
  getUserAdvisories(userId: string): AdvisoryRecord[] {
    try {
      const advisoriesKey = `${this.storagePrefix}advisories_${userId}`;
      const stored = localStorage.getItem(advisoriesKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading advisories:', error);
      return [];
    }
  }

  saveAdvisory(advisory: AdvisoryRecord): void {
    try {
      const currentAdvisories = this.getUserAdvisories(advisory.userId);
      currentAdvisories.push(advisory);
      
      const advisoriesKey = `${this.storagePrefix}advisories_${advisory.userId}`;
      localStorage.setItem(advisoriesKey, JSON.stringify(currentAdvisories));
      
      this.trackUserActivity(advisory.userId, 'advisory_saved', advisory);
    } catch (error) {
      console.error('Error saving advisory:', error);
    }
  }

  // Activity Tracking
  trackUserActivity(userId: string, action: string, data: any): void {
    try {
      const activity: UserActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        data,
        timestamp: new Date().toISOString()
      };

      const activitiesKey = `${this.storagePrefix}activities_${userId}`;
      const currentActivities = JSON.parse(localStorage.getItem(activitiesKey) || '[]');
      currentActivities.push(activity);
      
      // Keep only last 100 activities to prevent storage bloat
      if (currentActivities.length > 100) {
        currentActivities.splice(0, currentActivities.length - 100);
      }
      
      localStorage.setItem(activitiesKey, JSON.stringify(currentActivities));
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Real Statistics Calculation
  calculateUserStats(userId: string): UserStats {
    try {
      const listings = this.getUserListings(userId);
      const diagnoses = this.getUserDiagnoses(userId);
      const advisories = this.getUserAdvisories(userId);
      const user = this.getCurrentUser();

      const activeListings = listings.filter(l => l.status === 'active');
      const soldListings = listings.filter(l => l.status === 'sold');
      
      const totalEarnings = soldListings.reduce((sum, listing) => sum + (listing.soldPrice || 0), 0);
      const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
      const successfulSales = soldListings.length;

      // Calculate active treatments (diagnoses that are still being treated)
      const activeTreatments = diagnoses.filter(d => {
        if (d.status === 'active') return true;
        if (!d.status) {
          // If no status is set, consider treatments from last 30 days as potentially active
          const diagnosisDate = new Date(d.createdAt || d.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return diagnosisDate > thirtyDaysAgo;
        }
        return false;
      }).length;

      // Calculate level based on activity
      let level = 'New Farmer';
      if (successfulSales >= 50 && totalEarnings >= 100000) {
        level = 'Expert Farmer';
      } else if (successfulSales >= 20 && totalEarnings >= 50000) {
        level = 'Advanced Farmer';
      } else if (successfulSales >= 5 && totalEarnings >= 10000) {
        level = 'Experienced Farmer';
      } else if (successfulSales >= 1) {
        level = 'Active Farmer';
      }

      // Calculate average rating (simulate based on successful sales)
      let avgRating = 4.0;
      if (successfulSales > 10) avgRating = 4.8;
      else if (successfulSales > 5) avgRating = 4.5;
      else if (successfulSales > 0) avgRating = 4.2;

      return {
        totalEarnings,
        activeListings: activeListings.length,
        successfulSales,
        totalViews,
        avgRating,
        diagnosisCount: diagnoses.length,
        activeTreatments,
        advisorySaved: advisories.length,
        level,
        joinedDate: user?.joinedDate || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        totalEarnings: 0,
        activeListings: 0,
        successfulSales: 0,
        totalViews: 0,
        avgRating: 4.0,
        diagnosisCount: 0,
        activeTreatments: 0,
        advisorySaved: 0,
        level: 'New Farmer',
        joinedDate: new Date().toISOString()
      };
    }
  }

  // Increment listing views
  incrementListingViews(userId: string, listingId: string): void {
    try {
      const listings = this.getUserListings(userId);
      const listing = listings.find(l => l.id === listingId);
      
      if (listing) {
        listing.views += 1;
        this.saveUserListings(userId, listings);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Increment listing inquiries
  incrementListingInquiries(userId: string, listingId: string): void {
    try {
      const listings = this.getUserListings(userId);
      const listing = listings.find(l => l.id === listingId);
      
      if (listing) {
        listing.inquiries += 1;
        this.saveUserListings(userId, listings);
      }
    } catch (error) {
      console.error('Error incrementing inquiries:', error);
    }
  }

  // Global listings for search (combine all users)
  private updateGlobalListings(): void {
    try {
      // This would typically be handled by a backend
      // For now, we'll keep user-specific storage
    } catch (error) {
      console.error('Error updating global listings:', error);
    }
  }

  // Clear all user data (for testing)
  clearUserData(userId: string): void {
    try {
      localStorage.removeItem(`${this.storagePrefix}listings_${userId}`);
      localStorage.removeItem(`${this.storagePrefix}diagnoses_${userId}`);
      localStorage.removeItem(`${this.storagePrefix}advisories_${userId}`);
      localStorage.removeItem(`${this.storagePrefix}activities_${userId}`);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Get user activity log
  getUserActivities(userId: string): UserActivity[] {
    try {
      const activitiesKey = `${this.storagePrefix}activities_${userId}`;
      const stored = localStorage.getItem(activitiesKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;