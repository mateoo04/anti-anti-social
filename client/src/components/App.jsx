import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LogIn from './LogIn';
import SignUp from './SignUp';
import { AuthProvider } from '../context/authContext';
import { Slide, ToastContainer } from 'react-toastify';
import NotFound from './NotFound';
import Home from './Home';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/auth/log-in', element: <LogIn /> },
  { path: '/auth/sign-up', element: <SignUp /> },
  { path: '*', element: <NotFound /> },
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
