import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LogIn from './authentication/LogIn';
import SignUp from './authentication/SignUp';
import { AuthProvider } from '../context/authContext';
import { Slide, ToastContainer } from 'react-toastify';
import NotFound from './NotFound';
import Home from './Home';
import Search from './Search';
import Profile from './profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import FollowsList from './profile/FollowsList';
import EditPost from './post/EditPost';

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
    path: '/posts/new',
    element: (
      <ProtectedRoute>
        <EditPost />
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
