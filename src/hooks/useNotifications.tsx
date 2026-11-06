import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface NotificationContextType {
  notificationSettings: { [marketId: string]: boolean };
  toggleNotification: (marketId: string) => void;
  isNotificationEnabled: (marketId: string) => boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notificationSettings, setNotificationSettings] = useState<{ [marketId: string]: boolean }>({});

  // Load notification settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('market-notifications');
    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  // Save notification settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('market-notifications', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const toggleNotification = (marketId: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [marketId]: !prev[marketId]
    }));
  };

  const isNotificationEnabled = (marketId: string) => {
    return notificationSettings[marketId] || false;
  };

  const value = {
    notificationSettings,
    toggleNotification,
    isNotificationEnabled
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};