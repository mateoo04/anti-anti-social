import bellIcon from '../../assets/icons/bell.svg';
import { useNotifs } from '../../context/notificationContext';

export default function NotificationsBell({ setOpenNotifications }) {
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
      className='btn p-0 border-0 notif-button position-relative'
      onClick={() => {
        setOpenNotifications(true);
        markNotifsRead();
      }}
    >
      <img src={bellIcon} className='bell-icon' alt='' />
      {getNotifsCount()}
    </button>
  );
}
