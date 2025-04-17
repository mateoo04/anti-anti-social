import { useNotifs } from '../../context/notificationContext';

export default function NotificationsBell({ setOpenNotifications, icon }) {
  const { notifications, markNotifsRead } = useNotifs();

  const getNotifsCount = () => {
    const notifsCount = notifications.filter((notif) => !notif.isRead).length;

    if (!notifsCount) return '';
    else if (notifsCount <= 9)
      return <span className='notif-count'>{notifsCount}</span>;
    else return <span className='notif-count'>9+</span>;
  };

  return (
    <button
      className='nav-link position-relative'
      onClick={() => {
        setOpenNotifications(true);
        markNotifsRead();
      }}
    >
      <img src={icon} className='bell-icon' alt='' />
      {getNotifsCount()}
      <p>Notifs</p>
    </button>
  );
}
