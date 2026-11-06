// Real Database Service for KisanMitra App - Client-side wrapper
// Note: This would typically communicate with a backend API
// For now, we'll enhance the localStorage approach to simulate real database behavior

export interface User {
  id: number;
  name: string;
  phone: string;
  location: string;
  state: string;
  avatar?: string;
  joinedDate: string;
  createdAt: string;
}

export interface Listing {
  id: number;
  userId: number;
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
  soldDate?: string;
  soldPrice?: number;
  buyer?: string;
  createdAt: string;
}

export interface Diagnosis {
  id: number;
  userId: number;
  cropName: string;
  diagnosis: string;
  confidence: number;
  treatment: string;
  date: string;
  createdAt: string;
}

export interface AdvisoryRecord {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string;
  savedDate: string;
  createdAt: string;
}

export interface UserStats {
  totalEarnings: number;
  activeListings: number;
  successfulSales: number;
  totalViews: number;
  avgRating: number;
  diagnosisCount: number;
  advisorySaved: number;
  level: string;
  joinedDate: string;
}

class RealDataService {
  private currentUserId: number | null = null;
  private storagePrefix = 'kisanmitra_v2_';
  
  constructor() {
    this.initializeUser();
  }

  private initializeUser() {
    const savedUserId = localStorage.getItem('kisanmitra_user_id');
    if (savedUserId) {
      this.currentUserId = parseInt(savedUserId, 10);
    }
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUserId) return null;
    
