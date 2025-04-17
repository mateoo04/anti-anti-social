import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LogIn from './authentication/LogIn';
import SignUp from './authentication/SignUp';
import { AuthProvider } from '../context/authContext';
import { Slide, ToastContainer } from 'react-toastify';
import NotFound from './NotFound';
import Search from './Search';
import Profile from './profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import FollowsList from './profile/FollowsList';
import EditPost from './post/EditPost';
import EditProfile from './profile/EditProfile';
import Welcome from './profile/Welcome';
import PostView from './post/PostView';
import { NotificationsProvider } from '../context/notificationContext';
import { homePageLoader } from '../loaders/homePageLoader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostCarousel from './post/PostCarousel';
import { explorePageLoader } from '../loaders/explorePageLoader';

const router = createBrowserRouter([
  { path: '/auth/log-in', element: <LogIn /> },
  { path: '/auth/sign-up', element: <SignUp /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <NotFound />,
    children: [
      { index: true, loader: homePageLoader, element: <PostCarousel /> },
      { path: 'explore', loader: explorePageLoader, element: <PostCarousel /> },
      {
        path: 'welcome',
        element: <Welcome />,
      },
      {
        path: 'edit-profile',
        element: <EditProfile />,
      },
      {
        path: 'users',
        element: <Search />,
      },
      {
        path: 'users/:userId',
        element: <Profile />,
      },
      {
        path: 'users/:userId/follows',
        element: <FollowsList />,
      },
      {
        path: 'posts/new',
        element: <EditPost />,
      },
      {
        path: 'posts/:postId/edit',
        element: <EditPost />,
      },
      {
        path: 'posts/:postId',
        element: <PostView />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
