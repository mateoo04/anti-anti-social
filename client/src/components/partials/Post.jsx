import personSvg from '../../assets/icons/person-circle.svg';
import formatDateTime from '../../lib/utils';
export default function Post({
  firstName,
  lastName,
  username,
  profilePhotoUrl,
  content,
  dateTime,
}) {
  return (
    <div className='border rounded-4 pt-4 ps-4 pe-4 pb-3'>
      <div className='details d-flex gap-3 mb-3 align-items-center'>
        <img
          src={profilePhotoUrl || personSvg}
          alt=''
          className='profile-photo-md'
        />
        <div className='d-flex flex-column'>
          <h2 className='mb-0 h4'>{firstName + ' ' + lastName}</h2>
          <p className='text-muted'>{username}</p>
        </div>
      </div>
      <p>{content}</p>
      <p className='text-muted mt-3'>{formatDateTime(dateTime)}</p>
    </div>
  );
}
