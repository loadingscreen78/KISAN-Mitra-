import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  MapPin,
  TrendingUp, 
  TrendingDown, 
  Bell,
  BellOff,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { marketData } from '@/lib/marketData';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation, calculateDistance, formatDistance } from '@/hooks/useGeolocation';

const MarketDetails = () => {
  const navigate = useNavigate();
  const { marketId } = useParams();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isNotificationEnabled, toggleNotification } = useNotifications();
  const { location, error: locationError, loading: locationLoading } = useGeolocation();
  
  const marketIdString = marketId || '1';
  const notificationsEnabled = isNotificationEnabled(marketIdString);

  // Using shared market data with complete vegetable lists for all Chennai markets

  const baseMarket = marketData.find(m => m.id === parseInt(marketId || '1'));
  
  // Calculate distance for this specific market
  const market = baseMarket ? {
    ...baseMarket,
    distance: location 
      ? formatDistance(calculateDistance(location.latitude, location.longitude, baseMarket.latitude, baseMarket.longitude))
      : locationError 
      ? 'Location unavailable'
      : locationLoading 
      ? 'Calculating...'
      : 'Enable location'
  } : null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Market not found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{market.name}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{market.location}</span>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {market.distance}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Notifications</span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={() => toggleNotification(marketIdString)}
                />
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-green-600" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <RefreshCw className="w-4 h-4 text-green-600" />
              </Button>
            </div>
            
            {/* Mobile notification toggle */}
            <div className="sm:hidden flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl">
              <span className="text-xs text-gray-600">Alerts</span>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={() => toggleNotification(marketIdString)}
              />
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 text-green-600" />
              ) : (
                <BellOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <Card className="bg-white rounded-3xl shadow-lg border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-6">
            <CardTitle className="text-lg font-bold text-gray-900">
              All Vegetables & Prices ({market.crops.length} items)
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Complete list of all available vegetables with current market prices
            </p>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-0">
              {market.crops.map((crop, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base">{crop.name}</h4>
                    <p className="text-sm text-gray-500">Previous: {crop.previousPrice}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{crop.price}</div>
                      <div className={`text-sm font-medium flex items-center space-x-1 ${getTrendColor(crop.trend)}`}>
                        {getTrendIcon(crop.trend)}
                        <span>{crop.change}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketDetails;