import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { useAuth } from './authContext';
import socket from '../utils/socket';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const { isAuthenticated, authenticatedUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const joinedRoom = useRef('');

  useEffect(() => {
    const fetchNotifications = async () => {
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

    fetchNotifications();
  }, [isAuthenticated, authenticatedUser]);

  useEffect(() => {
    if (!isAuthenticated || !authenticatedUser?.id) return;

    const room = `notifs-${authenticatedUser.id}`;

    if (joinedRoom.current === room) return;

    socket.emit('joinRoom', room);
    joinedRoom.current = room;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.emit('leaveRoom', `notifs-${authenticatedUser.id}`);
    };
  }, [isAuthenticated, authenticatedUser?.id]);

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
