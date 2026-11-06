import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Star,
  Navigation,
  Search,
  Store,
  RefreshCw,
  Heart,
  MoreVertical,
  CheckCircle,
  Route,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import useLocation from '@/hooks/useLocation';
import placesService, { type FertilizerShop } from '@/lib/places';

const NearbyShops = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [shops, setShops] = useState<FertilizerShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    loading: locationLoading, 
    data: locationData, 
    error: locationError, 
    getCurrentLocation 
  } = useLocation();

  // Load nearby fertilizer shops when location is available
  useEffect(() => {
    if (locationData?.latitude && locationData?.longitude) {
      loadNearbyShops(locationData.latitude, locationData.longitude);
    }
  }, [locationData]);

  const loadNearbyShops = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const nearbyShops = await placesService.findNearbyFertilizerShops(lat, lon);
      setShops(nearbyShops);
    } catch (err) {
      setError('Unable to find nearby fertilizer shops. Please try again.');
      console.error('Error loading nearby shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const retryLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (err) {
      setError('Unable to get your location. Please enable location services.');
    }
  };

  // Filter shops based on search query
  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleCall = (phone?: string) => {
    // Ensure phone number is properly formatted for calling
    if (phone) {
      // Clean the phone number and use tel: protocol
      const cleanPhone = phone.replace(/[^+\d]/g, ''); // Keep only + and digits
      window.location.href = `tel:${cleanPhone}`;
    } else {
      // Show alert if no phone number available
      alert('Phone number not available for this shop');
    }
  };

  const handleGetDirections = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop && locationData) {
      // Use universal Google Maps directions URL
      const origin = `${locationData.latitude},${locationData.longitude}`;
      const destination = `${shop.latitude},${shop.longitude}`;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
      
      // Open in new window/app for navigation
      window.open(directionsUrl, '_blank');
    } else if (shop) {
      // Fallback: show shop location on map
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
      window.open(mapUrl, '_blank');
    } else {
      alert('Unable to get directions to this location');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/home')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Fertilizer Shops</h1>
              <p className="text-blue-100 text-sm">Find fertilizer shops near you</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={retryLocation}
              disabled={locationLoading}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-white ${locationLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6 pb-24">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search shops, products, speciality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-4 text-base bg-white border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Location Banner */}
        {/* Location Status */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Current Location</h3>
                {locationLoading ? (
                  <p className="text-gray-600 text-sm">Detecting your location...</p>
                ) : locationError ? (
                  <p className="text-red-600 text-sm">Location unavailable</p>
                ) : locationData ? (
                  <p className="text-gray-600 text-sm">{locationData.district}, {locationData.state}</p>
                ) : (
                  <p className="text-gray-600 text-sm">Location not detected</p>
                )}
              </div>
            </div>
            {!locationData && (
              <Button 
                onClick={retryLocation}
                disabled={locationLoading}
                variant="outline" 
                size="sm" 
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {locationLoading ? 'Locating...' : 'Detect'}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-5 text-center shadow-lg border border-blue-200">
            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6 text-blue-700" />
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">{filteredShops.length}</p>
            <p className="text-sm font-semibold text-blue-700">Fertilizer Shops</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-5 text-center shadow-lg border border-green-200">
            <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-green-700" />
            </div>
            <p className="text-2xl font-bold text-green-900 mb-1">
              {filteredShops.length > 0 ? `${Math.min(...filteredShops.map(s => s.distance))} km` : '-'}
            </p>
            <p className="text-sm font-semibold text-green-700">Nearest Shop</p>
          </div>
        </div>

        {/* Shops List */}
        {/* Shops List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-secondary">Fertilizer Shops Near You</h2>
            <span className="text-sm text-agri-gray">{filteredShops.length} shops</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Finding Nearby Fertilizer Shops</h3>
              <p className="text-gray-500">Please wait while we locate shops near you...</p>
            </div>
          ) : filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Shop Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Store className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Fertilizer & Agricultural Supplies</p>
                      <div className="flex items-center space-x-2">
                        {shop.rating && (
                          <>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                            </div>
                            {shop.reviews && (
                              <>
                                <span className="text-sm text-gray-500">({shop.reviews})</span>
                                <span className="text-sm text-gray-500">•</span>
                              </>
                            )}
                          </>
                        )}
                        <span className="text-sm font-medium text-blue-600">{shop.distance.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={shop.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                      {shop.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                </div>

                {/* Address & Business Hours */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 mb-4 border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm mb-2">{shop.address}</p>
                      
                      {/* Business Hours */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-800 text-sm">Business Hours</span>
                        </div>
                        {shop.openingHours && shop.openingHours.length > 0 ? (
                          <div className="space-y-1">
                            {shop.openingHours.map((hours, index) => (
                              <p key={index} className="text-xs text-gray-700 leading-relaxed">
                                {hours}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">Hours not available</p>
                        )}
                        
                        {/* Current Status */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            shop.isOpen 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              shop.isOpen ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            {shop.isOpen ? 'Open Now' : 'Closed Now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => handleCall(shop.phone)}
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  
                  <Button 
                    onClick={() => handleGetDirections(shop.id)}
                    variant="outline" 
                    size="sm" 
                    className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl"
                  >
                    <Route className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>
                  
                  <button className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Real Fertilizer Shops Found</h3>
              <p className="text-gray-500 mb-6">
                {!locationData ? 
                  'Please enable location access to find nearby shops' : 
                  'No actual fertilizer shops found in your area. This search only shows real businesses from map data.'}
              </p>
              
              {/* Location Actions */}
              <div className="space-y-3">
                {!locationData ? (
                  <Button 
                    onClick={retryLocation}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Enable Location
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        if (locationData) {
                          loadNearbyShops(locationData.latitude, locationData.longitude);
                        }
                      }}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Search Again
                    </Button>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Showing only real businesses from verified map data. No mock or test data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Need Help Finding Shops?</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-agri-light rounded-xl hover:bg-agri-light-gray transition-colors">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-agri-primary" />
                <span className="font-medium text-text-secondary">Call Support</span>
              </div>
              <span className="text-sm text-agri-gray">1800-123-4567</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyShops;