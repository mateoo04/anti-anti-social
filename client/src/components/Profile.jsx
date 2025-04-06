import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import personSvg from '../assets/icons/person-circle.svg';
import Header from './partials/Header';

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
        toast.err('Failed to fetch the profile');
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
                src={profile.profilePhotoUrl || personSvg}
                alt=''
                className='main-profile-photo'
              />
              <div className='d-flex flex-column'>
                <h1 className='mb-1'>
                  {profile.firstName + ' ' + profile.lastName}
                </h1>
                <p className='text-secondary'>{profile.username}</p>
              </div>
            </div>
            <div className='follow-stats d-flex gap-3'>
              <p>{`${profile._count?.followers} followers`}</p>
              <p>{`${profile._count?.following} following`}</p>
            </div>
          </>
        ) : (
          'Loading...'
        )}
      </main>
    </>
  );
}
