import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

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
        setIsAuthenticated(false);
        setAuthenticatedUser({});
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
    try {
      const response = await fetch(`/api/users/${id}/follow`, {
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
      toast.error('Failed to follow the account');
    }
  };

  const unfollow = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}/unfollow`, {
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
      toast.error('Failed to unfollow the account');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
