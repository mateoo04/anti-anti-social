import { Link } from 'react-router-dom';
import Header from './layout/Header';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Post from './post/Post';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to load posts');

        const json = await response.json();

        setPosts(json);
        setIsLoading(false);
      } catch {
        toast.error('Failed to load posts');
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Header></Header>
      <main className='container d-flex flex-column'>
        <Link
          to={'/posts/new'}
          className='align-self-center text-decoration-none btn rounded-5 bg-secondary text-white'
        >
          <b>+</b> NEW POST
        </Link>
        <div className='posts mt-5 d-flex flex-column gap-2'>
          {posts.length ? (
            posts?.map((post) => {
              return (
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
                ></Post>
              );
            })
          ) : isLoading ? (
            <div className='loader-container'>
              <span className='loader'></span>
            </div>
          ) : (
            <p className='text-center'>
              Follow other users to see posts.{' '}
              <Link
                className='text-secondary text-decoration-none link link-hover-decoration'
                to={'/search'}
              >
                Click here to find accounts to follow!
              </Link>
            </p>
          )}
        </div>
      </main>
    </>
  );
}
