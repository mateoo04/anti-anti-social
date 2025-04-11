import { useRef, useState } from 'react';
import { useAuth } from '../../context/authContext';
import Header from '../layout/Header';
import { toast } from 'react-toastify';
import supabase from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import personSvg from '../../assets/icons/person-circle.svg';

export default function Welcome() {
  const { authenticatedUser, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState();
  const photoRef = useRef();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please upload an image!');
      return;
    }

    if (
      ![
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ].includes(file.type)
    ) {
      toast.error(
        'Invalid file format! Please upload a JPG, PNG, GIF, WebP or SVG.'
      );
      return;
    }

    const filePath = `profile-photos/${authenticatedUser.id}-${Date.now()}`;

    const { data, error } = await supabase.storage
      .from('anti-anti-social')
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      throw new Error(error);
    }

    const { data: profileImageUrlData } = supabase.storage
      .from('anti-anti-social')
      .getPublicUrl(data.path);

    const response = await fetch('/api/users', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileImageUrl: profileImageUrlData.publicUrl }),
    });

    if (!response.ok) throw new Error('Failed to save the image');

    const json = await response.json();

    setAuthenticatedUser((prev) => ({ ...prev, ...json }));
    navigate(`/user/${authenticatedUser.id}`);
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
      <Header></Header>
      <main className='container'>
        <h1>
          Welcome, {authenticatedUser.firstName} {authenticatedUser.lastName}!
        </h1>
        <form
          onSubmit={handleSubmit}
          className='d-flex flex-column pt-3 align-items-start'
        >
          <legend>One more step, upload a profile picture:</legend>
          <div className='d-flex gap-3 align-items-center'>
            <div className='d-flex align-items-center gap-3 pt-3 pb-3'>
              <img
                src={authenticatedUser.profileImageUrl || personSvg}
                alt=''
                ref={photoRef}
                className='profile-photo-lg'
              />
              <label htmlFor='file'>
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
            <input
              type='submit'
              value='SAVE'
              className='btn bg-primary text-white'
            />
          </div>
        </form>
      </main>
    </>
  );
}
