import { useState, useEffect } from 'react';
import { 
  BookOpen,
  ChevronRight,
  Beaker,
  Package,
  ArrowLeft,
  Sprout,
  TestTube,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '@/components/AmbientBackground';
import GlassBottomNav from '@/components/GlassBottomNav';

const Advisory = () => {
  const navigate = useNavigate();
  const [savedGuidance, setSavedGuidance] = useState<string[]>([]);
  const [savedCultivationGuides, setSavedCultivationGuides] = useState<string[]>([]);
  const [appliedGuidance, setAppliedGuidance] = useState<string[]>(() => {
    const applied = localStorage.getItem('kisanmitra_applied_guidance');
    return applied ? JSON.parse(applied) : [];
  });

  // Load saved guides
  useEffect(() => {
    const savedFertilizer = localStorage.getItem('kisanmitra_saved_fertilizer_guides');
    setSavedGuidance(savedFertilizer ? JSON.parse(savedFertilizer) : []);
    
    const savedCultivation = localStorage.getItem('kisanmitra_saved_cultivation_guides');
    setSavedCultivationGuides(savedCultivation ? JSON.parse(savedCultivation) : []);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-background to-emerald-50/20 pb-32">
      {/* Ambient background glow */}
      <AmbientBackground />

      {/* Floating Expo-Glass Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 border-b border-white/60 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/home')}
              aria-label="Back to home"
              className="p-2.5 glass-panel rounded-full hover:bg-white text-slate-700 transition-all active:scale-90 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-900" />
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md border border-white/60">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Agronomy Advisory
                </h1>
                <p className="text-[11px] text-slate-500">Expert farming guides & recommendations</p>
              </div>
            </div>
          </div>

          <div className="glass-pill px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ICAR Certified</span>
          </div>
        </div>
      </header>

      {/* Main Content - Adaptive Grid */}
      <main className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* Advisory Hero Card */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-[0_12px_36px_-4px_rgba(16,185,129,0.35)] border border-emerald-400/40">
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              <Sprout className="w-3.5 h-3.5 text-emerald-200" />
              Agronomy Knowledge Hub
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Actionable Guidance Tailored to Your Crops & Soil
            </h2>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              Access stage-by-stage fertilizer timing, disease prevention, soil testing insights, and saved crop playbooks.
            </p>
          </div>
        </div>

        {/* Advisory Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          
          {/* Card 1: Saved Cultivation Guides */}
          <div 
            onClick={() => navigate('/my-saved-cultivation-guides')}
            className="cursor-pointer glass-card-interactive p-5 flex flex-col justify-between h-44 group active:scale-[0.99] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-700 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-1.5">
                {savedCultivationGuides.length > 0 && (
                  <span className="glass-pill px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {savedCultivationGuides.length} saved
                  </span>
                )}
                <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:bg-emerald-500/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                Saved Cultivation Guides
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {savedCultivationGuides.length > 0 
                  ? `${savedCultivationGuides.length} active crop guides stored for offline viewing`
                  : 'Bookmark cultivation guides to easily follow irrigation and harvest steps'
                }
              </p>
            </div>
          </div>

          {/* Card 2: My Fertilizer Guidance */}
          <div 
            onClick={() => navigate('/my-fertilizer-guidance')}
            className="cursor-pointer glass-card-interactive p-5 flex flex-col justify-between h-44 group active:scale-[0.99] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-400/30 flex items-center justify-center text-teal-700 shadow-sm">
                <Beaker className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-1.5">
                {savedGuidance.length > 0 && (
                  <span className="glass-pill px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {savedGuidance.length} crops
                  </span>
                )}
                <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 group-hover:text-teal-700 group-hover:bg-teal-500/10 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-800 transition-colors">
                Fertilizer Dosage & Schedules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {savedGuidance.length > 0 
                  ? `${savedGuidance.length} saved crops • ${appliedGuidance.length} application stages marked complete`
                  : 'Calculate tailored N-P-K dosages by crop and stage of growth'
                }
              </p>
            </div>
          </div>

          {/* Card 3: Cultivation Knowledge Base */}
          <div 
            onClick={() => navigate('/guides')}
            className="cursor-pointer glass-card-interactive p-5 flex flex-col justify-between h-44 group active:scale-[0.99] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-400/30 flex items-center justify-center text-amber-700 shadow-sm">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 group-hover:text-amber-700 group-hover:bg-amber-500/10 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-800 transition-colors">
                All Crop Cultivation Guides
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse detailed field manuals for Wheat, Rice, Tomato, Cotton, Maize, and more.
              </p>
            </div>
          </div>

          {/* Card 4: Soil Health Testing */}
          <div 
            onClick={() => navigate('/soil-health')}
            className="cursor-pointer glass-card-interactive p-5 flex flex-col justify-between h-44 group active:scale-[0.99] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-400/30 flex items-center justify-center text-blue-700 shadow-sm">
                <TestTube className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 group-hover:text-blue-700 group-hover:bg-blue-500/10 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-800 transition-colors">
                Soil Health & Laboratory Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Interpret pH, organic carbon, nitrogen, phosphorus, and micronutrient reports.
              </p>
            </div>
          </div>

          {/* Card 5: My Crop Listings (Full width across 2 columns on tablet/desktop) */}
          <div 
            onClick={() => navigate('/sell')}
            className="cursor-pointer glass-card-interactive p-5 md:col-span-2 flex items-center justify-between group active:scale-[0.99] transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-700 shadow-sm flex-shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-800 transition-colors">
                  My Crop Marketplace Listings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage produce you have put up for sale or view active buyer inquiries
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-block glass-pill px-3 py-1 text-xs font-bold text-emerald-800">
                Manage Produce
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

        </div>
      </main>

      {/* Unified Bottom Navigation */}
      <GlassBottomNav activeTab="advisory" />
    </div>
  );
};

export default Advisory;
