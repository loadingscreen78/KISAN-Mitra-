import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  accuracy: number;
}

interface LocationState {
  loading: boolean;
  data: LocationData | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

// Indian states and districts mapping for reverse geocoding fallback
const stateDistrictMapping: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur", "Ajmer"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak"]
};

const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    loading: false,
    data: null,
    error: null,
    permissionStatus: 'prompt'
  });

  const checkPermissionStatus = async (): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> => {
    if (!navigator.geolocation) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<{ state: string; district: string }> => {
    try {
      // Using a free geocoding service (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'KisanMitra/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      const address = data.address;
      
      let state = address.state || address.province || '';
      let district = address.city || address.town || address.village || address.suburb || '';

      // Fallback: Try to match with Indian states if exact match not found
      if (!state || !Object.keys(stateDistrictMapping).includes(state)) {
        // Simple matching logic for Indian context
        const stateName = Object.keys(stateDistrictMapping).find(s => 
          state.toLowerCase().includes(s.toLowerCase()) || 
          s.toLowerCase().includes(state.toLowerCase())
        );
        if (stateName) {
          state = stateName;
        }
      }

      return { 
        state: state || 'Unknown State', 
        district: district || 'Unknown District' 
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return { state: 'Unknown State', district: 'Unknown District' };
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const permissionStatus = await checkPermissionStatus();
      setLocationState(prev => ({ ...prev, permissionStatus }));

      if (permissionStatus === 'denied') {
        throw new Error('Location access denied. Please enable location services and try again.');
      }

      if (permissionStatus === 'unsupported') {
        throw new Error('Location services are not supported by your device.');
      }

      return new Promise((resolve, reject) => {
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              const { state, district } = await reverseGeocode(latitude, longitude);

              const locationData: LocationData = {
                latitude,
                longitude,
                state,
                district,
                accuracy
              };

              setLocationState(prev => ({
                ...prev,
                loading: false,
                data: locationData,
                error: null,
                permissionStatus: 'granted'
              }));

              // Cache the location data
              localStorage.setItem('kisanmitra_location', JSON.stringify({
                ...locationData,
                timestamp: Date.now()
              }));

              resolve();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to get location details';
              setLocationState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
              }));
              reject(new Error(errorMessage));
            }
          },
          (error) => {
            let errorMessage = 'Unable to retrieve your location. ';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage += 'Location access denied.';
                setLocationState(prev => ({ ...prev, permissionStatus: 'denied' }));
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += 'Location information unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage += 'Location request timed out.';
                break;
              default:
                errorMessage += 'An unknown error occurred.';
                break;
            }

            setLocationState(prev => ({
              ...prev,
              loading: false,
              error: errorMessage
            }));
            reject(new Error(errorMessage));
          },
          options
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Location access failed';
      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const loadCachedLocation = (): boolean => {
    try {
      const cached = localStorage.getItem('kisanmitra_location');
      if (cached) {
        const { timestamp, ...locationData } = JSON.parse(cached);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - timestamp < fiveMinutes) {
          setLocationState(prev => ({
            ...prev,
            data: locationData,
            permissionStatus: 'granted'
          }));
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load cached location:', error);
    }
    return false;
  };

  const clearLocation = () => {
    setLocationState({
      loading: false,
      data: null,
      error: null,
      permissionStatus: 'prompt'
    });
    localStorage.removeItem('kisanmitra_location');
  };

  const retryLocation = () => {
    getCurrentLocation();
  };

  const getAccuracyLevel = (accuracy: number): 'high' | 'medium' | 'low' => {
    if (accuracy <= 100) return 'high';
    if (accuracy <= 1000) return 'medium';
    return 'low';
  };

  useEffect(() => {
    // Try to load cached location on mount
    loadCachedLocation();
  }, []);

  return {
    ...locationState,
    getCurrentLocation,
    retryLocation,
    clearLocation,
    getAccuracyLevel: locationState.data ? getAccuracyLevel(locationState.data.accuracy) : null,
    hasValidLocation: !!locationState.data && !locationState.error,
    stateDistrictMapping
  };
};

export default useLocation;