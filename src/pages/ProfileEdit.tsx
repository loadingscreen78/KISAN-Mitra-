import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Camera,
  User,
  Phone, 
  MapPin, 
  Calendar,
  Mail,
  Sprout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import CustomInput from '@/components/CustomInput';
import LocationPicker from '@/components/LocationPicker';
import { useGoBack } from '@/hooks/useGoBack';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    location: '',
    state: '',
    district: '',
    pincode: '',
    farmSize: '',
    experience: '',
    crops: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load current user data
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const currentUser = localStorage.getItem('kisanmitra_user');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          setUserData({
            name: user.name || '',
            phone: user.phone || (user.mobile ? `+91 ${user.mobile}` : ''),
            email: user.email || '',
            birthDate: user.birthDate || '',
            location: user.location || user.district || '',
            state: user.state || '',
            district: user.district || user.location || '',
            pincode: user.pincode || '',
            farmSize: user.farmSize || '',
            experience: user.experience || '',
            crops: user.crops || ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const getNameValidation = () => {
    if (userData.name.length === 0) return undefined;
    const isValid = userData.name.trim().length >= 2;
    return {
      isValid,
      message: isValid ? "Valid name" : "Name must be at least 2 characters"
    };
  };

  const getPhoneValidation = () => {
    if (userData.phone.length === 0) return undefined;
    const phoneNumber = userData.phone.replace(/\D/g, '');
    const isValid = phoneNumber.length === 12 && phoneNumber.startsWith('91');
    return {
      isValid,
      message: isValid ? "Valid phone number" : "Enter a valid Indian mobile number"
    };
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!userData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive"
        });
        return;
      }

      // Get current user data and update it
      const currentUser = JSON.parse(localStorage.getItem('kisanmitra_user') || '{}');
      const phoneNumber = userData.phone.replace(/\D/g, '').replace(/^91/, '');
      
      const updatedUser = {
        ...currentUser,
        name: userData.name.trim(),
        phone: userData.phone,
        mobile: phoneNumber,
        email: userData.email,
        birthDate: userData.birthDate,
        location: userData.location || userData.district,
        state: userData.state,
        district: userData.district || userData.location,
        pincode: userData.pincode,
        farmSize: userData.farmSize,
        experience: userData.experience,
        crops: userData.crops,
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('kisanmitra_user', JSON.stringify(updatedUser));
      
      // Also update auth token if phone changed
      if (currentUser.pin) {
        const authToken = btoa(`${phoneNumber}:${currentUser.pin}`);
        localStorage.setItem('kisanmitra_auth_token', authToken);
      }
      
      toast({
        title: "Profile Updated! ✅",
        description: "Your profile has been successfully updated."
      });
      
      goBack('/profile');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="mobile-container bg-background">
      {/* Header */}
      <div className="mobile-header bg-white">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => goBack('/profile')}
            className="w-10 h-10 bg-agri-light rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-agri-accent" />
          </button>
          <h1 className="text-xl font-bold text-agri-accent">Edit Profile</h1>
        </div>
        
        <Button 
          onClick={handleSave}
          className="bg-agri-primary hover:bg-agri-secondary text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="mobile-content space-y-6 pt-4">
        {/* Profile Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="text-center">
            <div className="w-20 h-20 bg-agri-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              RJ
            </div>
            <Button variant="outline" className="border-agri-primary text-agri-primary">
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-5 h-5 text-agri-primary" />
            <h3 className="text-lg font-bold text-agri-accent">Personal Information</h3>
          </div>

          <div className="space-y-4">
            <CustomInput
              label="Full Name"
              icon={<User className="w-5 h-5" />}
              value={userData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              type="text"
              validation={getNameValidation()}
              required
            />

            <CustomInput
              label="Mobile Number"
              icon={<Phone className="w-5 h-5" />}
              value={userData.phone.replace(/^\+91\s?/, '').replace(/\D/g, '')}
              onChange={(value) => handleInputChange('phone', `+91 ${value.replace(/\D/g, '')}`)}
              placeholder="Enter 10 digit mobile"
              type="tel"
              prefix="🇮🇳 +91"
              maxLength={10}
              validation={getPhoneValidation()}
              required
            />

            <div>
              <Label htmlFor="email" className="text-agri-accent font-medium">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="mt-2 border-agri-primary/20 focus:border-agri-primary"
              />
            </div>

            <div>
              <Label htmlFor="birthDate" className="text-agri-accent font-medium">Date of Birth</Label>
              <Input
                id="birthDate"
                type="date"
                value={userData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="mt-2 border-agri-primary/20 focus:border-agri-primary"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="w-5 h-5 text-agri-primary" />
            <h3 className="text-lg font-bold text-agri-accent">Location Details</h3>
          </div>

          <LocationPicker
            state={userData.state}
            district={userData.district}
            onStateChange={(value) => handleInputChange('state', value)}
            onDistrictChange={(value) => handleInputChange('district', value)}
          />

          <div className="mt-4">
            <Label htmlFor="pincode" className="text-agri-accent font-medium">PIN Code (Optional)</Label>
            <Input
              id="pincode"
              value={userData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit PIN code"
              maxLength={6}
              className="mt-2 border-agri-primary/20 focus:border-agri-primary"
            />
          </div>
        </div>

        {/* Farm Information */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center space-x-2 mb-6">
            <Sprout className="w-5 h-5 text-agri-primary" />
            <h3 className="text-lg font-bold text-agri-accent">Farm Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="farmSize" className="text-agri-accent font-medium">Farm Size (Optional)</Label>
              <Input
                id="farmSize"
                value={userData.farmSize}
                onChange={(e) => handleInputChange('farmSize', e.target.value)}
                placeholder="e.g., 2.5 acres, 1 hectare"
                className="mt-2 border-agri-primary/20 focus:border-agri-primary"
              />
            </div>

            <div>
              <Label htmlFor="experience" className="text-agri-accent font-medium">Farming Experience (Optional)</Label>
              <Input
                id="experience"
                value={userData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 5 years, New farmer"
                className="mt-2 border-agri-primary/20 focus:border-agri-primary"
              />
            </div>

            <div>
              <Label htmlFor="crops" className="text-agri-accent font-medium">Primary Crops (Optional)</Label>
              <Input
                id="crops"
                value={userData.crops}
                onChange={(e) => handleInputChange('crops', e.target.value)}
                placeholder="e.g., Rice, Wheat, Tomato"
                className="mt-2 border-agri-primary/20 focus:border-agri-primary"
              />
            </div>
          </div>
        </div>


        {/* Save Button */}
        <div className="pb-8">
          <Button 
            onClick={handleSave}
            className="w-full bg-agri-primary hover:bg-agri-secondary text-white h-12 text-lg font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;