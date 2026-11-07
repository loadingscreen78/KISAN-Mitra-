import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Thermometer, Droplets, Wind, Eye, Sunrise, Sunset, AlertTriangle, RefreshCw, Sparkles, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { weatherService, WeatherData, DailyForecast } from '@/lib/weather';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';

const Weather = () => {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: 0, lon: 0 });

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const currentLocation = await weatherService.getCurrentLocation();
        setLocation(currentLocation);
        const [weather, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(currentLocation.lat, currentLocation.lon),
          weatherService.getForecast(currentLocation.lat, currentLocation.lon)
        ]);
        setCurrentWeather(weather);
        setForecast(forecastData);
        return;
      } catch (locationError) {
        try {
          const { authService } = await import('@/lib/authService');
          const { dataService } = await import('@/lib/dataService');
          let user = authService.getCurrentUser() || dataService.getCurrentUser();
          
          if (user && (user.location || user.state)) {
            const locationQuery = user.location && user.location !== 'India' 
              ? `${user.location}, ${user.state || 'IN'}`
              : user.state && user.state !== 'India'
              ? `${user.state}, IN`
              : null;
            
            if (locationQuery) {
              const userWeather = await weatherService.getWeatherByCity(locationQuery);
              setCurrentWeather(userWeather);
              const coordinates = await getCoordinatesForLocation(locationQuery);
              if (coordinates) {
                const userForecast = await weatherService.getForecast(coordinates.lat, coordinates.lon);
                setForecast(userForecast);
                setLocation(coordinates);
              }
              return;
            }
          }
          const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
          const defaultForecast = await weatherService.getForecast(13.0827, 80.2707);
          setCurrentWeather(defaultWeather);
          setForecast(defaultForecast);
        } catch {
          const defaultWeather = await weatherService.getWeatherByCity('Chennai, IN');
          const defaultForecast = await weatherService.getForecast(13.0827, 80.2707);
          setCurrentWeather(defaultWeather);
          setForecast(defaultForecast);
        }
      }
    } catch (err) {
      setError('Unable to fetch weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCoordinatesForLocation = async (locationQuery: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`,
        { headers: { 'User-Agent': 'KisanMitra/1.0' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return { lat: 13.0827, lon: 80.2707 };
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-50/40 via-background to-emerald-50/20 pb-32">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Weather & Spray Forecast
            </h1>
          </div>
          
          <button
            onClick={loadWeatherData}
            aria-label="Refresh"
            className="p-2.5 glass-panel rounded-full hover:bg-white/90 text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-800 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {loading ? (
          <div className="glass-panel-elevated p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Fetching live radar forecast...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-6 text-center space-y-3 border-red-200">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={loadWeatherData} variant="glass">Try Again</Button>
          </div>
        ) : (
          <>
            {/* Celestial Hero Weather Card in Expo Glass */}
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

                {/* Micro Stats Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/20 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Droplets className="w-4 h-4 text-sky-300" />
                    <span>Humidity: <b>{currentWeather.humidity}%</b></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Wind className="w-4 h-4 text-teal-300" />
                    <span>Wind: <b>{currentWeather.windSpeed} m/s</b></span>
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
              <div className="tip-card p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-0.5">
                    Farming & Spray Advisory
                  </h3>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    {weatherService.generateFarmingAdvice(currentWeather)}
                  </p>
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            <div className="space-y-3 pt-1">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                7-Day Weather Outlook
              </h2>

              <div className="space-y-2">
                {forecast.map((day, index) => (
                  <div
                    key={day.date}
                    className="glass-card-interactive p-3.5 flex items-center justify-between"
                  >
                    <div className="w-16 font-bold text-sm text-slate-800">
                      {index === 0 ? 'Today' : day.dayName.slice(0, 3)}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white/80 border border-white/60 flex items-center justify-center shadow-inner">
                      <img
                        src={weatherService.getWeatherIconUrl(day.icon)}
                        alt={day.description}
                        className="w-7 h-7 object-contain"
                      />
                    </div>

                    <div className="text-center flex-1 px-3">
                      <div className="text-xs font-bold text-slate-800">
                        {day.temperature.max}° / <span className="text-slate-500 font-normal">{day.temperature.min}°</span>
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize truncate max-w-[110px] mx-auto">
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
          </>
        )}
      </main>

      {/* Unified Bottom Navigation */}
      <GlassBottomNav activeTab="home" />
    </div>
  );
};

export default Weather;
