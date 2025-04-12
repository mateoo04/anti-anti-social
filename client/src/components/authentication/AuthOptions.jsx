import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';

export default function AuthOptions() {
  const { logIn } = useAuth();
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      const response = await fetch('/api/auth/guest-login', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to log in');
      else {
        const json = await response.json();

        logIn(json.user);
        navigate('/');
      }
    } catch {
      toast.error('Failed to log in');
    }
  };
  return (
    <>
      <button
        className='btn bg-primary text-white auth-btn'
        onClick={handleGuestLogin}
      >
        Continue as a guest
      </button>
    </>
  );
}
