import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import personSvg from '../../assets/icons/person-circle.svg';
import Header from '../layout/Header';
import Post from '../post/Post';

export default function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState({});

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
        {profile ? (
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
                  {profile.firstName + ' ' + profile.lastName}
                </h1>
                <p className='text-muted'>{profile.username}</p>
              </div>
            </div>
            <div className='follow-stats d-flex gap-3'>
              <Link
                to={`/user/${userId}/follows`}
                className='text-decoration-none'
              >
                <p>{`${profile._count?.followers} followers`}</p>
              </Link>
              <Link
                to={`/user/${userId}/follows`}
                className='text-decoration-none'
              >
                <p>{`${profile._count?.following} following`}</p>
              </Link>
            </div>
            <div className='posts mt-5 d-flex flex-column gap-2'>
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
                    initialLikeCount={post._count?.likedBy}
                    initialIsLikedByAuthUser={post.likedByAuthUser}
                    key={'profile-posts-' + post.id}
                  ></Post>
                );
              })}
            </div>
          </>
        ) : (
          'Loading...'
        )}
      </main>
    </>
  );
}
