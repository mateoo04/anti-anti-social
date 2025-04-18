import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

export default function Header({ openNotifications, setOpenNotifications }) {
  return (
    <header className='position-fixed top-0 w-100 pt-2 pb-2 mb-1 '>
      <div className='container d-flex justify-content-between'>
        <div className='logo-container'>
          <Link to='/' className='align-self-center logo-link'>
            <img src={logo} alt='anti-anti-social logo' className='logo' />
          </Link>
        </div>
        <div className='header-nav d-none'>
          <Navigation
            openNotifications={openNotifications}
            setOpenNotifications={setOpenNotifications}
          />
        </div>
      </div>
    </header>
  );
}
