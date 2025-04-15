import { useNotifs } from '../../context/notificationContext';
import personSvg from '../../assets/icons/person-circle.svg';
import formatDateTime from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function Notifications({
  openNotifications,
  setOpenNotifications,
}) {
  const { notifications } = useNotifs();
  const navigate = useNavigate();

  const getNotifText = (notif) => {
    switch (notif.type) {
      case 'FOLLOW':
        return (
          <p
            onClick={() => navigate(`/user/${notif.fromUser.id}`)}
            className='cursor-pointer'
          >
            <b>
              {`${notif.fromUser.firstName} ${notif.fromUser.lastName || ''}`}
            </b>{' '}
            followed you
          </p>
        );
      case 'LIKE':
        return (
          <p
            onClick={() => navigate(`/posts/${notif.post.id}`)}
            className='cursor-pointer'
          >
            <b>
              {`${notif.fromUser.firstName} ${notif.fromUser.lastName || ''}`}
            </b>{' '}
            liked your post
          </p>
        );
      case 'COMMENT':
        return (
          <p
            onClick={() => navigate(`/posts/${notif.post.id}`)}
            className='cursor-pointer'
          >
            <b>
              {`${notif.fromUser.firstName} ${notif.fromUser.lastName || ''}`}
            </b>{' '}
            commented on your post
          </p>
        );
    }
  };

  return (
    <div
      className={`notification-overlay ${openNotifications ? 'show' : ''}`}
      onClick={() => setOpenNotifications(false)}
    >
      <div className='notification-panel' onClick={(e) => e.stopPropagation()}>
        <div className='p-3 border-bottom d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>Notifications</h5>
          <button
            className='btn-close'
            onClick={() => setOpenNotifications(false)}
          ></button>
        </div>
        <div className='p-3'>
          {notifications.length ? (
            notifications.map((notification) => {
              return (
                <div
                  key={`notif-${notification.id}`}
                  className='d-flex gap-2 pb-2'
                >
                  {' '}
                  <img
                    src={notification.fromUser.profileImageUrl || personSvg}
                    className='profile-photo-md cursor-pointer'
                    alt=''
                    onClick={() =>
                      navigate(`/user/${notification.fromUser.id}`)
                    }
                  />
                  <div>
                    {getNotifText(notification)}
                    <p className='text-muted'>
                      {formatDateTime(notification.dateTime)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No new notifications 💤</p>
          )}
        </div>
      </div>
    </div>
  );
}