    const users = JSON.parse(localStorage.getItem(`${this.storagePrefix}users`) || '[]');
    return users.find((u: User) => u.id === this.currentUserId) || null;
  }

  async loginOrCreateUser(phone: string, name: string, location: string, state: string): Promise<User> {
    const users = JSON.parse(localStorage.getItem(`${this.storagePrefix}users`) || '[]');
    
    // Try to find existing user
    let user = users.find((u: User) => u.phone === phone);
    
    if (!user) {
      // Create new user
      user = {
        id: this.generateId(),
        name,
        phone,
        location,
        state,
        joinedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem(`${this.storagePrefix}users`, JSON.stringify(users));
    }

    this.currentUserId = user.id;
    localStorage.setItem('kisanmitra_user_id', user.id.toString());
    localStorage.setItem('kisanmitra_user', JSON.stringify(user));

    return user;
  }

  async getUserListings(): Promise<Listing[]> {
    if (!this.currentUserId) return [];
    
    const listings = JSON.parse(localStorage.getItem(`${this.storagePrefix}listings`) || '[]');
    return listings.filter((l: Listing) => l.userId === this.currentUserId);
  }

  async createListing(listingData: any): Promise<Listing | null> {
    if (!this.currentUserId) return null;

    const listings = JSON.parse(localStorage.getItem(`${this.storagePrefix}listings`) || '[]');
    
    const listing: Listing = {
      id: this.generateId(),
      userId: this.currentUserId,
      crop: listingData.crop,
      quantity: listingData.quantity,
      pricePerKg: listingData.pricePerKg,
      market: listingData.market,
      transport: listingData.transport,
      totalPrice: listingData.totalPrice,
      postedDate: listingData.postedDate,
      status: 'active',
      views: 0,
      inquiries: 0,
      createdAt: new Date().toISOString()
    };

    listings.push(listing);
    localStorage.setItem(`${this.storagePrefix}listings`, JSON.stringify(listings));
    
    await this.trackUserActivity('listing_created', { listingId: listing.id, crop: listing.crop });
    return listing;
  }

  async markListingAsSold(listingId: number, soldPrice: number, buyer: string): Promise<Listing | null> {
    const listings = JSON.parse(localStorage.getItem(`${this.storagePrefix}listings`) || '[]');
    const listing = listings.find((l: Listing) => l.id === listingId);
    
    if (listing) {
      listing.status = 'sold';
      listing.soldDate = new Date().toISOString();
      listing.soldPrice = soldPrice;
      listing.buyer = buyer;
      
      localStorage.setItem(`${this.storagePrefix}listings`, JSON.stringify(listings));
      await this.trackUserActivity('listing_sold', { listingId, soldPrice, buyer });
    }
    
    return listing;
  }

  async getUserDiagnoses(): Promise<Diagnosis[]> {
    if (!this.currentUserId) return [];
    
    const diagnoses = JSON.parse(localStorage.getItem(`${this.storagePrefix}diagnoses`) || '[]');
    return diagnoses.filter((d: Diagnosis) => d.userId === this.currentUserId);
  }

  async createDiagnosis(diagnosisData: any): Promise<Diagnosis | null> {
    if (!this.currentUserId) return null;

    const diagnoses = JSON.parse(localStorage.getItem(`${this.storagePrefix}diagnoses`) || '[]');
    
    const diagnosis: Diagnosis = {
      id: this.generateId(),
      userId: this.currentUserId,
      cropName: diagnosisData.cropName,
      diagnosis: diagnosisData.diagnosis,
      confidence: diagnosisData.confidence,
      treatment: diagnosisData.treatment,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    diagnoses.push(diagnosis);
    localStorage.setItem(`${this.storagePrefix}diagnoses`, JSON.stringify(diagnoses));
    
    await this.trackUserActivity('diagnosis_created', { diagnosisId: diagnosis.id, crop: diagnosis.cropName });
    return diagnosis;
  }

  async getUserAdvisories(): Promise<AdvisoryRecord[]> {
    if (!this.currentUserId) return [];
    
    const advisories = JSON.parse(localStorage.getItem(`${this.storagePrefix}advisories`) || '[]');
    return advisories.filter((a: AdvisoryRecord) => a.userId === this.currentUserId);
  }

  async saveAdvisory(advisoryData: any): Promise<AdvisoryRecord | null> {
    if (!this.currentUserId) return null;

    const advisories = JSON.parse(localStorage.getItem(`${this.storagePrefix}advisories`) || '[]');
    
    const advisory: AdvisoryRecord = {
      id: this.generateId(),
      userId: this.currentUserId,
      title: advisoryData.title,
      content: advisoryData.content,
      category: advisoryData.category,
      savedDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    advisories.push(advisory);
    localStorage.setItem(`${this.storagePrefix}advisories`, JSON.stringify(advisories));
    
    await this.trackUserActivity('advisory_saved', { advisoryId: advisory.id, title: advisory.title });
    return advisory;
  }

  async trackUserActivity(action: string, data: any): Promise<void> {
    if (!this.currentUserId) return;

    const activities = JSON.parse(localStorage.getItem(`${this.storagePrefix}activities`) || '[]');
    
    const activity = {
      id: this.generateId(),
      userId: this.currentUserId,
      action,
      data,
      timestamp: new Date().toISOString()
    };

    activities.push(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }
    
    localStorage.setItem(`${this.storagePrefix}activities`, JSON.stringify(activities));
  }

  async calculateUserStats(): Promise<UserStats> {
    if (!this.currentUserId) {
      return {
        totalEarnings: 0,
        activeListings: 0,
        successfulSales: 0,
        totalViews: 0,
        avgRating: 4.0,
        diagnosisCount: 0,
        advisorySaved: 0,
        level: 'New Farmer',
        joinedDate: new Date().toISOString()
      };
    }

    const [listings, diagnoses, advisories, user] = await Promise.all([
      this.getUserListings(),
      this.getUserDiagnoses(),
      this.getUserAdvisories(),
      this.getCurrentUser()
    ]);

    const activeListings = listings.filter(l => l.status === 'active');
    const soldListings = listings.filter(l => l.status === 'sold');
    
    const totalEarnings = soldListings.reduce((sum, listing) => sum + (listing.soldPrice || 0), 0);
    const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
    const successfulSales = soldListings.length;

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

    // Calculate average rating
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
      advisorySaved: advisories.length,
      level,
      joinedDate: user?.joinedDate || new Date().toISOString()
    };
  }

  async addSampleData(): Promise<void> {
    if (!this.currentUserId) throw new Error('User not logged in');

    // Create sample listings
    const sampleListings = [
      {
        crop: '🍅 Tomato',
        quantity: '100 kg',
        pricePerKg: 25,
        market: 'Azadpur Mandi',
        transport: 'Yes',
        totalPrice: 2500,
        postedDate: '2 days ago',
      },
      {
        crop: '🌾 Wheat',
        quantity: '50 kg',
        pricePerKg: 22,
        market: 'Ghazipur Mandi',
        transport: 'No',
        totalPrice: 1100,
        postedDate: '1 day ago',
      }
    ];

    for (const listingData of sampleListings) {
      const listing = await this.createListing(listingData);
      if (listing && listingData.crop.includes('Tomato')) {
        // Mark tomato as sold for demo
        await this.markListingAsSold(listing.id, 2500, 'Delhi Wholesaler');
      }
    }

    // Create sample diagnosis
    await this.createDiagnosis({
      cropName: 'Tomato',
      diagnosis: 'Early Blight',
      confidence: 85,
      treatment: 'Apply copper fungicide spray',
    });

    // Create sample advisory
    await this.saveAdvisory({
      title: 'Optimal Irrigation for Tomatoes',
      content: 'Water tomatoes deeply but less frequently to encourage deep root growth.',
      category: 'Irrigation',
    });
  }

  logout(): void {
    this.currentUserId = null;
    localStorage.removeItem('kisanmitra_user_id');
    localStorage.removeItem('kisanmitra_user');
    localStorage.removeItem('kisanmitra_auth_token');
    localStorage.removeItem('kisanmitra_notifications');
  }
}

export const realDataService = new RealDataService();
export default realDataService;