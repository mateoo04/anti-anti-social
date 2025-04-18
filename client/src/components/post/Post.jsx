import personSvg from '../../assets/icons/person-circle.svg';
import heartSvg from '../../assets/icons/heart.svg';
import heartFillSvg from '../../assets/icons/heart-fill.svg';
import chatSvg from '../../assets/icons/chat.svg';
import sendSvg from '../../assets/icons/send.svg';
import threeDotsSvg from '../../assets/icons/three-dots.svg';
import formatDateTime from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import { useAuth } from '../../context/authContext';

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
  removePost,
  areCommentsOpen,
}) {
  const { authenticatedUser } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikedByAuthUser, setIsLikedByAuthUser] = useState(
    initialIsLikedByAuthUser
  );
  const [showComments, setShowComments] = useState(areCommentsOpen || false);
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

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
        { ...json, _count: { likedBy: 0 }, likedByAuthUser: false },
        ...prev,
      ]);
    } catch {
      toast.error('Failed to post the comment');
    }
  };

  useEffect(() => {
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

    if (showComments) fetchComments();
  }, [showComments, postId]);

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

  const handlePostDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete the post');

      removePost();
    } catch {
      toast.error('Failed to delete the post');
    }
  };
  return (
    <div className='border-0 rounded-5 pt-4 ps-4 pe-4 pb-3 post-card'>
      <Link to={`/users/${authorId}`} className='text-decoration-none'>
        <div className='details d-flex gap-3 mb-3 align-items-center'>
          <img
            src={profileImageUrl || personSvg}
            alt=''
            className='profile-photo-md'
          />
          <div className='d-flex flex-column'>
            <h2 className='text-secondary mb-0 h4'>{`${firstName} ${
              lastName || ''
            }`}</h2>
            <p className='text-primary'>@{username}</p>
          </div>
        </div>
      </Link>
      <p className='pb-2 preserve-newlines'>{content}</p>
      {photoUrl && (
        <div className='post-photo-container d-flex justify-content-center'>
          <img src={photoUrl} alt='' className='post-photo mb-3 rounded-4' />
        </div>
      )}
      <p className='text-muted pt-3'>{formatDateTime(dateTime)}</p>
      <div className='options pt-1 mb-2 d-flex align-items-center'>
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
          }}
        >
          <img src={chatSvg} alt='Comments icon' className='comment-image' />
        </button>
        {authorId === authenticatedUser.id && (
          <div className='dropdown'>
            <button
              className='d-flex align-items-center gap-1 text-decoration-none text-black bg-transparent border-0'
              data-bs-toggle='dropdown'
            >
              <img src={threeDotsSvg} alt='' />
            </button>
            <ul className='dropdown-menu dropdown-menu-light mt-2'>
              <li className='dropdown-item'>
                <button
                  onClick={() => {
                    confirm('Are you sure you want to delete this post?') &&
                      handlePostDelete();
                  }}
                  className='p-0 text-muted'
                >
                  Delete post
                </button>
              </li>
              <li className='dropdown-item'>
                <button
                  className='text-decoration-none text-secondary bg-transparent border-0 p-0'
                  onClick={() => navigate(`/posts/${postId}/edit`)}
                >
                  Edit post
                </button>
              </li>
            </ul>
          </div>
        )}
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
          className='d-flex flex-row align-items-center w-100 gap-2 ps-2 pe-2'
        >
          <label htmlFor='content' className='w-100'>
            <textarea
              name='content'
              id='content'
              className='form-control rounded-4'
              rows={2}
              onChange={(e) => setNewCommentText(e.target.value)}
              value={newCommentText}
            ></textarea>
          </label>
          <button
            type='submit'
            className='bg-primary text-white border-0 post-comment-btn'
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
