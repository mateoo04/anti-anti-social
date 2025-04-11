import heartSvg from '../../assets/icons/heart.svg';
import heartFillSvg from '../../assets/icons/heart-fill.svg';
import personSvg from '../../assets/icons/person-circle.svg';
import formatDateTime from '../../utils/helpers';
import { Link } from 'react-router-dom';

export default function Comment({ comment, likeComment, unlikeComment }) {
  return (
    <div className='mt-3 mb-3 ps-2 pe-2 d-flex'>
      <div className='col'>
        <Link
          to={`/user/${comment.authorId}`}
          className='text-decoration-none d-flex justify-content-between align-items-start'
        >
          <div className='details d-flex gap-2 mb-1 align-items-center'>
            <img
              src={comment.author.profileImageUrl || personSvg}
              alt=''
              className='profile-photo-sm'
            />
            <div className='d-flex gap-2 align-items-end'>
              <h4 className='mb-0 h5'>
                {comment.author.firstName + ' ' + comment.author.lastName}
              </h4>
              <p className='text-muted'>{formatDateTime(comment.dateTime)}</p>
            </div>
          </div>
        </Link>
        <p className='col comment-content'>{comment.content}</p>
      </div>
      <button
        className='align-self-center bg-transparent border-0'
        onClick={
          comment.likedByAuthUser
            ? () => unlikeComment(comment.id)
            : () => likeComment(comment.id)
        }
      >
        <img
          src={comment.likedByAuthUser ? heartFillSvg : heartSvg}
          alt='Like icon'
          className='like-icon-comment'
        />
        {comment._count?.likedBy || ''}
      </button>
    </div>
  );
}
