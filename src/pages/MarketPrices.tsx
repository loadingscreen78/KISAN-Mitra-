import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  ArrowLeft,
  MapPin,
  Clock,
  RefreshCw,
  Store,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AmbientBackground from '@/components/AmbientBackground';
import { marketData, getTopHighestPricedCrops } from '@/lib/marketData';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation, calculateDistance, formatDistance } from '@/hooks/useGeolocation';

const MarketPrices = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isNotificationEnabled } = useNotifications();
  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  // Calculate distances for all markets based on user location
  const marketsWithDistance = marketData.map(market => ({
    ...market,
    distance: location 
      ? formatDistance(calculateDistance(location.latitude, location.longitude, market.latitude, market.longitude))
      : locationError 
      ? 'Location unavailable'
      : locationLoading 
      ? 'Calculating...'
      : 'Enable location'
  }));

  const filteredMarkets = marketsWithDistance.filter(market => 
    market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.crops.some(crop => crop.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20';
      case 'down':
        return 'text-rose-700 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-28">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="p-2.5 glass-panel rounded-full hover:bg-white text-slate-700 transition-all active:scale-90 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-900" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Market Mandi Rates
                </h1>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 glass-panel rounded-full hover:bg-white text-slate-700 transition-all active:scale-90 shadow-sm"
              title="Refresh rates"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Search crops (e.g. Tomato, Garlic) or Mandis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 h-11 rounded-2xl glass-input text-sm text-slate-900 placeholder:text-slate-400 shadow-inner focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </header>

      {/* Main Content - Adaptive Grid */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Quick Highlights Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-panel p-3.5 rounded-2xl border border-white/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Markets Listed</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{marketData.length} Mandis</div>
          </div>
          <div className="glass-panel p-3.5 rounded-2xl border border-white/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top Gainer</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">+14% Garlic</div>
          </div>
          <div className="glass-panel p-3.5 rounded-2xl border border-white/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Data Source</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">Agmarknet Live</div>
          </div>
          <div className="glass-panel p-3.5 rounded-2xl border border-white/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Your Region</div>
            <div className="text-xl font-black text-emerald-800 mt-0.5 truncate">
              {locationLoading ? 'Locating...' : 'Tamil Nadu'}
            </div>
          </div>
        </div>

        {/* Markets List */}
        <div className="space-y-5">
          {filteredMarkets.map((market) => (
            <div 
              key={market.id} 
              className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgba(16,185,129,0.08)] transition-all"
            >
              {/* Market Header */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-100/60 p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-2xl glass-panel bg-white/90 text-emerald-700 shadow-sm border border-emerald-100 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {market.name}
                    </h2>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span>{market.location}</span>
                      <span>•</span>
                      <span className="glass-pill px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {market.distance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => navigate(`/market-details/${market.id}`)}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-700 glass-pill px-3 py-1.5 hover:bg-emerald-500/10 transition-colors"
                  >
                    View All Crops <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Crops Grid inside Market */}
              <div className="divide-y divide-slate-100/80">
                {getTopHighestPricedCrops(market.crops).map((crop, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-white/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {crop.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Previous: <span className="font-medium text-slate-600">{crop.previousPrice}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-5 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-black text-base sm:text-lg text-slate-900">
                          {crop.price}
                        </div>
                        <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getTrendColor(crop.trend)}`}>
                          {getTrendIcon(crop.trend)}
                          <span>{crop.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* More Info Footer */}
              <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 pl-2">Updated today via APMC database</span>
                <Button
                  variant="glass"
                  size="sm"
                  className="rounded-xl text-xs font-bold text-emerald-800 border-white/80 shadow-sm"
                  onClick={() => navigate(`/market-details/${market.id}`)}
                >
                  Market Details & Map
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}

          {/* No Results */}
          {filteredMarkets.length === 0 && (
            <div className="text-center py-16 glass-panel-elevated rounded-3xl p-8">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No markets or crops found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No matching results for "{searchQuery}". Try searching for Tomato, Onion, Garlic or Chennai.
              </p>
              <Button 
                onClick={() => setSearchQuery('')}
                variant="outline"
                size="sm"
                className="mt-4 rounded-xl text-xs"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MarketPrices;
