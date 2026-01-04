import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import socket from '../utils/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState({});

  const logIn = (user) => {
    setIsAuthenticated(true);
    setAuthenticatedUser(user);
  };

  const logOut = async () => {
    try {
      const response = await fetch('/api/auth/log-out', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error logging out');

      const json = await response.json();

      if (json.success) {
        socket.emit('leaveRoom', `notifs-${authenticatedUser.id}`);

        setIsAuthenticated(false);
        setAuthenticatedUser({});

        window.location.href = '/auth/log-in';
      }
    } catch {
      toast.error('Error logging out');
    }
  };

  const forwardToLogIn = () => {
    if (!window.location.href.endsWith('/auth/log-in'))
      window.location.href = '/auth/log-in';
  };

  useEffect(() => {
    const validateCredentials = async () => {
      if (!Cookies.get('username')) return;

      try {
        const response = await fetch('/api/auth/validate-credentials', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.status === 401) forwardToLogIn();
        if (!response.ok) throw new Error('Failed to validate credentials');

        const json = await response.json();

        if (json.success) {
          setIsAuthenticated(true);
          setAuthenticatedUser(json.user);
        } else forwardToLogIn();
      } catch {
        forwardToLogIn();
      }
    };

    validateCredentials();
  }, []);

  const follow = async (id) => {
    let response = {};
    try {
      response = await fetch(`/api/users/${id}/follow`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error trying to follow the account');

      setAuthenticatedUser((prev) => ({
        ...prev,
        following: prev.following ? [...prev.following, id] : [id],
      }));
    } catch (err) {
      console.log(err);
      toast.error(`Failed to follow the account${response.status === 403 ? ' (you may be restricted)' : ''}`);
    }
  };

  const unfollow = async (id) => {
    let response = {};
    try {
      response = await fetch(`/api/users/${id}/unfollow`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error trying to unfollow the account');

      setAuthenticatedUser((prev) => ({
        ...prev,
        following: prev.following.filter((accountId) => accountId !== id),
      }));
    } catch (err) {
      console.log(err);
      toast.error(`Failed to unfollow the account${response.status === 403 ? ' (you may be restricted)' : ''}`);
    }
  };

    const setRestrictedStatus = async (id, restricted) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/restrict`, {
        method: 'PATCH',
        credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ restricted })
      });

      if (!response.ok) throw new Error('Error trying to restrict the account');
    } catch (err) {
      console.log(err);
      toast.error('Error trying to restrict the account');
    }
  };

      const setAdminStatus = async (id, admin) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/admin`, {
  method: 'PATCH',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ isAdmin: admin })
});

      if (!response.ok) throw new Error('Error trying to grant admin to the account');
    } catch (err) {
      console.log(err);
      toast.error('Error trying to grant admin to the account');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticatedUser,
        setAuthenticatedUser,
        logIn,
        logOut,
        follow,
        unfollow,
        setRestrictedStatus,
        setAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
