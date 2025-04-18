import { useState } from 'react';
import logo from '../../assets/logo.png';
import Notifications from '../notifications/Notifications';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

export default function Header() {
  const [openNotifications, setOpenNotifications] = useState(false);

  return (
    <header className='position-fixed top-0 w-100 pt-2 pb-2 mb-1 '>
      <div className='container d-flex justify-content-between'>
        <div className='logo-container'>
          <Link to='/' className='align-self-center logo-link'>
            <img src={logo} alt='anti-anti-social logo' className='logo' />
          </Link>
        </div>
        <Navigation
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
        />
        <Notifications
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
        />
      </div>
    </header>
  );
}
