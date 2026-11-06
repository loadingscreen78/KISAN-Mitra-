import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dataService, type Listing } from '@/lib/dataService';
import {
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  Eye,
  Truck,
  CheckCircle,
  X,
  TrendingUp,
  Check,
  AlertCircle,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { marketData as realMarketData, Crop } from '@/lib/marketData';

const SellProduce = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('create');
  const [showCreateListingDialog, setShowCreateListingDialog] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [quantity, setQuantity] = useState('');
  const [needTransport, setNeedTransport] = useState(false);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use real Chennai market data
  const marketData = realMarketData;

  // Get market-specific price for selected crop and market (convert from string ₹X/kg to number)
  const getMarketPrice = () => {
    if (!selectedMarket || !selectedCrop) return 0;
    const market = marketData.find(m => m.name === selectedMarket);
    const crop = market?.crops.find(c => c.name === selectedCrop);
    if (!crop?.price) return 0;
    // Extract number from price string (e.g., "₹31/kg" -> 31, "₹31.5/kg" -> 31.5)
    const priceMatch = crop.price.match(/₹([\d.]+)/);
    return priceMatch ? parseFloat(priceMatch[1]) : 0;
  };

  // Auto-calculated price based on quantity and market-specific price
  const calculateTotalPrice = () => {
    if (!selectedCrop || !quantity || !selectedMarket) return 0;
    const marketPrice = getMarketPrice();
    return parseFloat(quantity) * marketPrice;
  };

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['create', 'active', 'sold'].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [location.search]);

  // Load real user data and listings
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const user = dataService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          await loadUserListings(user.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const loadUserListings = async (userId: string) => {
    try {
      const allListings = dataService.getUserListings(userId);
      const active = allListings.filter(l => l.status === 'active');
      const sold = allListings.filter(l => l.status === 'sold');
      
      setActiveListings(active);
      setSoldListings(sold);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  // Helper function to get market approval status
  const getMarketStatus = (listing: Listing) => {
    // Simulate market approval logic based on listing age and other factors
    const createdDate = new Date(listing.postedDate);
    const now = new Date();
    const hoursSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    
    // For demo purposes, simulate realistic market approval timing
    if (hoursSinceCreated < 2) {
      return 'pending';
    } else if (hoursSinceCreated < 24) {
      // 80% chance of acceptance based on good price and demand
      const pricePerKg = typeof listing.pricePerKg === 'string' ? parseFloat(listing.pricePerKg) : listing.pricePerKg;
      const avgMarketPrice = getAverageMarketPrice(listing.crop);
      const priceRatio = pricePerKg / avgMarketPrice;
      
      // Better prices (competitive with market) have higher acceptance rate
      if (priceRatio <= 1.2 && priceRatio >= 0.8) {
        return Math.random() > 0.2 ? 'accepted' : 'rejected';
      } else if (priceRatio > 1.2) {
        return Math.random() > 0.6 ? 'rejected' : 'accepted';
      } else {
        return 'accepted'; // Very low prices always get accepted
      }
    } else {
      // Older listings have been reviewed
      return Math.random() > 0.3 ? 'accepted' : 'rejected';
    }
  };

  // Helper function to get average market price for a crop
  const getAverageMarketPrice = (cropName: string) => {
    let totalPrice = 0;
    let count = 0;
    
    marketData.forEach(market => {
      market.crops.forEach(crop => {
        if (crop.name === cropName) {
          const priceMatch = crop.price.match(/₹([\d.]+)/);
          if (priceMatch) {
            totalPrice += parseFloat(priceMatch[1]);
            count++;
          }
        }
      });
    });
    
    return count > 0 ? totalPrice / count : 50; // Default to ₹50/kg if not found
  };

  // Component to render market status badge
  const MarketStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            <Timer className="w-3 h-3" />
            <span>Under Review</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            <Check className="w-3 h-3" />
            <span>Market Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Review Needed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper function to get crop emoji - Updated for all Chennai vegetables
  const getCropEmoji = (cropName) => {
    const emojiMap = {
      'Tomato': '🍅',
      'Onion': '🧅', 
      'Onion Big': '🧅',
      'Onion Small': '🧅',
      'Onion Green': '🧅',
      'Potato': '🥔',
      'Carrot': '🥕',
      'Cabbage': '🥬',
      'Cauliflower': '🥬',
      'Spinach': '🥬',
      'Radish': '🤍',
      'Brinjal': '🍆',
      'Ladies Finger': '🫛',
      'Bottle Gourd': '🥒',
      'Bitter Gourd': '🥒',
      'Ridge Gourd': '🥒',
      'Snake Gourd': '🥒',
      'Ivy Gourd': '🥒',
      'Ash Gourd': '🥒',
      'Cucumber': '🥒',
      'Pumpkin': '🎃',
      'Green Chilli': '🌶️',
      'Capsicum': '🫑',
      'French Beans': '🫘',
      'Broad Beans': '🫘',
      'Butter Beans': '🫘',
      'Cluster Beans': '🫘',
      'Green Peas': '🟢',
      'Beetroot': '🟣',
      'Sweet Potato': '🍠',
      'Elephant Yam': '🍠',
      'Colocasia': '🥔',
      'Corn': '🌽',
      'Baby Corn': '🌽',
      'Drumsticks': '🌱',
      'Coconut': '🥥',
      'Lemon': '🍋',
      'Ginger': '🧄',
      'Garlic': '🧄',
      'Mushroom': '🍄',
      'Amla': '🍃',
      'Raw Mango': '🥭',
      'Raw Banana': '🍌',
      'Banana Flower': '🌸',
      'Shallot': '🧅',
      'Curry Leaves': '🍃',
      'Coriander Leaves': '🌿',
      'Mint Leaves': '🌿',
      'Fenugreek Leaves': '🌿',
      'Dill Leaves': '🌿',
      'Mustard Leaves': '🍃',
      'Amaranth Leaves': '🍃',
      'Sorrel Leaves': '🍃',
      'Colocasia Leaves': '🍃',
      'Okra': '🫛'
    };
    return emojiMap[cropName] || '🌱';
  };

  // Get highest price for each vegetable across all Chennai markets
  const getHighestPricesAcrossMarkets = () => {
    const cropPrices: { [key: string]: { price: number; emoji: string; name: string } } = {};
    
    // Extract all unique crops with their highest prices
    marketData.forEach(market => {
      market.crops.forEach(crop => {
        const priceMatch = crop.price.match(/₹([\d.]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        
        if (!cropPrices[crop.name] || price > cropPrices[crop.name].price) {
          cropPrices[crop.name] = {
            price,
            emoji: getCropEmoji(crop.name),
            name: crop.name
          };
        }
      });
    });
    
    // Sort by price (highest first) and show at least 20 crops
    return Object.values(cropPrices)
      .sort((a, b) => b.price - a.price)
      .slice(0, 20) // Show top 20 highest priced vegetables
      .map(crop => ({
        crop: `${crop.emoji} ${crop.name}`,
        avgPrice: crop.price,
        emoji: crop.emoji,
        name: crop.name
      }));
  };

  const marketPrices = getHighestPricesAcrossMarkets();

  const totalEarnings = soldListings.reduce((sum, listing) => sum + listing.soldPrice, 0);

  const handleCreateListing = async () => {
    if (!currentUser) {
      alert('Please login first to create listings');
      return;
    }

    if (!selectedMarket || !selectedCrop || !quantity) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const marketPrice = getMarketPrice();
      const totalPrice = calculateTotalPrice();
      const cropEmoji = getCropEmoji(selectedCrop);
      
      // Create new listing with real database structure
      const newListing: Listing = {
        id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        crop: `${cropEmoji} ${selectedCrop}`,
        quantity: `${quantity} kg`,
        pricePerKg: marketPrice,
        market: selectedMarket,
        transport: needTransport ? 'Yes' : 'No',
        views: 0,
        inquiries: 0,
        totalPrice: totalPrice,
        status: 'active',
        postedDate: 'Just now',
        createdAt: new Date().toISOString()
      };

      // Save to real database service
      dataService.addListing(newListing);
      
      // Update local state
      setActiveListings(prev => [...prev, newListing]);
      
      // Show success message
      alert(`✅ Listing created successfully!\n\nCrop: ${selectedCrop}\nQuantity: ${quantity} kg\nMarket: ${selectedMarket}\nTotal Value: ₹${totalPrice.toLocaleString()}`);
      
      // Switch to active listings tab to show the new listing
      setSelectedTab('active');
      setShowCreateListingDialog(false);
      
      // Reset form
      setSelectedCrop('');
      setSelectedMarket('');
      setQuantity('');
      setNeedTransport(false);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  const prefillFromMarketPrice = (crop: any) => {
    setSelectedCrop(crop.name);
    setShowCreateListingDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sell Crops</h1>
              <p className="text-xs text-gray-600">Create listings and track sales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section - Mobile Optimized Tabs and Earnings */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4 min-h-[48px]">
          {/* Tabs - Mobile Sized */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border h-12">
            <button
              onClick={() => setSelectedTab('create')}
              className={`px-3 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                selectedTab === 'create'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => setSelectedTab('active')}
              className={`px-3 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                selectedTab === 'active'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedTab('sold')}
              className={`px-3 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                selectedTab === 'sold'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Sold
            </button>
          </div>

          {/* Counts and Earnings Display */}
          <div className="flex space-x-2">
            <div className="text-center bg-blue-50 px-2 py-1.5 rounded-xl border border-blue-200 min-w-[50px]">
              <p className="text-xs text-blue-600 font-medium leading-none">Active</p>
              <p className="text-base font-bold text-blue-700 mt-0.5">{activeListings.length}</p>
            </div>
            <div className="text-center bg-orange-50 px-2 py-1.5 rounded-xl border border-orange-200 min-w-[50px]">
              <p className="text-xs text-orange-600 font-medium leading-none">Sold</p>
              <p className="text-base font-bold text-orange-700 mt-0.5">{soldListings.length}</p>
            </div>
            <div className="text-center bg-green-50 px-2 py-1.5 rounded-xl border border-green-200 min-w-[60px]">
              <p className="text-xs text-green-600 font-medium leading-none">Earned</p>
              <p className="text-xs font-bold text-green-700 mt-0.5">₹{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Listings Section - Mobile Optimized */}
        <div className="space-y-3 mb-6">
          {selectedTab === 'create' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">🌾 Select Crop to Sell</h2>
                <p className="text-sm text-gray-600 mb-4">Choose from current Chennai market prices. Tap a crop to create your listing.</p>
                <div className="grid grid-cols-2 gap-3">
                  {marketPrices.map((crop, index) => (
                    <Card 
                      key={index}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95"
                      onClick={() => prefillFromMarketPrice(crop)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{crop.emoji}</div>
                        <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{crop.name}</h3>
                        <p className="text-green-600 font-bold text-sm">₹{crop.avgPrice}/kg</p>
                        <p className="text-xs text-gray-500 mt-1">Market Price</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'active' && (
            <>
              {activeListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Listings</h3>
                  <p className="text-gray-600 mb-4">You don't have any active listings yet.</p>
                  <Button 
                    onClick={() => setSelectedTab('create')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                activeListings.map((listing) => (
                <Card key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <CardContent className="p-4">
                    {/* Mobile Layout: Vertical Stack */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-3xl">{listing.crop.split(' ')[0]}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 leading-tight">{listing.crop}</h3>
                          <p className="text-sm text-gray-500">{listing.quantity} – ₹{listing.pricePerKg}/kg – Transport: {listing.transport}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Status Badge */}
                    <div className="mb-3">
                      <MarketStatusBadge status={getMarketStatus(listing)} />
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">{listing.views}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">{listing.inquiries}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{listing.postedDate}</p>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </>
          )}

          {selectedTab === 'sold' && (
            <>
              {soldListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Sales Yet</h3>
                  <p className="text-gray-600 mb-4">You haven't sold any items yet.</p>
                  <Button 
                    onClick={() => setSelectedTab('create')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                soldListings.map((listing) => (
                <Card key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <CardContent className="p-4">
                    {/* Mobile Layout: Vertical Stack */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-3xl">{listing.crop.split(' ')[0]}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 leading-tight">{listing.crop}</h3>
                          <p className="text-sm text-gray-500">{listing.quantity} – ₹{listing.pricePerKg}/kg – Transport: {listing.transport}</p>
                          <p className="text-lg font-bold text-green-600 mt-1">Earned: ₹{listing.soldPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Sold to {listing.buyer}</span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(listing.soldDate).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </>
          )}
        </div>

        {/* Floating Action Button - Only show in create tab */}
        {selectedTab === 'create' && (
          <div className="fixed bottom-24 right-6 z-20">
            <Button
              onClick={() => setShowCreateListingDialog(true)}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all duration-300 flex items-center justify-center group hover:scale-110 floating-fab hover:!animate-none"
            >
              <Plus className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          </div>
        )}

      </div>


      {/* Create New Listing Dialog - Mobile Optimized */}
      <Dialog open={showCreateListingDialog} onOpenChange={setShowCreateListingDialog}>
        <DialogContent className="max-w-sm mx-auto m-4 rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold text-gray-900">Create New Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Crop Selection - First Step */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Choose Crop</label>
              <Select value={selectedCrop} onValueChange={(value) => { setSelectedCrop(value); setSelectedMarket(''); }}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select crop to sell" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(marketData.flatMap(market => market.crops.map(crop => crop.name)))).sort().map((cropName) => (
                    <SelectItem key={cropName} value={cropName} className="text-base py-3">
                      <div className="flex items-center space-x-2">
                        <span>{getCropEmoji(cropName)}</span>
                        <span>{cropName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Market Selection - Second Step */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Choose Market</label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket} disabled={!selectedCrop}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder={selectedCrop ? "Select market" : "Select crop first"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedCrop && marketData
                    .filter(market => market.crops.some(crop => crop.name === selectedCrop))
                    .map((market) => {
                      const crop = market.crops.find(c => c.name === selectedCrop);
                      return (
                        <SelectItem key={market.id} value={market.name} className="text-base py-3">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{market.name}</span>
                              <span className="text-xs text-gray-500">{market.location}</span>
                            </div>
                            <span className="text-green-600 font-bold">{crop?.price}/kg</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity (kg)</label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-12 text-base"
              />
            </div>

            {/* Price Display (Auto-calculated) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Information</label>
              <div className="bg-gray-50 rounded-xl p-4 border">
                {selectedMarket && selectedCrop && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market:</span>
                      <span className="text-sm font-medium">{selectedMarket}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market price:</span>
                      <span className="text-sm font-medium">₹{getMarketPrice()}/kg</span>
                    </div>
                    {quantity && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <span className="text-sm font-medium">{quantity} kg</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-bold text-gray-900">Total Price:</span>
                          <span className="text-lg font-bold text-green-600">₹{calculateTotalPrice().toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {(!selectedMarket || !selectedCrop) && (
                  <p className="text-sm text-gray-500 text-center">
                    {!selectedMarket ? "Select a market and crop to see price calculation" : "Select a crop to see price calculation"}
                  </p>
                )}
              </div>
            </div>

            {/* Transport Toggle */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">Need Transport?</label>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${!needTransport ? 'text-gray-900' : 'text-gray-500'}`}>No</span>
                  <Switch
                    checked={needTransport}
                    onCheckedChange={setNeedTransport}
                  />
                  <span className={`text-sm font-medium ${needTransport ? 'text-gray-900' : 'text-gray-500'}`}>Yes</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleCreateListing}
              disabled={!selectedMarket || !selectedCrop || !quantity}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl h-12 mt-4"
            >
              Create Listing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellProduce;