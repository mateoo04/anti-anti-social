import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import personSvg from '../../assets/icons/person-circle.svg';
import Header from '../layout/Header';
import Post from '../post/Post';
import { useAuth } from '../../context/authContext';

export default function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState({});
  const { authenticatedUser, follow, unfollow } = useAuth();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch the profile');

        const json = await response.json();

        setProfile(json);
      } catch {
        toast.error('Failed to fetch the profile');
      }
    };

    fetchAccount();
  }, [userId]);

  return (
    <>
      <Header></Header>
      <main className='container'>
        {Object.keys(profile).length ? (
          <>
            <div
              className='details d-flex gap-3 mb-3'
              key={`profile-list-item-${profile.id}`}
            >
              <img
                src={profile.profileImageUrl || personSvg}
                alt=''
                className='profile-photo-lg'
              />
              <div className='d-flex flex-column'>
                <h1 className='mb-1'>
                  {`${profile.firstName} ${profile.lastName || ''}`}
                </h1>
                <p className='text-muted'>{profile.username}</p>
              </div>
            </div>
            <p className='mb-2 preserve-newlines'>{profile.bio}</p>
            <div className='follow-stats d-flex gap-3'>
              <Link
                to={`/users/${userId}/follows`}
                className='text-decoration-none'
              >
                <p>{`${profile._count?.followers} followers`}</p>
              </Link>
              <Link
                to={`/users/${userId}/follows`}
                className='text-decoration-none'
              >
                <p>{`${profile._count?.following} following`}</p>
              </Link>
            </div>
            {profile.id != authenticatedUser.id &&
              (authenticatedUser.following?.includes(profile.id) ? (
                <button
                  className='btn bg-white border text-black unfollow-btn'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    unfollow(profile.id);
                    if (profile._count) profile._count.followers--;
                  }}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className='btn bg-primary text-white follow-btn'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    follow(profile.id);
                    if (profile._count) profile._count.followers++;
                  }}
                >
                  Follow
                </button>
              ))}
            <div className='d-flex justify-content-center mt-3'>
              {profile.id === authenticatedUser.id ? (
                <Link
                  to={'/posts/new'}
                  className='align-self-center text-decoration-none btn rounded-5 bg-secondary text-white'
                >
                  <b>+</b> NEW POST
                </Link>
              ) : (
                ''
              )}
            </div>
            <div className='posts mt-4 d-flex flex-column gap-2'>
              {profile.posts?.map((post) => {
                return (
                  <Post
                    authorId={profile.id}
                    firstName={profile.firstName}
                    lastName={profile.lastName}
                    username={profile.username}
                    profileImageUrl={profile.profileImageUrl}
                    dateTime={post.dateTime}
                    postId={post.id}
                    content={post.content}
                    photoUrl={post.photoUrl}
                    initialLikeCount={post._count?.likedBy}
                    initialIsLikedByAuthUser={post.likedByAuthUser}
                    key={'profile-posts-' + post.id}
                    removePost={() =>
                      setProfile((prev) => ({
                        ...prev,
                        posts: prev.posts.filter(
                          (postItem) => postItem.id !== post.id
                        ),
                      }))
                    }
                  ></Post>
                );
              })}
            </div>
          </>
        ) : (
          <div className='loader-container'>
            <span className='loader'></span>
          </div>
        )}
      </main>
    </>
  );
}
