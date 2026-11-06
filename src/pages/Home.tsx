
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Camera, 
  ShoppingCart, 
  MapPin, 
  Package, 
  Sprout, 
  Home as HomeIcon,
  User,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Store,
  Leaf,
  Cloud,
  Sun,
  CheckCircle,
  ChevronDown,
  Droplets,
  Activity,
  TestTube,
  Beaker,
  IndianRupee,
  ArrowRight,
  Volume2,
  BookOpen,
  BarChart3,
  List,
  ChevronRight,
  CloudRain,
  Thermometer,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { weatherService, WeatherData } from '@/lib/weather';
import { marketData } from '@/lib/marketData';
import { useTranslation } from 'react-i18next';
import { authService } from '@/lib/authService';
import { dataService } from '@/lib/dataService';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  // Get user data from database (consistent with Profile page)
  const [userData, setUserData] = useState(null);
  const [userName, setUserName] = useState('Farmer');

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        // First try to get user from new auth service (database)
        let user = authService.getCurrentUser();
        
        // If no user from auth service, try old dataService for backward compatibility
        if (!user) {
          user = dataService.getCurrentUser();
        }
        
        if (user) {
          // Ensure user has required fields for display
          const profileUser = {
            id: user.id || Date.now().toString(),
            name: user.name || user.user_metadata?.name || 'Farmer',
            phone: user.phone || user.user_metadata?.phone || 'N/A',
            location: user.location || user.user_metadata?.location || 'India',
            state: user.state || user.user_metadata?.state || 'India',
            avatar: user.avatar || user.user_metadata?.avatar,
            joinedDate: user.joinedDate || user.created_at || new Date().toISOString(),
            createdAt: user.createdAt || user.created_at || new Date().toISOString()
          };
          
          setUserData(profileUser);
          setUserName(profileUser.name);
        } else {
          // Fallback to localStorage for backward compatibility
          const localUserData = JSON.parse(localStorage.getItem('kisanmitra_user') || '{}');
          setUserName(localUserData.name || 'Farmer');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to localStorage
        const localUserData = JSON.parse(localStorage.getItem('kisanmitra_user') || '{}');
        setUserName(localUserData.name || 'Farmer');
      }
    };

    loadUserData();
  }, []);
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.good_morning');
    if (hour < 17) return t('greeting.good_afternoon');
    return t('greeting.good_evening');
  };

  // Load weather data
  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true);
        
        // Try to get current GPS location first with better error handling
        try {
          console.log('Attempting to get live GPS location for weather...');
          const location = await weatherService.getCurrentLocation();
          console.log('Got GPS location, fetching weather data...');
          const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
          console.log('Weather data fetched successfully for GPS location');
          setWeather(weatherData);
          return; // Exit early if GPS location works
        } catch (locationError) {
          console.warn('GPS location failed, trying user profile location:', locationError.message);
          
          // Try to use user's stored location from profile
          try {
            let userLocation = null;
            
            // First try to get user from auth service
            let user = authService.getCurrentUser();
            if (!user) {
              user = dataService.getCurrentUser();
            }
            
            if (user && (user.location || user.state)) {
              // Use user's stored location
              const locationQuery = user.location && user.location !== 'India' 
                ? `${user.location}, ${user.state || 'IN'}`
                : user.state && user.state !== 'India'
                ? `${user.state}, IN`
                : null;
              
              if (locationQuery) {
                console.log(`Using user's stored location: ${locationQuery}`);
                userLocation = await weatherService.getWeatherByCity(locationQuery);
              }
            }
            
            // If user location works, use it; otherwise fall back to Chennai
            if (userLocation) {
              setWeather(userLocation);
            } else {
              console.warn('No user location available, using Chennai as fallback');
              const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
              setWeather(defaultWeather);
            }
          } catch (userLocationError) {
            console.warn('User location fetch failed, using Chennai as fallback');
            const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
            setWeather(defaultWeather);
          }
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        // Keep weather as null, will show fallback UI
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
  }, []);

  // Calculate top 3 price hikes dynamically from real Chennai market data
  const getTopPriceHikes = () => {
    // Collect all crops with upward trends and parse their change percentages
    const cropHikes: Array<{crop: string, price: string, trend: string, change: string, changeValue: string, changePercent: number}> = [];
    
    marketData.forEach((market: any) => {
      market.crops.forEach((crop: any) => {
        if (crop.trend === 'up') {
          const changePercent = parseInt(crop.change.replace('%', '').replace('+', ''));
          const priceMatch = crop.price.match(/₹([\d.]+)/);
          const currentPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;
          const prevPriceMatch = crop.previousPrice.match(/₹([\d.]+)/);
          const previousPrice = prevPriceMatch ? parseFloat(prevPriceMatch[1]) : currentPrice;
          const changeValue = currentPrice - previousPrice;
          
          cropHikes.push({
            crop: crop.name,
            price: crop.price,
            trend: crop.trend,
            change: crop.change,
            changeValue: `+₹${changeValue.toFixed(2)}`,
            changePercent
          });
        }
      });
    });
    
    // Sort by change percentage (highest first) and take top 3 unique crops
    const uniqueHikes = cropHikes.filter((crop, index, arr) => 
      arr.findIndex(c => c.crop === crop.crop) === index
    );
    
    return uniqueHikes
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 3);
  };

  const marketPrices = getTopPriceHikes();

  const quickActions = [
    {
      id: 'listings',
      title: 'My Listings',
      subtitle: 'Manage crops',
      icon: Package,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      badge: '3',
      action: () => navigate('/sell')
    },
    {
      id: 'sell',
      title: 'Sell Produce',
      subtitle: 'Post your harvest',
      icon: TrendingUp,
      bgColor: 'bg-agri-light',
      iconColor: 'text-agri-primary',
      badge: 'NEW',
      action: () => navigate('/sell')
    },
    {
      id: 'fertilizers',
      title: 'Order Fertilizers',
      subtitle: 'Shop nutrients',
      icon: ShoppingCart,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      action: () => navigate('/shop')
    },
    {
      id: 'shops',
      title: 'Nearby Shops',
      subtitle: 'Find agri stores',
      icon: MapPin,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      action: () => navigate('/shops')
    },
    {
      id: 'orders',
      title: 'My Orders',
      subtitle: 'Track orders',
      icon: Package,
      bgColor: 'bg-agri-light-blue',
      iconColor: 'text-agri-info',
      action: () => navigate('/orders')
    }
  ];

  const farmActions = [
    {
      id: 'treatments',
      title: 'Active Treatments',
      subtitle: '2 ongoing',
      icon: Activity,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      badge: 2,
      action: () => navigate('/treatments')
    },
    {
      id: 'guides',
      title: 'Cultivation Guides',
      subtitle: 'Growing tips',
      icon: Sprout,
      bgColor: 'bg-agri-light',
      iconColor: 'text-agri-primary',
      action: () => navigate('/guides')
    }
  ];

  return (
    <div className="mobile-container bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 min-h-screen">
      {/* Header */}
      <div className="bg-green-50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Logo and Greeting */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center p-0.5">
              <img 
                src="/assets/kisanmitra-logo-clean.png" 
                alt={t('home.title') + ' Logo'} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-green-900 leading-tight">{t('home.title')}</h2>
              <p className="text-xs font-medium text-green-700 leading-tight">
                {getGreeting()}
              </p>
              <p className="text-xs text-green-600 leading-tight">
                {userName || 'Farmer'}
              </p>
            </div>
          </div>
          
          {/* Right side - Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {/* Language Toggle */}
            <div className="scale-90">
              <LanguageSwitcher />
            </div>
            
            {/* Notification Bell */}
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 hover:bg-green-100 rounded-full transition-colors flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-green-700" />
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white leading-none">3</span>
              </div>
            </button>

            {/* Profile Icon */}
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-base font-bold shadow-lg hover:bg-green-700 transition-colors border-2 border-white"
            >
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 space-y-8 pt-6 pb-24">
        {/* Weather Card - Compact & Improved */}
        <Card className="weather-card border-0 shadow-lg rounded-2xl bg-gradient-to-r from-blue-100/80 to-sky-100/80 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Header with location */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">
                  {weatherLoading ? 'Loading...' : weather?.location || 'Location unavailable'}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white/70 border-blue-200 hover:bg-white text-blue-700 text-sm h-8 px-3 rounded-xl"
                onClick={() => navigate('/weather')}
              >
                {t('home.more')}
              </Button>
            </div>

            <div className="flex items-center justify-between mb-3">
              {/* Weather Info */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                  {weather && !weatherLoading ? (
                    <img 
                      src={weatherService.getWeatherIconUrl(weather.icon)} 
                      alt={weather.description}
                      className="w-8 h-8"
                    />
                  ) : (
                    <Cloud className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-900">
                    {weatherLoading ? '--°C' : weather ? `${weather.temperature}°C` : '--°C'}
                  </div>
                  <div className="text-sm text-blue-600 capitalize">
                    {weatherLoading ? 'Loading...' : weather?.description || 'No data'}
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="text-center">
                <div className="text-xs text-blue-600 mb-1">{t('home.humidity')}</div>
                <div className="text-sm font-semibold text-blue-800">
                  {weatherLoading ? '--%' : weather ? `${weather.humidity}%` : '--%'}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>


        {/* AI Plant Diagnosis */}
        <Card className="bg-gradient-to-r from-green-400 to-emerald-500 border-0 shadow-xl rounded-2xl transform hover:scale-[1.02] transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-3">
                  {t('home.ai_powered')}
                </div>
                <h3 className="font-bold text-white text-xl mb-1">{t('home.diagnose_plant_health')}</h3>
                <p className="text-white/90 text-base">{t('home.take_photo_check_diseases')}</p>
              </div>
              <Button 
                onClick={() => navigate('/diagnose')}
                className="bg-white text-green-500 hover:bg-white/90 font-bold rounded-xl px-6 py-3 flex items-center space-x-2 text-base active:scale-95 transition-transform ml-4"
              >
                <Camera className="w-5 h-5" />
                <span>{t('home.start')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Treatments - Separate Card */}
        <Card className="bg-white border-0 shadow-lg rounded-2xl">
          <CardContent className="p-5">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Active Treatments</h3>
              <p className="text-sm text-gray-600">3 ongoing treatments</p>
            </div>
            <div className="flex items-center justify-center space-x-8">
              {[
                { name: "Peach", progress: 85 },
                { name: "Tomato", progress: 92 },
                { name: "Wheat", progress: 78 }
              ].map((crop, index) => {
                const circumference = 2 * Math.PI * 16;
                const strokeDasharray = circumference;
                const strokeDashoffset = circumference - (crop.progress / 100) * circumference;
                
                return (
                  <button
                    key={index}
                    className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
                    onClick={() => navigate('/treatments')}
                  >
                    <div className="relative w-12 h-12">
                      {/* Background circle */}
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="rgba(34, 197, 94, 0.2)"
                          strokeWidth="3"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 ease-in-out"
                        />
                      </svg>
                      {/* Percentage in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">{crop.progress}%</span>
                      </div>
                    </div>
                    {/* Crop name label */}
                    <span className="text-xs text-gray-600 font-medium">{crop.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Soil & Fertilizer Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-secondary">{t('home.sections.soil_fertilizer')}</h2>
          <div className="space-y-3">
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/soil-health')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <TestTube className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.soil_health')}</h3>
                    <p className="text-green-800 text-sm">{t('home.check_nutrient_levels')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/fertilizer-guide')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <Beaker className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.fertilizer_guide')}</h3>
                    <p className="text-green-800 text-sm">{t('home.get_nutrient_advice')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Marketplace Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-secondary">{t('home.sections.marketplace')}</h2>
          
          {/* Market Prices Preview */}
          <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-text-secondary text-xl">{t('home.todays_mandi_prices')}</h3>
                <TrendingUp className="w-6 h-6 text-agri-success" />
              </div>
              <div className="space-y-3 mb-6">
                {marketPrices.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-green-100">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-gray-900 text-base sm:text-lg truncate block">{item.crop}</span>
                      <div className="text-sm text-gray-600 mt-0.5 flex items-center">
                        {item.trend === 'up' ? `↗ ${t('home.trending_up')}` : `↘ ${t('home.trending_down')}`}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="font-bold text-gray-900 text-base sm:text-lg">{item.price}</div>
                      <div className={`text-sm font-semibold flex items-center space-x-1 justify-end ${
                        item.trend === 'up' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                        )}
                        <span className="text-xs sm:text-sm">{item.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Marketplace Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/market-prices')}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-3 justify-center h-12 text-base font-semibold rounded-2xl active:scale-95 transition-transform"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>{t('home.see_prices')}</span>
                </Button>
                <Button 
                  onClick={() => navigate('/sell')}
                  className="bg-agri-success hover:bg-agri-success/90 flex items-center space-x-3 justify-center h-12 text-base font-semibold rounded-2xl active:scale-95 transition-transform"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('home.sell_crops')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Marketplace Cards */}
          <div className="space-y-3">
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/shop')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <ShoppingCart className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.order_fertilizers')}</h3>
                    <p className="text-green-800 text-sm">{t('home.shop_nutrients')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/shops')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <MapPin className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.nearby_shops')}</h3>
                    <p className="text-green-800 text-sm">{t('home.find_agri_stores')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Farm Section - 4 Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-secondary">{t('home.sections.my_farm')}</h2>
          
          <div className="space-y-3">
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/treatments')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md relative">
                    <Activity className="w-6 h-6 text-green-800" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.active_treatments')}</h3>
                    <p className="text-green-800 text-sm">2 {t('home.ongoing_sprays')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/guides')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <Sprout className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.cultivation_guides')}</h3>
                    <p className="text-green-800 text-sm">{t('home.growing_tips')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/orders')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <Package className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.my_orders')}</h3>
                    <p className="text-green-800 text-sm">{t('home.track_purchases')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer active:scale-95 transition-transform rounded-2xl shadow-md border-0 bg-gradient-to-r from-green-100/90 to-emerald-100/90 hover:shadow-lg backdrop-blur-sm" onClick={() => navigate('/sell')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-xl flex items-center justify-center shadow-md">
                    <Package className="w-6 h-6 text-green-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-green-900 text-base mb-1">{t('home.my_listings')}</h3>
                    <p className="text-green-800 text-sm">{t('home.manage_crop_listings')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-700" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - 5 Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="flex flex-col items-center space-y-1 px-2 py-2 min-w-0">
            <HomeIcon className="w-7 h-7 text-agri-primary" />
            <span className="text-sm font-semibold text-agri-primary">{t('navigation.home')}</span>
          </button>
          
          <button 
            onClick={() => navigate('/diagnose')}
            className="flex flex-col items-center space-y-1 px-2 py-2 transition-all duration-200 hover:bg-agri-light rounded-2xl min-w-0 active:scale-95"
          >
            <Camera className="w-7 h-7 text-agri-gray" />
            <span className="text-sm text-agri-gray">{t('navigation.diagnose')}</span>
          </button>
          
          <button 
            onClick={() => navigate('/advisory')}
            className="flex flex-col items-center space-y-1 px-2 py-2 transition-all duration-200 hover:bg-agri-light rounded-2xl min-w-0 active:scale-95"
          >
            <BookOpen className="w-7 h-7 text-agri-gray" />
            <span className="text-sm text-agri-gray">{t('navigation.advisory')}</span>
          </button>
          
          <button 
            onClick={() => navigate('/shop')}
            className="flex flex-col items-center space-y-1 px-2 py-2 transition-all duration-200 hover:bg-agri-light rounded-2xl min-w-0 active:scale-95"
          >
            <Store className="w-7 h-7 text-agri-gray" />
            <span className="text-sm text-agri-gray">{t('navigation.shop')}</span>
          </button>
          
          <button 
            onClick={() => navigate('/mitra')}
            className="flex flex-col items-center space-y-1 px-2 py-2 transition-all duration-200 hover:bg-agri-light rounded-2xl min-w-0 active:scale-95"
          >
            <MessageCircle className="w-7 h-7 text-agri-gray" />
            <span className="text-sm text-agri-gray">{t('navigation.mitra')}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Home;
