import personSvg from '../../assets/icons/person-circle.svg';
import heartSvg from '../../assets/icons/heart.svg';
import heartFillSvg from '../../assets/icons/heart-fill.svg';
import chatSvg from '../../assets/icons/chat.svg';
import formatDateTime from '../../lib/utils';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Post({
  firstName,
  lastName,
  username,
  profilePhotoUrl,
  postId,
  content,
  dateTime,
  initialLikeCount,
  initialIsLikedByAuthUser,
}) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikedByAuthUser, setIsLikedByAuthUser] = useState(
    initialIsLikedByAuthUser
  );

  const likePost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to like the post');

      setLikeCount((prev) => prev + 1);
      setIsLikedByAuthUser(true);
    } catch {
      toast.error('Failed to like the post');
    }
  };

  const unlikePost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/unlike`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to unlike the post');

      setLikeCount((prev) => prev - 1);
      setIsLikedByAuthUser(false);
    } catch {
      toast.error('Failed to unlike the post');
    }
  };

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
      <div className='options pt-1'>
        <button onClick={isLikedByAuthUser ? unlikePost : likePost}>
          <img
            src={isLikedByAuthUser ? heartFillSvg : heartSvg}
            alt='Like icon'
            className='like-icon'
          />
          {likeCount}
        </button>
        <button>
          <img src={chatSvg} alt='Comments icon' />
        </button>
      </div>
    </div>
  );
}
