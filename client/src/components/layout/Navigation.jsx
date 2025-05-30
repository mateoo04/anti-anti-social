import peopleIcon from '../../assets/icons/nav/people.svg';
import peopleFillIcon from '../../assets/icons/nav/people-fill.svg';
import bellIcon from '../../assets/icons/nav/bell.svg';
import bellFillIcon from '../../assets/icons/nav/bell-fill.svg';
import homeIcon from '../../assets/icons/nav/house.svg';
import homeFillIcon from '../../assets/icons/nav/house-fill.svg';
import compassIcon from '../../assets/icons/nav/compass.svg';
import compassFillIcon from '../../assets/icons/nav/compass-fill.svg';
import personIcon from '../../assets/icons/person-circle.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import NotificationsBell from '../notifications/NotificationsBell';

export default function Navigation({
  openNotifications,
  setOpenNotifications,
}) {
  const location = useLocation();
  const { authenticatedUser, logOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className='d-flex gap-3 align-items-center main-nav'>
      <Link to='/' className='nav-link'>
        <img
          src={location.pathname == '/' ? homeFillIcon : homeIcon}
          alt=''
          className='home-icon'
        />
        <p>Home</p>
      </Link>
      <Link to='/explore' className='nav-link'>
        <img
          src={location.pathname == '/explore' ? compassFillIcon : compassIcon}
          alt=''
          className='explore-icon'
        />
        <p>Explore</p>
      </Link>
      <Link to='/users' className='nav-link'>
        <img
          src={location.pathname == '/users' ? peopleFillIcon : peopleIcon}
          alt=''
          className='search-icon'
        />
        <p>Users</p>
      </Link>
      <NotificationsBell
        icon={openNotifications ? bellFillIcon : bellIcon}
        setOpenNotifications={setOpenNotifications}
      />
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
            <p className='mb-0 header-full-name'>
              {`${authenticatedUser.firstName} ${
                authenticatedUser.lastName || ''
              }`}
            </p>
          </button>
          <ul className='dropdown-menu dropdown-menu-light mt-2 user-options'>
            <li className='dropdown-item'>
              <button
                onMouseDown={() => {
                  navigate(
                    isAuthenticated ? `/users/${authenticatedUser.id}` : '/'
                  );
                }}
                className='btn p-0 text-black'
              >
                View profile
              </button>
            </li>
            <li className='dropdown-item'>
              <button
                onMouseDown={() => {
                  navigate(isAuthenticated ? `/edit-profile` : '/');
                }}
                className='btn p-0 text-black'
              >
                Edit profile
              </button>
            </li>
            <li className='dropdown-item'>
              <button
                onMouseDown={async () => {
                  await logOut();
                }}
                className='border-0 bg-transparent ps-0'
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
