import React, { useState, useEffect } from "react";
import { User, Phone, Sprout } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CustomInput from '@/components/CustomInput';
import LocationPicker from '@/components/LocationPicker';
import PINInput from '@/components/PINInput';
import AuthButton from '@/components/AuthButton';
import { authService } from '@/lib/authService';


const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    state: "Tamil Nadu",
    district: "Chennai",
    pin: "",
    confirmPin: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validation functions
  const getNameValidation = () => {
    if (formData.name.length === 0) return undefined;
    const isValid = formData.name.trim().length >= 2 && /^[A-Za-z\s]+$/.test(formData.name);
    return {
      isValid,
      message: isValid ? "Valid name" : "Name must contain only letters and be at least 2 characters"
    };
  };

  const getMobileValidation = () => {
    if (formData.mobile.length === 0) return undefined;
    const isValid = formData.mobile.length === 10 && /^[6-9]\d{9}$/.test(formData.mobile);
    return {
      isValid,
      message: isValid ? "Valid mobile number" : "Enter a valid 10-digit Indian mobile number"
    };
  };

  const isFormValid = () => {
    return formData.name.trim() !== "" &&
           formData.mobile.length === 10 &&
           formData.state !== "" &&
           formData.district.trim() !== "" &&
           formData.pin.length === 4 &&
           formData.confirmPin.length === 4 &&
           formData.pin === formData.confirmPin;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.pin !== formData.confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PIN and Confirm PIN must match",
        variant: "destructive"
      });
      return;
    }
    
    if (!isFormValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Register user with backend API
      const registerResult = await authService.registerWithPhone(
        formData.mobile,
        formData.pin,
        formData.name.trim(),
        formData.district.trim() || 'Chennai',
        formData.state || 'Tamil Nadu'
      );
      
      if (registerResult.success) {
        // Successful registration
        const welcomeToast = toast({
          title: "Account Created! 🎉",
          description: `Welcome to KisanMitra, ${formData.name}!`,
          duration: 10000,
        });
        
        // Dismiss on any interaction
        let isToastDismissed = false;
        const handleInteraction = () => {
          if (!isToastDismissed) {
            isToastDismissed = true;
            welcomeToast.dismiss();
            cleanupListeners();
          }
        };
        
        const cleanupListeners = () => {
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('keydown', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };
        
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
        
        // Cleanup listeners after 10 seconds (when toast auto-dismisses)
        setTimeout(() => {
          isToastDismissed = true;
          cleanupListeners();
        }, 10000);
        
        navigate("/home");
      } else {
        // Registration failed - show detailed error
        const errorMessage = registerResult.details 
          ? `${registerResult.message || "Registration failed"}: ${registerResult.details}`
          : registerResult.message || "Unable to create account. Please try again.";
        
        console.error("Registration error details:", registerResult);
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-gradient-to-br from-agri-light to-white overflow-y-auto">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center p-1">
              <img 
                src="/assets/kisanmitra-logo-clean.png" 
                alt="KisanMitra Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-green-900">KisanMitra</h1>
              <p className="text-xs text-green-700">Smart Farming Assistant</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center px-6 pt-8 pb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl">
            <Sprout className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-3">
            🌱 Join 50,000+ Smart Farmers
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-2">
            Create your farming account
          </p>
          <p className="text-sm text-green-600 font-medium">
            Location helps us provide region-based crop advice
          </p>
        </div>

          {/* Form */}
          <div className="flex-1 px-6">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <User className="w-5 h-5 text-green-500" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full h-14 pl-12 pr-4 text-lg font-medium bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                    />
                  </div>
                  {getNameValidation() && (
                    <p className={`text-sm ${getNameValidation()?.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {getNameValidation()?.message}
                    </p>
                  )}
                </div>

                {/* Mobile Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 z-10">
                      <Phone className="w-5 h-5 text-green-500" />
                      <span className="text-gray-500 font-medium">🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10 digit number"
                      className="w-full h-14 pl-24 pr-4 text-lg font-medium bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                    />
                  </div>
                  {getMobileValidation() && (
                    <p className={`text-sm ${getMobileValidation()?.isValid ? 'text-green-600' : 'text-red-500'}`}>
                      {getMobileValidation()?.message}
                    </p>
                  )}
                </div>

                {/* Location Fields */}
                <LocationPicker
                  state={formData.state}
                  district={formData.district}
                  onStateChange={(value) => handleInputChange("state", value)}
                  onDistrictChange={(value) => handleInputChange("district", value)}
                />

                {/* PIN Entry */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">4-Digit PIN</label>
                    <PINInput
                      value={formData.pin}
                      onChange={(value) => handleInputChange("pin", value)}
                      placeholder="Create PIN"
                      showStrengthIndicator={true}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Confirm PIN</label>
                    <PINInput
                      value={formData.confirmPin}
                      onChange={(value) => handleInputChange("confirmPin", value)}
                      placeholder="Confirm PIN"
                    />
                    {formData.confirmPin.length > 0 && (
                      <p className={`text-sm ${formData.pin === formData.confirmPin ? 'text-green-600' : 'text-red-500'}`}>
                        {formData.pin === formData.confirmPin ? "✓ PINs match" : "✗ PINs don't match"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Create Account Button - Full Width Green Gradient */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create My Account'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Login Link */}
            <div className="text-center mt-6 mb-6">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-green-600 font-bold hover:text-green-700 hover:underline transition-colors"
                >
                  Login →
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Signup;