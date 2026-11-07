import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/hooks/useNotifications";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import TransitionRouter from "@/components/TransitionRouter";
import GlassBottomNav from "@/components/GlassBottomNav";
import { TAB_BAR_ROUTES } from "@/lib/layout";
import { installGlassLight } from "@/lib/glassLight";
import Landing from "./pages/Landing";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Diagnose from "./pages/Diagnose";
import CameraCapture from "./pages/CameraCapture";
import AnalyzePlant from "./pages/AnalyzePlant";
import DiagnoseResults from "./pages/DiagnoseResults";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Treatments from "./pages/Treatments";
import Guides from "./pages/Guides";
import NearbyShops from "./pages/NearbyShops";
import SellProduce from "./pages/SellProduce";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import SoilHealth from "./pages/SoilHealth";
import Weather from "./pages/Weather";
import FertilizerGuide from "./pages/FertilizerGuide";
import Advisory from "./pages/Advisory";
import MarketPrices from "./pages/MarketPrices";
import MarketDetails from "./pages/MarketDetails";
import MyFertilizerGuidance from "./pages/MyFertilizerGuidance";
import CropGuideDetail from "./pages/CropGuideDetail";
import MySavedCultivationGuides from "./pages/MySavedCultivationGuides";
import Mitra from "./pages/Mitra";
import NotificationsSimple from "./pages/NotificationsSimple";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

installGlassLight();

/** The tab bar lives outside the routes so it never re-mounts or moves during a page transition. */
const AppShell = () => {
  const { pathname } = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/diagnose" element={<Diagnose />} />
        <Route path="/diagnose/capture" element={<CameraCapture />} />
        <Route path="/diagnose/analyze" element={<AnalyzePlant />} />
        <Route path="/diagnose/results" element={<DiagnoseResults />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:cropId" element={<CropGuideDetail />} />
        <Route path="/my-saved-cultivation-guides" element={<MySavedCultivationGuides />} />
        <Route path="/shops" element={<NearbyShops />} />
        <Route path="/sell" element={<SellProduce />} />
        <Route path="/sell/new" element={<SellProduce />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/soil-health" element={<SoilHealth />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/fertilizer-guide" element={<FertilizerGuide />} />
        <Route path="/advisory" element={<Advisory />} />
        <Route path="/market-prices" element={<MarketPrices />} />
        <Route path="/market-details/:marketId" element={<MarketDetails />} />
        <Route path="/my-fertilizer-guidance" element={<MyFertilizerGuidance />} />
        <Route path="/mitra" element={<Mitra />} />
        <Route path="/notifications" element={<NotificationsSimple />} />
        <Route path="/feedback" element={<Feedback />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {TAB_BAR_ROUTES.includes(pathname) && <GlassBottomNav />}
    </>
  );
};

const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        // Status bar matches the paper background of the app
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#F4F4F0' });

        // Hide splash screen after app loads
        await SplashScreen.hide();

        // Configure keyboard behavior
        Keyboard.setAccessoryBarVisible({ isVisible: false });

        // Handle app state changes
        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });

        // Handle back button on Android
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapacitorApp.exitApp();
          } else {
            window.history.back();
          }
        });
      }
    };

    initializeApp();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationProvider>
        <Toaster />
        <Sonner />
        <TransitionRouter>
          <AppShell />
        </TransitionRouter>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
