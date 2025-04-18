import personSvg from '../../assets/icons/person-circle.svg';
import { useAuth } from '../../context/authContext';
import { Link } from 'react-router-dom';

export default function ProfilesList({ users, onEmptyMessage }) {
  const { authenticatedUser, follow, unfollow } = useAuth();

  return users && users.length
    ? users.map((user) => {
        return (
          <Link
            to={`/users/${user.id}`}
            className='text-decoration-none link'
            key={`user-${user.id}`}
          >
            <div className='d-flex align-items-center justify-content-between pt-1 pb-1'>
              <div className='d-flex align-items-center gap-3'>
                <img
                  src={user.profileImageUrl || personSvg}
                  alt=''
                  className='profile-photo-md'
                />
                <div>
                  <p className='text-black'>{`${user.firstName} ${
                    user.lastName || ''
                  }`}</p>
                  <p className='text-primary'>@{user.username}</p>
                </div>
              </div>
              {authenticatedUser.following?.includes(user.id) ? (
                <button
                  className='btn bg-white border text-black unfollow-btn rounded-5'
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
                  className='btn bg-secondary text-white follow-btn rounded-5'
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
    : onEmptyMessage;
}
