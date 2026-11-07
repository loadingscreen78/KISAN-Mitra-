import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, TrendingUp, AlertCircle, CheckCircle, MessageCircle, Trash2, CheckCheck, MoreVertical, Settings, Search } from 'lucide-react';
import { useGoBack } from '@/hooks/useGoBack';

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

const NotificationsSimple = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
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
    }
  ]);

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
            <button
              onClick={() => goBack()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4 mr-1 inline" />
              Mark All Read
            </button>
            
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1 inline" />
              Clear All
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'unread', 'actionable'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === filter 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                {filter === 'all' && 'All'}
                {filter === 'unread' && `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
                {filter === 'actionable' && 'Action Required'}
              </button>
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
                              <button
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationAction(notification.id, action.action);
                                }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                  action.variant === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : action.variant === 'danger'
                                    ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {action.label}
                              </button>
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

export default NotificationsSimple;
