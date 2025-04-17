import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './layout/Header';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!Cookies.get('username')) {
    return <Navigate to='/auth/log-in' replace />;
  }
  return (
    <>
      <Header></Header>
      <Outlet />
    </>
  );
}
