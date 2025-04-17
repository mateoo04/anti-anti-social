import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Post from './Post';
import Header from '../layout/Header';

export default function PostView() {
  const { postId } = useParams();
  const [post, setPost] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to load the post');

        const json = await response.json();

        setPost(json);
        setIsLoading(false);
      } catch {
        toast.error('Failed to load the post');
      }
    };

    fetchPosts();
  }, [postId]);

  return (
    <>
      {isLoading ? (
        <div className='loader-container'>
          <span className='loader loader-normal'></span>
        </div>
      ) : (
        <div className='container'>
          <Post
            key={`post-${post.id}`}
            authorId={post.author.id}
            firstName={post.author.firstName}
            lastName={post.author.lastName}
            username={post.author.username}
            profileImageUrl={post.author.profileImageUrl}
            dateTime={post.dateTime}
            postId={post.id}
            content={post.content}
            photoUrl={post.photoUrl}
            initialLikeCount={post._count.likedBy}
            initialIsLikedByAuthUser={post.likedByAuthUser}
            areCommentsOpen={true}
          />
        </div>
      )}
    </>
  );
}
