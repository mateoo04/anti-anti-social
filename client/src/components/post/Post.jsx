import personSvg from '../../assets/icons/person-circle.svg';
import heartSvg from '../../assets/icons/heart.svg';
import heartFillSvg from '../../assets/icons/heart-fill.svg';
import chatSvg from '../../assets/icons/chat.svg';
import sendSvg from '../../assets/icons/send.svg';
import formatDateTime from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Comment from './Comment';

export default function Post({
  firstName,
  lastName,
  username,
  profileImageUrl,
  authorId,
  postId,
  content,
  photoUrl,
  dateTime,
  initialLikeCount,
  initialIsLikedByAuthUser,
}) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikedByAuthUser, setIsLikedByAuthUser] = useState(
    initialIsLikedByAuthUser
  );
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState([]);

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

  const postComment = async () => {
    if (newCommentText.length < 1 || newCommentText.length > 200) {
      toast.error('Comment must be between 1 and 200 characters long.');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newCommentText }),
      });

      if (!response.ok) throw new Error('Failed to post the comment');

      const json = await response.json();

      setNewCommentText('');
      setComments((prev) => [
        ...prev,
        { ...json, _count: { likedBy: 0 }, likedByAuthUser: false },
      ]);
    } catch {
      toast.error('Failed to post the comment');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load the comments');

      const json = await response.json();

      setComments(json);
    } catch {
      toast.error('Failed to load the comments');
    }
  };

  const likeComment = async (commentId) => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/like`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to like the comment');

      setComments((prev) =>
        prev.map((item) => {
          if (item.id === commentId)
            return {
              ...item,
              likedByAuthUser: true,
              _count: { likedBy: item._count.likedBy + 1 },
            };
          return item;
        })
      );
    } catch {
      toast.error('Failed to like the comment');
    }
  };

  const unlikeComment = async (commentId) => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/unlike`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to unlike the comment');

      setComments((prev) =>
        prev.map((item) => {
          if (item.id === commentId)
            return {
              ...item,
              likedByAuthUser: false,
              _count: { likedBy: item._count.likedBy - 1 },
            };
          return item;
        })
      );
    } catch {
      toast.error('Failed to unlike the comment');
    }
  };

  return (
    <div className='border rounded-4 pt-4 ps-4 pe-4 pb-3'>
      <Link to={`/user/${authorId}`} className='text-decoration-none'>
        <div className='details d-flex gap-3 mb-3 align-items-center'>
          <img
            src={profileImageUrl || personSvg}
            alt=''
            className='profile-photo-md'
          />
          <div className='d-flex flex-column'>
            <h2 className='mb-0 h4'>{firstName + ' ' + lastName}</h2>
            <p className='text-muted'>{username}</p>
          </div>
        </div>
      </Link>
      <p className='pb-2'>{content}</p>
      {photoUrl && (
        <div className='post-photo-container d-flex justify-content-center'>
          <img src={photoUrl} alt='' className='post-photo mb-3' />
        </div>
      )}
      <p className='text-muted pt-3'>{formatDateTime(dateTime)}</p>
      <div className='options pt-1 mb-2'>
        <button onClick={isLikedByAuthUser ? unlikePost : likePost}>
          <img
            src={isLikedByAuthUser ? heartFillSvg : heartSvg}
            alt='Like icon'
            className='like-icon'
          />
          {likeCount}
        </button>
        <button
          onClick={() => {
            setShowComments((prev) => !prev);
            if (!showComments) fetchComments();
          }}
        >
          <img src={chatSvg} alt='Comments icon' />
        </button>
      </div>

      <div
        className={`mt-3 mb-2 comments ${showComments ? 'd-block' : 'd-none'}`}
      >
        <h3 className='h5'>Comments</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            postComment();
          }}
          className='d-flex flex-row align-items-center w-100 gap-2'
        >
          <label htmlFor='content' className='w-100'>
            <textarea
              name='content'
              id='content'
              className='form-control'
              rows={2}
              onChange={(e) => setNewCommentText(e.target.value)}
              value={newCommentText}
            ></textarea>
          </label>
          <button
            type='submit'
            className='bg-secondary text-white border-0 post-comment-btn'
          >
            <img src={sendSvg} alt='' />
          </button>
        </form>
        {comments.map((comment) => {
          return (
            <Comment
              key={`comment-${comment.id}`}
              likeComment={likeComment}
              unlikeComment={unlikeComment}
              comment={comment}
            />
          );
        })}
      </div>
    </div>
  );
}
