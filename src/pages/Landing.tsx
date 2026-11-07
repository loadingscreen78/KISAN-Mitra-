import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Leaf, 
  Bot, 
  TrendingUp, 
  CloudSun, 
  CheckCircle2, 
  Volume2, 
  Check, 
  Lock,
  RefreshCw,
  Store,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AmbientBackground from '@/components/AmbientBackground';
import { signInWithGoogle, continueAsGuest } from '@/lib/firebase';
import farmerHero from '@/assets/farmer-hero.jpg';
import aiDiagnosisImg from '@/assets/ai-diagnosis.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kisanmitra_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        toast({
          title: `Welcome, ${result.user.name}!`,
          description: 'Successfully signed in with Google.',
        });
        navigate('/home');
      } else if (result.error) {
        toast({
          title: 'Google Sign-In Notice',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Sign In Failed',
        description: 'Unable to complete sign-in. You can explore as Guest below.',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    toast({
      title: 'Welcome Guest Farmer!',
      description: 'Entering KisanMitra in demo mode.',
    });
    navigate('/home');
  };

  const supportedCrops = [
    { name: 'Tomato', emoji: '🍅', diseases: '10 conditions' },
    { name: 'Potato', emoji: '🥔', diseases: 'Early & Late Blight' },
    { name: 'Apple', emoji: '🍎', diseases: 'Scab, Black Rot' },
    { name: 'Corn', emoji: '🌽', diseases: 'Rust, Leaf Spot' },
    { name: 'Grape', emoji: '🍇', diseases: 'Black Rot, Blight' },
    { name: 'Bell Pepper', emoji: '🫑', diseases: 'Bacterial Spot' },
    { name: 'Strawberry', emoji: '🍓', diseases: 'Leaf Scorch' },
    { name: 'Orange', emoji: '🍊', diseases: 'Citrus Greening' },
    { name: 'Peach', emoji: '🍑', diseases: 'Bacterial Spot' },
    { name: 'Cherry', emoji: '🍒', diseases: 'Powdery Mildew' },
    { name: 'Soybean', emoji: '🌱', diseases: 'Healthy/Leaf Spot' },
    { name: 'Squash', emoji: '🎃', diseases: 'Powdery Mildew' },
    { name: 'Blueberry', emoji: '🫐', diseases: 'Healthy Foliage' },
    { name: 'Raspberry', emoji: '🍇', diseases: 'Healthy State' },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30 text-slate-900">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Top Full-Width Glass Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-3xl bg-white/80 border-b border-white/60 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[13px] flex items-center justify-center p-1">
                <img 
                  src="/assets/kisanmitra-logo-clean.png" 
                  alt="KisanMitra Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-slate-900 tracking-tight">KisanMitra</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/20">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Smart Farming Assistant</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-bold text-slate-600">
            <a href="#disease-scanner" className="px-3 py-1.5 rounded-xl hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              Disease Detection
            </a>
            <a href="#crops" className="px-3 py-1.5 rounded-xl hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              14 Supported Crops
            </a>
            <a href="#mitra" className="px-3 py-1.5 rounded-xl hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              Mitra AI
            </a>
            <a href="#mandi" className="px-3 py-1.5 rounded-xl hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors">
              Mandi Rates
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2.5">
            <div className="glass-pill px-1 py-0.5 scale-90 sm:scale-100">
              <LanguageSwitcher />
            </div>

            {currentUser ? (
              <Button
                onClick={() => navigate('/home')}
                className="btn-glass-primary h-10 px-4 text-xs font-bold flex items-center gap-1.5 rounded-xl"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="h-10 px-3.5 sm:px-4 text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                {/* Google Multicolor SVG */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Google Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Value Proposition & Google Auth */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-emerald-500/20 text-emerald-800 text-xs font-semibold shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plant Disease Detection • MobileNetV2 + Gemini 3.5</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Snap a leaf. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Know the disease. Save the crop.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Identify 38 plant diseases across 14 crops in about a second with a real confidence score. Get curated treatment plans and ask follow-up questions to an AI farming assistant in <b>English or हिन्दी</b>.
            </p>

            {/* Google Authentication Box (The Main Action) */}
            <div className="glass-panel-elevated p-6 max-w-lg space-y-4 border border-white/80 shadow-[0_16px_40px_0_rgba(16,185,129,0.12)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Get Started in 1 Click
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No passwords or complex forms required.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
              </div>

              {/* Big Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="w-full h-14 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-2xl border-2 border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] group"
              >
                {isAuthenticating ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Signing in with Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider / Guest Bypass */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleGuestEntry}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline transition-all"
                >
                  <span>Explore as Guest / Farmer Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium">100% Free Access</span>
              </div>
            </div>

            {/* Trust Proof Points */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ~1-Sec Diagnosis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 14 Indian Crops
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> English & हिन्दी
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Expo-Glass Product Showcase Mockup */}
          <div className="lg:col-span-5 relative">
            {/* Outer halo blur */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-green-500/10 rounded-3xl blur-2xl -z-10" />

            {/* Central Diagnostic Showcase Card */}
            <div className="glass-panel-elevated p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/80 space-y-4">
              
              {/* Header preview pill */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Live Diagnosis Scanner</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  MobileNetV2 Active
                </span>
              </div>

              {/* Photo with Scanning Laser Animation */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-56 sm:h-64 shadow-inner">
                <img 
                  src={farmerHero} 
                  alt="Crop Leaf Specimen" 
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Scanning Laser Beam */}
                <div 
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan pointer-events-none"
                />

                {/* Overlaid Diagnostic Result Pill */}
                <div className="absolute bottom-3 inset-x-3 backdrop-blur-xl bg-slate-900/85 border border-white/20 p-3 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 99.6% Confidence
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-red-500/30 text-red-300 rounded">
                      Needs Action
                    </span>
                  </div>
                  <div className="text-sm font-black text-white">Apple Scab (Venturia inaequalis)</div>
                  <div className="text-[11px] text-slate-300 mt-0.5 truncate">
                    Treatment: Spray Captan 50 WP (2g/L) or Mancozeb.
                  </div>
                </div>
              </div>

              {/* Floating Mitra AI Assistant Message Chip */}
              <div className="glass-panel p-3.5 border border-white/90 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-0.5">
                    <span>Mitra AI Farming Guide</span>
                    <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Voice
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    "इस रोग में पत्तियों पर जैतून के रंग के धब्बे दिखते हैं। बारिश से पहले फफूंदनाशक का छिड़काव करें।"
                  </p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs font-bold text-slate-700">
                <div className="p-2.5 rounded-xl bg-white/70 border border-white/60 flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-sky-500" />
                  <span>Spray: Safe Today</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 border border-white/60 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Apple Mandi: ₹110/kg</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="disease-scanner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-emerald-100/60">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Comprehensive Agricultural Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Everything an Indian Farmer Needs in One Pocket Tool
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Bento 1: Disease Scanner */}
          <div className="glass-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-700">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Plant Disease Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              MobileNetV2 neural network trained on PlantVillage recognizes 38 diseases across 14 crops. Honest "not sure" filter prevents wrong sprays.
            </p>
          </div>

          {/* Bento 2: Mitra Assistant */}
          <div className="glass-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-700">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Mitra AI in English & हिन्दी</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tuned for Indian soil, seasons, and local crop varieties. Ask questions via voice or typing and get instant practical guidance.
            </p>
          </div>

          {/* Bento 3: Live Weather Radar */}
          <div className="glass-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-700">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Weather & Spray Windows</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hyperlocal forecasts from OpenWeatherMap show upcoming rain, humidity, and wind so costly sprays are never washed away.
            </p>
          </div>

          {/* Bento 4: Mandi Prices */}
          <div className="glass-card-interactive p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Live Mandi Prices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track live market price hikes across agricultural mandis so you always know when and where to sell your harvest for the best return.
            </p>
          </div>
        </div>
      </section>

      {/* 14 Supported Crops Showcase */}
      <section id="crops" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-emerald-100/60">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            14 Crops Covered by the AI Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Leaves outside these 14 crops are automatically analyzed by Google Gemini for second opinions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {supportedCrops.map((crop, index) => (
            <div 
              key={index} 
              className="glass-panel p-3 text-center space-y-1 hover:border-emerald-400/50 transition-all hover:-translate-y-0.5"
            >
              <div className="text-2xl">{crop.emoji}</div>
              <div className="text-xs font-extrabold text-slate-900">{crop.name}</div>
              <div className="text-[10px] text-emerald-700 font-medium truncate">{crop.diseases}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-[0_20px_50px_rgba(16,185,129,0.35)] border border-emerald-400/40 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to Protect Your Crops?
            </h2>
            <p className="text-sm text-white/90">
              Sign in with your Google Account or explore immediately as a guest. Works right in your browser or on Android.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full sm:w-auto h-13 px-8 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleGuestEntry}
              className="w-full sm:w-auto h-13 px-6 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-2xl border border-white/30 backdrop-blur-md transition-all active:scale-95"
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Modern Glass Footer */}
      <footer className="border-t border-white/80 backdrop-blur-2xl bg-white/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800">KisanMitra</span>
            <span>•</span>
            <span>The Farmer's Friend</span>
            <span>•</span>
            <span>MIT License</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-emerald-700 font-semibold">🌾 Dedicated to Indian Farmers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
