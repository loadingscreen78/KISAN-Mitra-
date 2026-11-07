import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home as HomeIcon, 
  BookOpen, 
  Camera, 
  Store, 
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface GlassBottomNavProps {
  activeTab?: 'home' | 'advisory' | 'diagnose' | 'shop' | 'mitra';
}

export const GlassBottomNav: React.FC<GlassBottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    const path = location.pathname;
    if (path.startsWith('/advisory') || path.startsWith('/guides')) return 'advisory';
    if (path.startsWith('/diagnose')) return 'diagnose';
    if (path.startsWith('/shop') || path.startsWith('/cart') || path.startsWith('/checkout')) return 'shop';
    if (path.startsWith('/mitra')) return 'mitra';
    return 'home';
  };

  const currentTab = getActiveTab();

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[max(14px,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md sm:max-w-lg mx-auto px-4">
        {/* Floating Expo-Glass Island */}
        <div className="pointer-events-auto relative backdrop-blur-3xl bg-white/70 border border-white/70 shadow-[0_16px_50px_0_rgba(16,185,129,0.18)] rounded-[28px] px-3 py-2 flex items-center justify-between ring-1 ring-white/60">
          
          {/* Specular top rim highlight */}
          <div 
            aria-hidden="true"
            className="absolute -top-[1px] left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none"
          />

          {/* Tab 1: Home */}
          <button
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
              currentTab === 'home'
                ? 'text-emerald-800 bg-emerald-500/15 font-black scale-105 shadow-inner'
                : 'text-slate-500 hover:text-emerald-700 hover:bg-white/40 font-medium'
            }`}
          >
            <HomeIcon className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'home' ? 'scale-110 text-emerald-700' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.home')}</span>
          </button>

          {/* Tab 2: Advisory */}
          <button
            onClick={() => navigate('/advisory')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
              currentTab === 'advisory'
                ? 'text-emerald-800 bg-emerald-500/15 font-black scale-105 shadow-inner'
                : 'text-slate-500 hover:text-emerald-700 hover:bg-white/40 font-medium'
            }`}
          >
            <BookOpen className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'advisory' ? 'scale-110 text-emerald-700' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.advisory')}</span>
          </button>

          {/* Center Elevated Action: Diagnose */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-7">
            <button
              onClick={() => navigate('/diagnose')}
              aria-label={t('navigation.diagnose')}
              className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-green-600 to-emerald-500 text-white flex items-center justify-center shadow-[0_12px_32px_rgba(16,185,129,0.55)] border-4 border-white active:scale-85 hover:scale-105 transition-all duration-300 ring-4 ring-emerald-500/20 animate-pulse-glow"
            >
              {/* Outer glowing breathing halo */}
              <div 
                aria-hidden="true"
                className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 blur-md group-hover:opacity-80 transition-opacity"
              />
              <Camera className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
            </button>
            <span className={`text-[11px] mt-1 tracking-tight ${currentTab === 'diagnose' ? 'text-emerald-800 font-extrabold' : 'text-slate-600 font-medium'}`}>
              {t('navigation.diagnose')}
            </span>
          </div>

          {/* Tab 4: Shop */}
          <button
            onClick={() => navigate('/shop')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
              currentTab === 'shop'
                ? 'text-emerald-800 bg-emerald-500/15 font-black scale-105 shadow-inner'
                : 'text-slate-500 hover:text-emerald-700 hover:bg-white/40 font-medium'
            }`}
          >
            <Store className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'shop' ? 'scale-110 text-emerald-700' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.shop')}</span>
          </button>

          {/* Tab 5: Mitra AI */}
          <button
            onClick={() => navigate('/mitra')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-90 ${
              currentTab === 'mitra'
                ? 'text-emerald-800 bg-emerald-500/15 font-black scale-105 shadow-inner'
                : 'text-slate-500 hover:text-emerald-700 hover:bg-white/40 font-medium'
            }`}
          >
            <MessageCircle className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'mitra' ? 'scale-110 text-emerald-700' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.mitra')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GlassBottomNav;
