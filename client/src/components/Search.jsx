import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ProfilesList from './profile/ProfilesList';
import { useAuth } from '../context/authContext';
import Header from './layout/Header';

export default function Search() {
  const { authenticatedUser, setAuthenticatedUser } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?search=${search}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Error fetching users');

        const json = await response.json();

        setUsers(json);
      } catch {
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, [search]);
  return (
    <>
      <main className='container'>
        <h1>Search</h1>
        <input
          type='text'
          id='userSearch'
          name='userSearch'
          onChange={(e) => setSearch(e.target.value)}
          className='form-control mb-3 rounded-5 ps-3 pe-3'
        />
        <ProfilesList
          authenticatedUser={authenticatedUser}
          setAuthenticatedUser={setAuthenticatedUser}
          users={users}
          onEmptyMessage={'No results'}
        ></ProfilesList>
      </main>
    </>
  );
}
