import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../layout/Header';
import ProfilesList from '../profile/ProfilesList';
import arrowLeft from '../../assets/icons/arrow-left.svg';

export default function FollowsList() {
  const { userId } = useParams();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(
          `/api/users/${userId}?includeFollows=true`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

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
      <main className='container'>
        {profile.username && (
          <div className='d-flex gap-3'>
            <Link to={`/users/${profile.id}`}>
              <img
                src={arrowLeft}
                alt={`Back to user's profile`}
                className='back-button'
              />
            </Link>
            <h1 className='h4'>{profile.firstName + ' ' + profile.lastName}</h1>
          </div>
        )}
        <ul className='nav nav-underline mb-3'>
          <li className='nav-item'>
            <button
              className='nav-link active text-black'
              id='nav-followers-tab'
              data-bs-toggle='tab'
              data-bs-target='#nav-followers'
              type='button'
              role='tab'
              aria-controls='nav-followers'
              aria-selected='true'
            >
              Followers
            </button>
          </li>
          <li className='nav-item'>
            <button
              className='nav-link text-black'
              id='nav-following-tab'
              data-bs-toggle='tab'
              data-bs-target='#nav-following'
              type='button'
              role='tab'
              aria-controls='nav-following'
              aria-selected='false'
            >
              Following
            </button>
          </li>
        </ul>

        <div className='tab-content' id='nav-tabContent'>
          <div
            className='tab-pane fade show active'
            id='nav-followers'
            role='tabpanel'
            aria-labelledby='nav-followers-tab'
            tabIndex='0'
          >
            {profile?.followers ? (
              <ProfilesList
                users={profile.followers}
                onEmptyMessage={'No followers'}
              ></ProfilesList>
            ) : (
              'Loading...'
            )}
          </div>
          <div
            className='tab-pane fade'
            id='nav-following'
            role='tabpanel'
            aria-labelledby='nav-following-tab'
            tabIndex='0'
          >
            {profile?.following ? (
              <ProfilesList
                users={profile.following}
                onEmptyMessage={'Not following any profiles'}
              ></ProfilesList>
            ) : (
              'Loading...'
            )}
          </div>
        </div>
      </main>
    </>
  );
}
