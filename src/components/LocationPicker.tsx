import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocation from '@/hooks/useLocation';
import LocationPermissionModal from './LocationPermissionModal';

interface LocationPickerProps {
  state: string;
  district: string;
  onStateChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  className?: string;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Puducherry", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu",
  "Lakshadweep", "Ladakh", "Jammu and Kashmir"
];

const LocationPicker: React.FC<LocationPickerProps> = ({
  state,
  district,
  onStateChange,
  onDistrictChange,
  className = ""
}) => {
  const {
    loading,
    data,
    error,
    permissionStatus,
    getCurrentLocation,
    retryLocation,
    getAccuracyLevel,
    hasValidLocation,
    stateDistrictMapping
  } = useLocation();

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [autoLocationAttempted, setAutoLocationAttempted] = useState(false);
  const [isSignupFlow, setIsSignupFlow] = useState(false);

  // Auto-detect location on component mount (for signup flow)
  useEffect(() => {
    // Check if this is likely a signup flow (no existing state/district values)
    const isLikelySignup = !state && !district;
    setIsSignupFlow(isLikelySignup);
    
    // Auto-attempt location detection for signup flow if not already attempted
    if (isLikelySignup && !autoLocationAttempted && permissionStatus !== 'denied' && !useManualEntry) {
      console.log('Auto-attempting location detection for signup...');
      setAutoLocationAttempted(true);
      
      // Add a small delay to ensure component is fully mounted
      setTimeout(() => {
        getCurrentLocation().catch((error) => {
          console.log('Auto location detection failed:', error);
          // Don't set useManualEntry to true automatically, let user decide
        });
      }, 500);
    }
  }, [getCurrentLocation, autoLocationAttempted, permissionStatus, useManualEntry, state, district]);

  // Auto-fill when location data is available (fixed to prevent infinite loop)
  useEffect(() => {
    if (data?.state && data?.district && !useManualEntry) {
      // Only update if values are different to prevent infinite loops
      if (state !== data.state) {
        onStateChange(data.state);
      }
      if (district !== data.district) {
        onDistrictChange(data.district);
      }
    }
    // Exclude handler functions from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.state, data?.district, useManualEntry, state, district]);

  const handleLocationRequest = async () => {
    setShowPermissionModal(false);
    setAutoLocationAttempted(true);
    
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Location request failed:', error);
    }
  };

  const handleSkipLocation = () => {
    setShowPermissionModal(false);
    setUseManualEntry(true);
  };

  const handleUseCurrentLocation = () => {
    if (permissionStatus === 'prompt' || permissionStatus === 'denied') {
      setShowPermissionModal(true);
    } else {
      getCurrentLocation();
    }
  };

  const getAccuracyIndicator = () => {
    if (!data) return null;
    
    // Simple accuracy determination based on available data
    const accuracy = data.accuracy || (data.state && data.district ? 'high' : 'medium');
    const colors = {
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-orange-600'
    };

    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          accuracy === 'high' ? 'bg-green-500' : 
          accuracy === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'
        }`} />
        <span className={`text-xs ${colors[accuracy] || colors['low']}`}>
          {accuracy === 'high' ? 'High accuracy' : 
           accuracy === 'medium' ? 'Medium accuracy' : 'Low accuracy'}
        </span>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Location Detection Section */}
      {!useManualEntry && (
        <div className="bg-agri-light/30 rounded-2xl p-4 border border-agri-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-agri-primary" />
              <span className="font-semibold text-agri-primary">Auto Location</span>
            </div>
            
            {hasValidLocation && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>

          {loading && (
            <div className="flex items-center space-x-3 py-2">
              <RefreshCw className="w-4 h-4 text-agri-primary animate-spin" />
              <span className="text-sm text-agri-gray">Detecting your location...</span>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-2 py-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hasValidLocation && data && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-agri-gray">Detected Location:</span>
                {getAccuracyIndicator()}
              </div>
              <div className="text-sm font-medium text-agri-primary">
                📍 {data.district}, {data.state}
              </div>
            </div>
          )}

          <div className="flex space-x-2 mt-3">
            <Button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex-1 h-10 border-agri-primary/50 text-agri-primary hover:bg-agri-primary hover:text-white rounded-xl"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {loading ? 'Locating...' : 'Use Current Location'}
            </Button>

            {hasValidLocation && (
              <Button
                type="button"
                onClick={retryLocation}
                variant="outline"
                size="sm"
                className="h-10 border-agri-primary/50 text-agri-primary hover:bg-agri-primary hover:text-white rounded-xl px-3"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="button"
              onClick={() => setUseManualEntry(true)}
              variant="outline"
              size="sm"
              className="h-10 border-agri-primary/50 text-agri-primary hover:bg-agri-primary hover:text-white rounded-xl px-3"
            >
              Manual
            </Button>
          </div>
        </div>
      )}

      {/* Manual Entry Section */}
      {(useManualEntry || (!hasValidLocation && autoLocationAttempted)) && (
        <>
          {/* State Field */}
          <div className="space-y-2">
            <label className="text-lg font-bold text-agri-primary flex items-center">
              <MapPin className="w-6 h-6 mr-3" />
              State
              {!useManualEntry && <span className="text-sm font-normal text-agri-gray ml-2">(Manual Entry)</span>}
            </label>
            <Select onValueChange={onStateChange} value={state}>
              <SelectTrigger className="h-16 text-xl rounded-2xl border-2 border-agri-primary/30 focus:border-agri-primary bg-agri-light/30 font-semibold">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-agri-primary/20 shadow-large rounded-lg max-h-48">
                {indianStates.map((stateName) => (
                  <SelectItem 
                    key={stateName} 
                    value={stateName}
                    className="text-lg py-3 px-4 hover:bg-agri-light"
                  >
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Field */}
          <div className="space-y-2">
            <label className="text-lg font-bold text-agri-primary flex items-center">
              <MapPin className="w-6 h-6 mr-3" />
              District
            </label>
            <Input
              type="text"
              placeholder="Enter your district name"
              value={district}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="h-16 text-xl rounded-2xl border-2 border-agri-primary/30 focus:border-agri-primary bg-agri-light/30 font-semibold"
            />
            
            {/* District suggestions if state is selected */}
            {state && stateDistrictMapping[state] && (
              <div className="mt-2">
                <p className="text-sm text-agri-gray mb-2">Popular districts in {state}:</p>
                <div className="flex flex-wrap gap-2">
                  {stateDistrictMapping[state].slice(0, 4).map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => onDistrictChange(dist)}
                      className="px-3 py-1 text-sm bg-agri-light text-agri-primary rounded-lg hover:bg-agri-primary hover:text-white transition-colors"
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {useManualEntry && (
            <Button
              type="button"
              onClick={() => {
                setUseManualEntry(false);
                setAutoLocationAttempted(false);
                handleUseCurrentLocation();
              }}
              variant="outline"
              size="sm"
              className="w-full h-10 border-agri-primary/50 text-agri-primary hover:bg-agri-primary hover:text-white rounded-xl"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Try Auto Location Again
            </Button>
          )}
        </>
      )}

      <LocationPermissionModal
        isOpen={showPermissionModal}
        onRequestPermission={handleLocationRequest}
        onSkip={handleSkipLocation}
        permissionStatus={permissionStatus}
      />
    </div>
  );
};

export default LocationPicker;