import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import gitHubIcon from '../../assets/icons/github-mark.svg';

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
      <a
        href='/api/auth/github'
        className='text-decoration-none text-white bg-secondary btn d-flex gap-1 rounded-5 ps-3 pe-3'
      >
        <img src={gitHubIcon} alt='' className='github-icon' />
        Continue with GitHub
      </a>
      <button
        className='btn guest-login-button text-secondary auth-btn rounded-5 ps-3 pe-3'
        onClick={handleGuestLogin}
      >
        Continue as a guest
      </button>
    </>
  );
}
