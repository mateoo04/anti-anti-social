import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LogIn from './LogIn';
import SignUp from './SignUp';
import { AuthProvider } from '../context/authContext';
import { Slide, ToastContainer } from 'react-toastify';
import NotFound from './NotFound';
import Home from './Home';
import Search from './Search';
import Profile from './Profile';
import ProtectedRoute from './ProtectedRoute';
import FollowsList from './FollowsList';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  { path: '/auth/log-in', element: <LogIn /> },
  { path: '/auth/sign-up', element: <SignUp /> },
  {
    path: '/search',
    element: (
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/:userId',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/:userId/follows',
    element: (
      <ProtectedRoute>
        <FollowsList />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <ProtectedRoute>
        <NotFound />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />
    </AuthProvider>
  );
}

export default App;
