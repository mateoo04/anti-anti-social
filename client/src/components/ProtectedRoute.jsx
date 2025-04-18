import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './layout/Header';
import { useEffect, useState } from 'react';
import Notifications from './notifications/Notifications';
import Navigation from './layout/Navigation';
import { useAuth } from '../context/authContext';

export default function ProtectedRoute() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { authenticatedUser } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!Cookies.get('username')) {
    return <Navigate to='/auth/log-in' replace />;
  }
  return (
    <>
      <Header
        openNotifications={openNotifications}
        setOpenNotifications={setOpenNotifications}
      ></Header>
      <Notifications
        openNotifications={openNotifications}
        setOpenNotifications={setOpenNotifications}
      />
      <div className='small-screen-nav'>
        <Navigation
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
        />
      </div>
      <Outlet />
      {['/', '/explore', `/users/${authenticatedUser.id}`].includes(
        pathname
      ) && (
        <button
          className='create-button btn bg-primary p-0 border-0 text-white'
          onClick={() => navigate('/posts/new')}
        >
          +
        </button>
      )}
    </>
  );
}
