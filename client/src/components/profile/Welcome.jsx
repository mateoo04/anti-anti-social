import { useRef, useState } from 'react';
import { useAuth } from '../../context/authContext';
import Header from '../layout/Header';
import { toast } from 'react-toastify';
import { uploadPhoto } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import personSvg from '../../assets/icons/person-circle.svg';

export default function Welcome() {
  const { authenticatedUser, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState();
  const [bio, setBio] = useState();
  const photoRef = useRef();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (bio && (bio.length < 2 || bio.length > 50)) {
      toast.error('Bio must be between 2 and 50 characters long');
      return;
    }

    const updateObj = { bio };

    try {
      if (file) {
        let profileImageUrlResult = await uploadPhoto(
          file,
          `profile-photos/${authenticatedUser.id}-${Date.now()}`
        );
        if (profileImageUrlResult.invalid) return;
        else updateObj.profileImageUrl = profileImageUrlResult;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateObj),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      const json = await response.json();

      setAuthenticatedUser((prev) => ({ ...prev, ...json }));
      navigate(`/users/${authenticatedUser.id}`);
    } catch {
      toast.error('Failed to save changes');
    }
  };

  const setSelectedPhoto = (selectedPhoto) => {
    if (selectedPhoto && photoRef.current) {
      const reader = new FileReader();
      reader.onload = (e) => {
        photoRef.current.src = e.target.result;
      };
      reader.readAsDataURL(selectedPhoto);
    }
  };

  return (
    <>
      <main className='container'>
        <h1>
          Welcome, {authenticatedUser.firstName} {authenticatedUser.lastName}!
        </h1>
        <form
          onSubmit={handleSubmit}
          className='d-flex flex-column pt-3 align-items-start'
        >
          <legend>Just a few more things..</legend>
          <div className='d-flex flex-column gap-3 align-items-center'>
            <div className='d-flex align-items-center gap-3 pt-3 pb-3'>
              <img
                src={authenticatedUser.profileImageUrl || personSvg}
                alt=''
                ref={photoRef}
                className='profile-photo-lg'
              />
              <label htmlFor='file'>
                Profile picture
                <input
                  id='file-input'
                  type='file'
                  name='file'
                  className='form-control'
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setSelectedPhoto(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          </div>
          <label htmlFor='bio'>
            Bio
            <textarea
              name='bio'
              id='bio'
              maxLength={150}
              onChange={(e) => setBio(e.target.value)}
              className='form-control mb-3'
            ></textarea>
          </label>
          <input
            type='submit'
            value='SAVE'
            className='btn bg-secondary text-white'
          />
        </form>
      </main>
    </>
  );
}
