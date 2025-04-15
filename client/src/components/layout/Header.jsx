import logo from '../../assets/logo.png';
import searchIcon from '../../assets/icons/search.svg';
import personIcon from '../../assets/icons/person-circle.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import Notifications from '../notifications/Notifications';
import { NotificationsProvider } from '../../context/notificationContext';
import NotificationsBell from '../notifications/NotificationsBell';

export default function Header() {
  const { authenticatedUser, setAuthenticatedUser, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();
  const [openNotifications, setOpenNotifications] = useState(false);

  const logOut = async () => {
    try {
      const response = await fetch('/api/auth/log-out', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to log out');

      setAuthenticatedUser({});
      navigate('/auth/log-in');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <NotificationsProvider>
      <header className='container mt-3 mb-4 mb-2 d-flex justify-content-between'>
        <Link to='/'>
          <img src={logo} alt='anti-anti-social logo' className='logo' />
        </Link>
        <nav className='d-flex gap-2 align-items-center'>
          <Link to='/search'>
            <img src={searchIcon} alt='' className='search-icon' />
          </Link>
          <NotificationsBell setOpenNotifications={setOpenNotifications} />
          {isAuthenticated && (
            <div className='dropdown'>
              <button
                className='d-flex align-items-center gap-1 text-decoration-none text-black bg-transparent border-0'
                data-bs-toggle='dropdown'
              >
                <img
                  src={authenticatedUser.profileImageUrl || personIcon}
                  alt=''
                  className='profile-photo-sm'
                />
                <p className='mb-0'>
                  {`${authenticatedUser.firstName} ${
                    authenticatedUser.lastName || ''
                  }`}
                </p>
              </button>
              <ul className='dropdown-menu dropdown-menu-light mt-2'>
                <li className='dropdown-item'>
                  <button
                    onClick={() =>
                      navigate(
                        authenticatedUser
                          ? `/user/${authenticatedUser.id}`
                          : '/'
                      )
                    }
                    className='btn p-0 text-black'
                  >
                    View profile
                  </button>
                </li>
                <li className='dropdown-item'>
                  <button
                    onClick={() =>
                      navigate(authenticatedUser ? `/edit-profile` : '/')
                    }
                    className='btn p-0 text-black'
                  >
                    Edit profile
                  </button>
                </li>
                <li className='dropdown-item'>
                  <button
                    onClick={logOut}
                    className='border-0 bg-transparent ps-0'
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </nav>
        <Notifications
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
        />
      </header>
    </NotificationsProvider>
  );
}
