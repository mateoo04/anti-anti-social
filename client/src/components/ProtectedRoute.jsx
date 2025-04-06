import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function ProtectedRoute({ children }) {
  if (!Cookies.get('username')) {
    return <Navigate to='/auth/log-in' replace />;
  }
  return children;
}
