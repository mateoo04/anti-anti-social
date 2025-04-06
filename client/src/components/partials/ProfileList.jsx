import { toast } from 'react-toastify';
import personSvg from '../../assets/icons/person-circle.svg';
import { useAuth } from '../../context/authContext';
import { Link } from 'react-router-dom';

export default function Profiles({ users }) {
  const { authenticatedUser, setAuthenticatedUser } = useAuth();

  const follow = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}/follow`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error trying to follow the account');

      setAuthenticatedUser((prev) => ({
        ...prev,
        following: prev.following ? [...prev.following, id] : [id],
      }));
    } catch (err) {
      console.log(err);
      toast.error('Failed to follow the account');
    }
  };

  const unfollow = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}/unfollow`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error trying to unfollow the account');

      setAuthenticatedUser((prev) => ({
        ...prev,
        following: prev.following.filter((accountId) => accountId !== id),
      }));
    } catch (err) {
      console.log(err);
      toast.error('Failed to unfollow the account');
    }
  };

  return users && users.length
    ? users.map((user) => {
        return (
          <Link
            to={`/user/${user.id}`}
            className='text-decoration-none link'
            key={`user-${user.id}`}
          >
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-3'>
                <img
                  src={user.profileImageUrl || personSvg}
                  alt=''
                  className='list-profile-photo'
                />
                <div>
                  <p>{user.firstName + ' ' + user.lastName}</p>
                  <p className='text-secondary'>{user.username}</p>
                </div>
              </div>
              {authenticatedUser.following?.includes(user.id) ? (
                <button
                  className='btn bg-white border text-black unfollow-btn'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    unfollow(user.id);
                  }}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className='btn bg-primary text-white follow-btn'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    follow(user.id);
                  }}
                >
                  Follow
                </button>
              )}
            </div>
          </Link>
        );
      })
    : 'No results';
}
