import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

interface Notification {
  id: string;
  message: string;
  eventId: number;
  createdAt: string;
  isRead: boolean;
}

const STORAGE_KEY = 'eventflow_notifications';

export const useSignalR = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load saved notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    console.log('📂 Loading from localStorage:', saved);
    if (saved && saved !== '[]') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
          const unread = parsed.filter((n: Notification) => !n.isRead).length;
          setUnreadCount(unread);
          console.log(`📂 Loaded ${parsed.length} notifications`);
        }
      } catch (e) {
        console.error('Error loading notifications:', e);
      }
    } else {
      console.log('📂 No saved notifications found');
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      console.log('💾 Saved', notifications.length, 'notifications');
    }
  }, [notifications]);

  // SignalR connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:55643/eventFlowHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(async () => {
        console.log('✅ SignalR connected');
        await connection.invoke('JoinUserGroup', 6);
        console.log('✅ Joined user group 6');
      })
      .catch(err => console.error('❌ SignalR error:', err));

    connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('🔔 New notification:', notification);
      
      const newNotif = {
        ...notification,
        id: notification.id || Math.random().toString(36),
        createdAt: notification.createdAt || new Date().toISOString(),
        isRead: false
      };
      
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        setUnreadCount(prevCount => prevCount + 1);
        return updated;
      });
    });

    return () => {
      connection.stop();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead
  };
};