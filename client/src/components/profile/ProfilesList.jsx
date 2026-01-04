import personSvg from '../../assets/icons/person-circle.svg';
import { useAuth } from '../../context/authContext';
import { Link } from 'react-router-dom';

export default function ProfilesList({ users, onEmptyMessage, isAdminPanel, setUsers }) {
  const { authenticatedUser, follow, unfollow, setRestrictedStatus, setAdminStatus } = useAuth();

    function updateUser(id, changes) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, ...changes } : user
      )
    );
  }

  function getRegularButton(user){
    return authenticatedUser.following?.includes(user.id) ? (
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
              );
  }

    function getAdminButtons(user){
    return user.isAdmin ? (<button
                  className='btn bg-secondary text-white profiles-list__revoke-btn rounded-5'
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await setAdminStatus(user.id, false);
                    updateUser(user.id, { isAdmin: false });
                  }}
                >
                  Revoke admin
                </button>) : (<div className='profiles-list__item--btn-wrapper'><button
                  className='btn bg-success text-white profiles-list__grant-btn rounded-5'
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await setAdminStatus(user.id, true);
                    updateUser(user.id, { isAdmin: true, isRestricted: false });
                  }}
                >
                  Grant admin
                </button>
                {user.isRestricted ? (<button
                  className='btn bg-secondary text-white profiles-list__restrict-btn rounded-5'
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await setRestrictedStatus(user.id, false);
                    updateUser(user.id, { isRestricted: false });
                  }}
                >
                  Remove restriction
                </button>) : (<button
                  className='btn bg-danger text-white profiles-list__unrestrict-btn rounded-5'
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await setRestrictedStatus(user.id, true);
                    updateUser(user.id, { isRestricted: true });
                  }}
                >
                  Restrict
                </button>)}
                </div>)
  }

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
              {!isAdminPanel ? getRegularButton(user) : getAdminButtons(user)}
            </div>
          </Link>
        );
      })
    : onEmptyMessage;
}
