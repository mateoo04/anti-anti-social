import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './authContext';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const validateCredentials = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch('/api/notifications', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const json = await response.json();

        setNotifications(json);
      } catch (err) {
        console.log(err);
      }
    };

    validateCredentials();
  }, [isAuthenticated]);

  const markNotifsRead = () => {
    const markRead = async () => {
      if (
        !isAuthenticated ||
        notifications.every((notifItem) => notifItem.isRead)
      )
        return;

      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok)
          throw new Error('Failed to mark notifications as read');

        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
      } catch (err) {
        console.log(err);
      }
    };

    markRead();
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        markNotifsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifs() {
  return useContext(NotificationsContext);
}
