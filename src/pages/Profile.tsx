import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  Package,
  Trophy,
  Store,
  ShoppingCart,
  Cloud,
  Activity,
  Star,
  Users,
  Leaf,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Crown,
  ShoppingBag,
  Wallet,
  ChevronRight,
  Share2,
  BadgeCheck,
  MessageCircle,
  Shield,
  Gift,
  FileText,
  DollarSign
} from 'lucide-react';
import { dataService } from '../lib/dataService';
import { marketData } from '../lib/marketData';
import { authService } from '../lib/authService';
import { signOutFirebase } from '../lib/firebase';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutFirebase();
    await authService.logout();
    navigate('/', { replace: true });
  };

  const handleBack = () => {
    navigate('/home');
  };
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // First try to get user from new auth service
        let user = authService.getCurrentUser();
        
        // If no user from auth service, try old dataService for backward compatibility
        if (!user) {
          user = dataService.getCurrentUser();
        }
        
        if (user) {
          // Ensure user has required fields for profile display
          const profileUser = {
            id: user.id || Date.now().toString(),
            name: user.name || user.user_metadata?.name || 'Farmer',
            phone: user.phone || user.user_metadata?.phone || 'N/A',
            location: user.location || user.user_metadata?.location || 'India',
            state: user.state || user.user_metadata?.state || 'India',
            avatar: user.avatar || user.user_metadata?.avatar,
            joinedDate: user.joinedDate || user.created_at || new Date().toISOString(),
            createdAt: user.createdAt || user.created_at || new Date().toISOString()
          };
          
          setUserData(profileUser);
          
          // Calculate stats using the user ID
          const userStats = dataService.calculateUserStats(profileUser.id);
          setStats(userStats);
          
          // Generate achievements based on real data
          const generatedAchievements = [
            { 
              id: 1, 
              title: 'First Sale', 
              icon: Trophy, 
              completed: userStats.successfulSales >= 1 
            },
            { 
              id: 2, 
              title: 'Top Seller', 
              icon: Crown, 
              completed: userStats.successfulSales >= 10 
            },
            { 
              id: 3, 
              title: 'Plant Expert', 
              icon: Leaf, 
              completed: userStats.diagnosisCount >= 5 
            },
            { 
              id: 4, 
              title: 'Super Star', 
              icon: Star, 
              completed: userStats.totalEarnings >= 50000 
            }
          ];
          setAchievements(generatedAchievements);
        } else {
          // No user found, redirect to landing
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // On error, redirect to landing
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  if (isLoading || !userData || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = "bg-blue-500" }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{title}</div>
        </div>
      </div>
    </div>
  );

  const MenuItem = ({ icon: Icon, title, subtitle, onClick, rightElement = null }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900">{title}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5 text-gray-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {userData.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                <button 
                  onClick={() => navigate('/profile/edit')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{userData.phone}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-6 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{stats.successfulSales}</span>
                  <span className="text-gray-500"> sales</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{stats.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Total Earnings" 
            value={`₹${(stats.totalEarnings/1000).toFixed(0)}K`} 
            icon={Wallet}
            color="bg-green-500"
          />
          <button 
            onClick={() => navigate('/sell?tab=active')}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{stats.activeListings}</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>
            </div>
          </button>
          <button 
            onClick={() => navigate('/treatments')}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{stats.activeTreatments}</div>
                <div className="text-sm text-gray-600">Active Treatments</div>
              </div>
            </div>
          </button>
          <StatCard 
            title="Markets" 
            value={marketData.length} 
            icon={Store}
            color="bg-purple-500"
          />
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <div className="text-sm text-gray-500">
              {achievements.filter(a => a.completed).length}/{achievements.length} unlocked
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="text-center">
                <div className={`w-12 h-12 ${achievement.completed ? 'bg-yellow-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <achievement.icon className={`w-6 h-6 ${achievement.completed ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div className="text-xs font-medium text-gray-700">{achievement.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Sell Crops', icon: ShoppingBag, color: 'bg-green-500', route: '/sell' },
              { title: 'Market Prices', icon: BarChart3, color: 'bg-blue-500', route: '/market-prices' },
              { title: 'Weather', icon: Cloud, color: 'bg-sky-500', route: '/weather' },
              { title: 'Diagnose Plant', icon: Activity, color: 'bg-orange-500', route: '/diagnose' }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-medium text-gray-700">{action.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <MenuItem
            icon={Leaf}
            title="My Advisory"
            subtitle={`${stats.advisorySaved} tips saved`}
            onClick={() => navigate('/advisory')}
            rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
          />
          <MenuItem
            icon={FileText}
            title="Sales Report"
            subtitle={`₹${(stats.totalEarnings/1000).toFixed(0)}K earned`}
            onClick={() => navigate('/sell?tab=sold')}
            rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
          />
          <MenuItem
            icon={Package}
            title="Sold Listings"
            subtitle={`${stats.successfulSales} items sold`}
            onClick={() => navigate('/sell?tab=sold')}
            rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
          />
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Notifications</div>
                <div className="text-sm text-gray-500">Push notifications</div>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <MenuItem
            icon={MessageCircle}
            title="Feedback"
            subtitle="Share your experience"
            onClick={() => navigate('/feedback')}
            rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
          />
          <MenuItem
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Get assistance"
            onClick={() => {}}
            rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
          />
          <MenuItem
            icon={Settings}
            title="App Settings"
            subtitle="Preferences"
            onClick={() => {}}
            rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
          />
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 rounded-xl p-4 text-red-600 font-medium hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Profile;