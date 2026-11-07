import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home as HomeIcon, 
  BookOpen, 
  Camera, 
  Store, 
  MessageCircle 
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
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto px-4">
        <div className="pointer-events-auto relative backdrop-blur-3xl bg-white/80 border border-white/70 shadow-[0_16px_48px_0_rgba(0,0,0,0.12)] rounded-3xl px-3 py-2 flex items-center justify-between">
          {/* Luminous top border sheen */}
          <div 
            aria-hidden="true"
            className="absolute -top-[1px] left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none"
          />

          {/* Tab 1: Home */}
          <button
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 'home'
                ? 'text-emerald-700 bg-emerald-500/10 font-bold'
                : 'text-gray-500 hover:text-emerald-600 hover:bg-white/40 font-medium'
            }`}
          >
            <HomeIcon className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'home' ? 'scale-110' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.home')}</span>
          </button>

          {/* Tab 2: Advisory / Guides */}
          <button
            onClick={() => navigate('/advisory')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 'advisory'
                ? 'text-emerald-700 bg-emerald-500/10 font-bold'
                : 'text-gray-500 hover:text-emerald-600 hover:bg-white/40 font-medium'
            }`}
          >
            <BookOpen className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'advisory' ? 'scale-110' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.advisory')}</span>
          </button>

          {/* Center Elevated Action: Diagnose */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-6">
            <button
              onClick={() => navigate('/diagnose')}
              aria-label={t('navigation.diagnose')}
              className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-green-600 to-emerald-500 text-white flex items-center justify-center shadow-[0_10px_28px_-3px_rgba(16,185,129,0.55)] border-4 border-white active:scale-90 hover:scale-105 transition-all duration-300"
            >
              {/* Subtle pulsing glow ring */}
              <div 
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 blur-md group-hover:opacity-75 transition-opacity"
              />
              <Camera className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:rotate-6" />
            </button>
            <span className={`text-[11px] mt-1 tracking-tight ${currentTab === 'diagnose' ? 'text-emerald-700 font-bold' : 'text-gray-600 font-medium'}`}>
              {t('navigation.diagnose')}
            </span>
          </div>

          {/* Tab 4: Shop */}
          <button
            onClick={() => navigate('/shop')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 'shop'
                ? 'text-emerald-700 bg-emerald-500/10 font-bold'
                : 'text-gray-500 hover:text-emerald-600 hover:bg-white/40 font-medium'
            }`}
          >
            <Store className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'shop' ? 'scale-110' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.shop')}</span>
          </button>

          {/* Tab 5: Mitra AI */}
          <button
            onClick={() => navigate('/mitra')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 'mitra'
                ? 'text-emerald-700 bg-emerald-500/10 font-bold'
                : 'text-gray-500 hover:text-emerald-600 hover:bg-white/40 font-medium'
            }`}
          >
            <MessageCircle className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'mitra' ? 'scale-110' : ''}`} />
            <span className="text-[11px] mt-1 tracking-tight">{t('navigation.mitra')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GlassBottomNav;
