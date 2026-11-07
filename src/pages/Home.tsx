import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Camera, 
  MapPin, 
  Package, 
  Sprout, 
  TrendingUp, 
  Store, 
  Cloud, 
  ChevronRight, 
  Activity, 
  TestTube, 
  Beaker, 
  BarChart3, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Droplets,
  Wind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';
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
  const [userName, setUserName] = useState('Farmer');

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        let user = authService.getCurrentUser() || dataService.getCurrentUser();
        if (user) {
          const name = user.name || user.user_metadata?.name || 'Farmer';
          setUserName(name);
        } else {
          const localUserData = JSON.parse(localStorage.getItem('kisanmitra_user') || '{}');
          setUserName(localUserData.name || 'Farmer');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
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
        try {
          const location = await weatherService.getCurrentLocation();
          const weatherData = await weatherService.getCurrentWeather(location.lat, location.lon);
          setWeather(weatherData);
          return;
        } catch {
          try {
            const user = authService.getCurrentUser() || dataService.getCurrentUser();
            if (user && (user.location || user.state)) {
              const locationQuery = user.location && user.location !== 'India' 
                ? `${user.location}, ${user.state || 'IN'}`
                : user.state && user.state !== 'India'
                ? `${user.state}, IN`
                : null;
              if (locationQuery) {
                const userLocation = await weatherService.getWeatherByCity(locationQuery);
                setWeather(userLocation);
                return;
              }
            }
            const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
            setWeather(defaultWeather);
          } catch {
            const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
            setWeather(defaultWeather);
          }
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeather();
  }, []);

  // Calculate top price hikes dynamically
  const getTopPriceHikes = () => {
    const cropHikes: Array<{crop: string, price: string, trend: string, change: string, changePercent: number}> = [];
    marketData.forEach((market: any) => {
      market.crops?.forEach((crop: any) => {
        if (crop.trend === 'up') {
          const changePercent = parseInt(crop.change?.replace('%', '').replace('+', '') || '0');
          cropHikes.push({
            crop: crop.name,
            price: crop.price,
            trend: crop.trend,
            change: crop.change,
            changePercent
          });
        }
      });
    });
    
    const uniqueHikes = cropHikes.filter((crop, index, arr) => 
      arr.findIndex(c => c.crop === crop.crop) === index
    );
    
    return uniqueHikes.sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  };

  const marketPrices = getTopPriceHikes();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-28">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo & Greeting */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-white rounded-[13px] flex items-center justify-center p-0.5">
                <img 
                  src="/assets/kisanmitra-logo-clean.png" 
                  alt="KisanMitra Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-emerald-800 tracking-tight flex items-center gap-1">
                <span>{getGreeting()}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate tracking-tight">
                {userName}
              </h1>
            </div>
          </div>
          
          {/* Action Pills */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="glass-pill px-1 py-0.5">
              <LanguageSwitcher />
            </div>
            
            <button 
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              className="relative p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-90 shadow-sm"
            >
              <Bell className="w-4 h-4 text-emerald-800" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>

            <button 
              onClick={() => navigate('/profile')}
              aria-label="Profile"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-transform hover:shadow-emerald-500/20"
            >
              {userName ? userName.charAt(0).toUpperCase() : 'F'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Adaptive Responsive Container */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Top Section: Responsive Grid for Weather & AI Plant Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {/* Weather Glass Card */}
          <div 
            onClick={() => navigate('/weather')}
            className="cursor-pointer group relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/90 via-white/75 to-emerald-50/50 border border-white/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.14)] active:scale-[0.99] transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top highlight line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[220px]">
                    {weatherLoading ? 'Detecting location...' : weather?.location || 'India'}
                  </span>
                </div>
                <span className="glass-pill px-2.5 py-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1 group-hover:bg-emerald-500/10 transition-colors">
                  7-Day Forecast <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div className="flex items-center justify-between my-2">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl glass-panel p-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {weather && !weatherLoading ? (
                      <img 
                        src={weatherService.getWeatherIconUrl(weather.icon)} 
                        alt={weather.description}
                        className="w-10 h-10 object-contain drop-shadow"
                      />
                    ) : (
                      <Cloud className="w-9 h-9 text-sky-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      {weatherLoading ? '--°C' : `${weather?.temperature ?? 28}°C`}
                    </div>
                    <div className="text-xs font-medium text-slate-600 capitalize">
                      {weatherLoading ? 'Updating weather...' : weather?.description || 'Partly Cloudy'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pr-1">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                      <Droplets className="w-3 h-3 text-sky-500" /> Humidity
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {weatherLoading ? '--%' : `${weather?.humidity ?? 65}%`}
                    </div>
                  </div>

                  <div className="text-right pl-3 border-l border-emerald-100">
                    <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                      <Wind className="w-3 h-3 text-emerald-500" /> Wind
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {weatherLoading ? '--' : `${weather?.windSpeed ?? 12} km/h`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Optimal Spray Conditions
              </span>
              <span className="text-slate-400">Tap for full radar</span>
            </div>
          </div>

          {/* AI Plant Diagnosis - Hero Expo-Glass Card */}
          <div 
            onClick={() => navigate('/diagnose')}
            className="cursor-pointer group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white shadow-[0_12px_36px_-4px_rgba(16,185,129,0.4)] border border-emerald-400/40 transform active:scale-[0.99] transition-all duration-300 flex flex-col justify-between"
          >
            {/* Frosted glass internal lighting reflection */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold mb-2.5 border border-white/30">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>MobileNetV2 + Gemini AI</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1">
                    {t('home.diagnose_plant_health')}
                  </h2>
                  <p className="text-white/85 text-xs leading-relaxed max-w-sm">
                    {t('home.take_photo_check_diseases')}
                  </p>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                  <Camera className="w-8 h-8 text-white group-hover:rotate-6 transition-transform" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-white/90">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" /> 38 diseases & treatments
              </span>
              <span className="bg-white text-emerald-800 px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm group-hover:bg-emerald-50 active:scale-95 transition-all">
                Scan Leaf <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>

        {/* Quick Bento Actions Grid (2 cols mobile, 4 cols tablet/desktop) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-slate-800 tracking-tight uppercase tracking-wider text-[11px] text-slate-500">
              Quick Tools
            </h2>
            <span className="text-[11px] font-medium text-emerald-700">All features</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
            {/* Action 1: Soil Health */}
            <div 
              onClick={() => navigate('/soil-health')}
              className="cursor-pointer glass-card-interactive p-4 flex flex-col justify-between h-32 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-400/30 flex items-center justify-center text-amber-700 shadow-sm">
                  <TestTube className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t('home.soil_health')}</h3>
                <p className="text-[11px] text-slate-500">{t('home.check_nutrient_levels')}</p>
              </div>
            </div>

            {/* Action 2: Fertilizer Guide */}
            <div 
              onClick={() => navigate('/fertilizer-guide')}
              className="cursor-pointer glass-card-interactive p-4 flex flex-col justify-between h-32 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-700 shadow-sm">
                  <Beaker className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t('home.fertilizer_guide')}</h3>
                <p className="text-[11px] text-slate-500">{t('home.get_nutrient_advice')}</p>
              </div>
            </div>

            {/* Action 3: Mandi Prices */}
            <div 
              onClick={() => navigate('/market-prices')}
              className="cursor-pointer glass-card-interactive p-4 flex flex-col justify-between h-32 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-400/30 flex items-center justify-center text-blue-700 shadow-sm">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="glass-pill px-2 py-0.5 text-[9px] font-extrabold text-blue-700">LIVE</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t('home.todays_mandi_prices')}</h3>
                <p className="text-[11px] text-slate-500">Live commodity rates</p>
              </div>
            </div>

            {/* Action 4: Nearby Shops */}
            <div 
              onClick={() => navigate('/shops')}
              className="cursor-pointer glass-card-interactive p-4 flex flex-col justify-between h-32 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-400/30 flex items-center justify-center text-purple-700 shadow-sm">
                  <Store className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t('home.nearby_shops')}</h3>
                <p className="text-[11px] text-slate-500">{t('home.find_agri_stores')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row: Mandi Price Watch + My Farm in 2-Column Responsive Grid on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {/* Mandi Price Watch Glass Card */}
          <div className="glass-panel-elevated p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {t('home.todays_mandi_prices')}
                  </h2>
                  <p className="text-xs text-slate-500">Top market movers in your region</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {marketPrices.slice(0, 3).map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-white/60 shadow-sm hover:bg-white/90 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.crop}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span>↗ {t('home.trending_up')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 text-sm">{item.price}</div>
                      <div className="text-[11px] font-bold text-emerald-600">{item.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Button 
                onClick={() => navigate('/market-prices')}
                variant="glass"
                className="w-full h-11 text-xs font-bold text-emerald-800 rounded-xl border border-white/80 active:scale-95 transition-all"
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                <span>{t('home.see_prices')}</span>
              </Button>
              <Button 
                onClick={() => navigate('/sell')}
                className="w-full h-11 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-md active:scale-95 transition-all"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                <span>{t('home.sell_crops')}</span>
              </Button>
            </div>
          </div>

          {/* My Farm & Treatments Section */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t('home.sections.my_farm')}
              </h2>
            </div>

            <div className="space-y-2.5 flex-1 flex flex-col justify-between">
              <div 
                onClick={() => navigate('/treatments')}
                className="cursor-pointer glass-card-interactive p-4 flex items-center space-x-3.5 active:scale-98 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-700 relative flex-shrink-0">
                  <Activity className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{t('home.active_treatments')}</h3>
                  <p className="text-xs text-slate-500">2 {t('home.ongoing_sprays')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/guides')}
                className="cursor-pointer glass-card-interactive p-4 flex items-center space-x-3.5 active:scale-98 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{t('home.cultivation_guides')}</h3>
                  <p className="text-xs text-slate-500">{t('home.growing_tips')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div 
                onClick={() => navigate('/orders')}
                className="cursor-pointer glass-card-interactive p-4 flex items-center space-x-3.5 active:scale-98 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-400/30 flex items-center justify-center text-blue-700 flex-shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{t('home.my_orders')}</h3>
                  <p className="text-xs text-slate-500">{t('home.track_purchases')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Unified Floating Expo-Glass Bottom Navigation Dock */}
      <GlassBottomNav activeTab="home" />
    </div>
  );
};

export default Home;
