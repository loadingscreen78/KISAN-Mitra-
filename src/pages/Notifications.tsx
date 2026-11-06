import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, TrendingUp, AlertCircle, CheckCircle, Clock, MessageCircle, Trash2, CheckCheck, MoreVertical, Settings, Search } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  date: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  unread: boolean;
  actionable?: boolean;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'success' | 'danger';
  }>;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'market_request',
      title: 'Order Confirmed!',
      message: 'FreshMart accepted your tomatoes order for ₹1,200. Expected delivery: Tomorrow',
      time: '2m',
      date: 'today',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      unread: true,
      actionable: true,
      actions: [
        { label: 'Track Order', action: 'track', variant: 'default' },
        { label: 'Contact Buyer', action: 'contact', variant: 'success' }
      ]
    },
    {
      id: 2,
      type: 'price_alert',
      title: 'Price Alert 📈',
      message: 'Wheat prices jumped ₹5/kg in Pune market. Current rate: ₹32/kg',
      time: '15m',
      date: 'today',
      icon: TrendingUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      unread: true,
      actionable: true,
      actions: [
        { label: 'View Market', action: 'market', variant: 'default' },
        { label: 'Sell Now', action: 'sell', variant: 'success' }
      ]
    },
    {
      id: 3,
      type: 'treatment_reminder',
      title: 'Treatment Reminder ⏰',
      message: 'Apply fungicide spray to wheat crop - Block A, Field 2',
      time: '1h',
      date: 'today',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      unread: true,
      actionable: true,
      actions: [
        { label: 'Mark Done', action: 'complete', variant: 'success' },
        { label: 'Reschedule', action: 'reschedule', variant: 'default' }
      ]
    },
    {
      id: 4,
      type: 'weather_alert',
      title: 'Weather Alert ⛈️',
      message: 'Heavy rain expected tomorrow 6-8 PM. Secure your harvest and equipment',
      time: '2h',
      date: 'today',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      unread: false,
      actionable: true,
      actions: [
        { label: 'View Weather', action: 'weather', variant: 'default' },
        { label: 'Set Reminder', action: 'remind', variant: 'default' }
      ]
    },
    {
      id: 5,
      type: 'order_delivered',
      title: 'Delivery Completed ✅',
      message: 'Your organic fertilizer order has been delivered successfully to Farm Gate #2',
      time: '4h',
      date: 'today',
      icon: Package,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      unread: false,
      actionable: true,
      actions: [
        { label: 'Rate Order', action: 'rate', variant: 'default' },
        { label: 'Reorder', action: 'reorder', variant: 'success' }
      ]
    },
    {
      id: 6,
      type: 'buyer_inquiry',
      title: 'New Buyer Message 💬',
      message: 'Rohit Farms is interested in your organic green chilies. They want to place bulk order.',
      time: '6h',
      date: 'today',
      icon: MessageCircle,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      unread: false,
      actionable: true,
      actions: [
        { label: 'Reply', action: 'reply', variant: 'default' },
        { label: 'Call', action: 'call', variant: 'success' }
      ]
    },
    {
      id: 7,
      type: 'system_update',
      title: 'App Update Available 🚀',
      message: 'Version 2.1.0 is ready with new crop disease detection features',
      time: '1d',
      date: 'yesterday',
      icon: Bell,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      unread: false,
      actionable: true,
      actions: [
        { label: 'Update Now', action: 'update', variant: 'success' },
        { label: 'Later', action: 'later', variant: 'default' }
      ]
    },
    {
      id: 8,
      type: 'community_post',
      title: 'Community Activity 👥',
      message: 'Dr. Kumar shared a new guide: "Organic Pest Control Methods for Winter Crops"',
      time: '2d',
      date: 'yesterday',
      icon: MessageCircle,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      unread: false,
      actionable: true,
      actions: [
        { label: 'Read Guide', action: 'read', variant: 'default' },
        { label: 'Save', action: 'save', variant: 'default' }
      ]
    }
  ]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kisanmitra_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kisanmitra_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const filteredNotifications = notifications
    .filter(n => selectedFilter === 'all' || 
      (selectedFilter === 'unread' && n.unread) ||
      (selectedFilter === 'actionable' && n.actionable))
    .filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()));

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const group = notification.date;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationAction = (notificationId: number, action: string) => {
    console.log(`Action "${action}" for notification ${notificationId}`);
    // Handle different actions
    switch (action) {
      case 'track':
        navigate('/orders');
        break;
      case 'market':
        navigate('/market-prices');
        break;
      case 'weather':
        navigate('/weather');
        break;
      case 'complete':
        handleMarkAsRead(notificationId);
        break;
      default:
        break;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClearAll} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Notification Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'unread', 'actionable'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={selectedFilter === filter ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'}
              >
                {filter === 'all' && 'All'}
                {filter === 'unread' && `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
                {filter === 'actionable' && 'Action Required'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="pb-6">
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h2>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, groupNotifications]) => (
            <div key={date} className="mb-6">
              {/* Date Header */}
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {date === 'today' ? 'Today' : date === 'yesterday' ? 'Yesterday' : date}
                </h3>
              </div>
              
              {/* Notifications in this group */}
              <div className="bg-white">
                {groupNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-4 ${index !== groupNotifications.length - 1 ? 'border-b border-gray-100' : ''} ${
                      notification.unread ? 'bg-green-50/30' : 'bg-white'
                    } hover:bg-gray-50 transition-colors cursor-pointer`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 ${notification.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {React.createElement(notification.icon, { className: `w-6 h-6 ${notification.iconColor}` })}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-base">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <span className="text-sm text-gray-500">{notification.time}</span>
                            {notification.unread && (
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        {/* Action buttons */}
                        {notification.actionable && notification.actions && (
                          <div className="flex space-x-2 mt-3">
                            {notification.actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant === 'success' ? 'default' : 'outline'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification.id, action.action);
                                }}
                                className={
                                  action.variant === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5'
                                    : action.variant === 'danger'
                                    ? 'border-red-200 text-red-600 hover:bg-red-50 text-xs px-3 py-1.5'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1.5'
                                }
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;