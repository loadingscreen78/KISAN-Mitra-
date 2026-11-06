import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Sprout, User } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';
import CustomInput from '@/components/CustomInput';
import PINInput from '@/components/PINInput';
import AuthButton from '@/components/AuthButton';
import { authService } from '@/lib/authService';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '93477500071',
    pin: '1234'
  });

  const getMobileValidation = () => {
    if (formData.mobile.length === 0) return undefined;
    // Allow standard 10-digit Indian mobiles, plus the temporary default demo number
    const isTenDigitValid = formData.mobile.length === 10 && /^[6-9]\d{9}$/.test(formData.mobile);
    const isDemoNumber = formData.mobile === '93477500071';
    const isValid = isTenDigitValid || isDemoNumber;
    return {
      isValid,
      message: isValid ? "Valid mobile number" : "Enter a valid 10-digit Indian mobile number"
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mobile || !formData.pin) {
      toast({
        title: "Missing Information",
        description: "Please enter mobile number and PIN",
        variant: "destructive",
      });
      return;
    }

    if (formData.mobile.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter 10 digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (formData.pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Only attempt login - no auto-registration
      const loginResult = await authService.loginWithPhone(formData.mobile, formData.pin);
      
      if (loginResult.success) {
        // Successful login
        const welcomeToast = toast({
          title: `Welcome back, ${loginResult.user?.name || 'Farmer'}! 🌾`,
          description: "Successfully logged in",
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
        
        setTimeout(() => {
          isToastDismissed = true;
          cleanupListeners();
        }, 10000);
        
        navigate('/home');
      } else {
        // Login failed - show error and suggest signup
        toast({
          title: "Login Failed",
          description: "Invalid phone number or PIN. Please check your credentials or sign up if you don't have an account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-gradient-to-br from-agri-light to-white">
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

        {/* Hero Section */}
        <div className="text-center px-6 pt-12 pb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl animate-pulse">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-3">
            🌱 Welcome Back, Farmer
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Continue your smart farming journey
          </p>
        </div>

        {/* Form Container */}
        <div className="flex-1 px-6">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mobile Number */}
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
                  onChange={(e) => {
                    // Allow digits only; keep up to 11 so the demo number 93477500071 works
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData(prev => ({ ...prev, mobile: digitsOnly }));
                  }}
                  placeholder="Enter mobile number"
                    className="w-full h-16 pl-24 pr-4 text-lg font-medium bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                  />
                </div>
                {getMobileValidation() && (
                  <p className={`text-sm ${getMobileValidation()?.isValid ? 'text-green-600' : 'text-red-500'}`}>
                    {getMobileValidation()?.message}
                  </p>
                )}
              </div>

              {/* PIN Entry */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">4-Digit PIN</label>
                <PINInput
                  value={formData.pin}
                  onChange={(value) => setFormData(prev => ({ ...prev, pin: value }))}
                  placeholder="Enter PIN"
                  className="space-y-3"
                />
              </div>

              {/* Login Button - Full Width Green Gradient */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || !formData.mobile || !formData.pin}
                  className="w-full h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    'Login to KisanMitra'
                  )}
                </button>
              </div>

              {/* Footer Links */}
              <div className="text-center space-y-6 pt-8">
                <button 
                  type="button"
                  className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
                  onClick={() => {
                    toast({
                      title: "Forgot PIN?",
                      description: "Contact support at 1800-KISAN for PIN reset assistance.",
                    });
                  }}
                >
                  Forgot PIN?
                </button>
                
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <span>New to KisanMitra?</span>
                  <button 
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-green-600 font-bold hover:text-green-700 hover:underline transition-colors"
                  >
                    Create Account →
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default Login;