import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Sunrise, 
  Sunset, 
  RefreshCw, 
  Sparkles, 
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { weatherService, WeatherData, DailyForecast } from '@/lib/weather';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';
import { authService } from '@/lib/authService';

const INDIAN_REGIONS = [
  'Punjab',
  'Tamil Nadu',
  'Maharashtra',
  'Uttar Pradesh',
  'Gujarat',
  'Karnataka',
  'Haryana',
  'Madhya Pradesh'
];

const Weather = () => {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('Punjab');

  const loadWeatherData = async (regionOverride?: string) => {
    setLoading(true);
    try {
      const targetRegion = regionOverride || selectedRegion;

      // Try quick GPS or user profile
      try {
        const coords = await weatherService.getCurrentLocation();
        const [weather, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(coords.lat, coords.lon, targetRegion),
          weatherService.getForecast(coords.lat, coords.lon)
        ]);
        setCurrentWeather(weather);
        setForecast(forecastData);
      } catch {
        // Fallback or specified region
        const [weather, forecastData] = await Promise.all([
          weatherService.getWeatherByCity(targetRegion),
          weatherService.getForecast(28.6139, 77.2090)
        ]);
        setCurrentWeather(weather);
        setForecast(forecastData);
      }
    } catch (err) {
      console.error('Weather load notice:', err);
      setCurrentWeather(weatherService.generateFallbackWeather(selectedRegion));
      setForecast(weatherService.generateFallbackForecast());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user has state in profile
    try {
      const user = authService.getCurrentUser();
      if (user && user.state && user.state !== 'India') {
        setSelectedRegion(user.state);
        loadWeatherData(user.state);
        return;
      }
    } catch {
      // Ignore
    }
    loadWeatherData();
  }, []);

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    loadWeatherData(region);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/20 pb-36">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-3xl bg-white/80 border-b border-white/60 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            aria-label="Back"
            className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center">
              <CloudSun className="w-4 h-4" />
            </div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Weather & Spray Forecast
            </h1>
          </div>
          
          <button
            onClick={() => loadWeatherData()}
            aria-label="Refresh"
            className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-800 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Unified Responsive Shell */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* State/Region Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap pl-1">
            Region:
          </span>
          {INDIAN_REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => handleSelectRegion(region)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                selectedRegion === region
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md border border-emerald-400/40'
                  : 'glass-panel text-slate-600 hover:text-emerald-700 hover:bg-white/90'
              }`}
            >
              📍 {region}
            </button>
          ))}
        </div>

        {/* Responsive Grid on Tablet / Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Left Column (md:col-span-6): Hero Weather Card & Spray Advisory */}
          <div className="md:col-span-6 space-y-4">
            {/* Celestial Current Weather Card */}
            {currentWeather && (
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white shadow-[0_16px_40px_rgba(37,99,235,0.3)] border border-white/30">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-sky-100 font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-300" />
                      <span>{currentWeather.location}</span>
                    </div>
                    <div className="text-4xl font-black tracking-tight">
                      {currentWeather.temperature}°C
                    </div>
                    <div className="text-xs text-sky-200 mt-1 capitalize font-medium">
                      {currentWeather.description} • Feels like {currentWeather.feelsLike}°C
                    </div>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center p-2 shadow-inner">
                    <img
                      src={weatherService.getWeatherIconUrl(currentWeather.icon)}
                      alt={currentWeather.description}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>

                {/* Weather Metrics */}
                <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/20 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Droplets className="w-4 h-4 text-sky-300" />
                    <span>Humidity: <b>{currentWeather.humidity}%</b></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Wind className="w-4 h-4 text-teal-300" />
                    <span>Wind: <b>{currentWeather.windSpeed} km/h</b></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Thermometer className="w-4 h-4 text-amber-300" />
                    <span>Pressure: <b>{currentWeather.pressure} hPa</b></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Eye className="w-4 h-4 text-emerald-300" />
                    <span>Visibility: <b>{currentWeather.visibility} km</b></span>
                  </div>
                </div>

                {/* Sun Timings */}
                <div className="relative z-10 flex items-center justify-between mt-3 pt-3 border-t border-white/20 text-[11px] text-sky-100">
                  <span className="flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-amber-300" />
                    Sunrise {formatTime(currentWeather.sunrise)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sunset className="w-3.5 h-3.5 text-orange-300" />
                    Sunset {formatTime(currentWeather.sunset)}
                  </span>
                </div>
              </div>
            )}

            {/* Farming Spray Advice Card */}
            {currentWeather && (
              <div className="tip-card p-5 space-y-2 border border-amber-300/40">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Farming & Spray Advisory</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed font-medium">
                  {weatherService.generateFarmingAdvice(currentWeather)}
                </p>
                <div className="pt-2 flex items-center gap-3 text-[11px] text-amber-900 font-bold border-t border-amber-300/30">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Safe Spray Window
                  </span>
                  <span>•</span>
                  <span>Good Soil Moisture</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (md:col-span-6): 7-Day Forecast */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                7-Day Agricultural Outlook
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 glass-pill px-2.5 py-0.5">
                Next 7 Days
              </span>
            </div>

            <div className="space-y-2">
              {forecast.map((day, index) => (
                <div
                  key={day.date}
                  className="glass-card-interactive p-3.5 flex items-center justify-between"
                >
                  <div className="w-16 font-extrabold text-sm text-slate-800">
                    {index === 0 ? 'Today' : day.dayName}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/60 flex items-center justify-center shadow-inner">
                    <img
                      src={weatherService.getWeatherIconUrl(day.icon)}
                      alt={day.description}
                      className="w-7 h-7 object-contain"
                    />
                  </div>

                  <div className="text-center flex-1 px-3">
                    <div className="text-xs font-black text-slate-900">
                      {day.temperature.max}° / <span className="text-slate-500 font-normal">{day.temperature.min}°</span>
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize truncate max-w-[130px] mx-auto">
                      {day.description}
                    </div>
                  </div>

                  <div className="text-right text-xs font-bold text-emerald-700 glass-pill px-2.5 py-1">
                    💧 {day.humidity}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Unified Bottom Navigation */}
      <GlassBottomNav activeTab="home" />
    </div>
  );
};

export default Weather;
