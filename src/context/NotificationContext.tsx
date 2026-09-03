import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types.js';
import { useAuth } from './AuthContext.js';
import { api } from '../lib/api.js';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }
    try {
      const list = await api.getNotifications();
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live order status updates
    const timer = setInterval(() => {
      if (isAuthenticated) fetchNotifications();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifications, isAuthenticated]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
