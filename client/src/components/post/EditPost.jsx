import { useState } from 'react';
import Header from './../layout/Header';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import xSvg from '../../assets/icons/x-circle.svg';
import supabase from '../../utils/supabase';
import { useAuth } from '../../context/authContext';

export default function EditPost() {
  const { authenticatedUser } = useAuth();
  const [content, setContent] = useState('');
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [file, setFile] = useState();
  const navigate = useNavigate();

  const uploadPost = async () => {
    if ((content.length < 1 || content.length > 320) && !file) {
      toast.error('Post text must be between 1 and 320 characters long.');
      return;
    }

    try {
      let photoUrl;

      if (isAddingPhoto && file) {
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

        const filePath = `post-photos/${authenticatedUser.id}-${Date.now()}`;

        const { data, error } = await supabase.storage
          .from('anti-anti-social')
          .upload(filePath, file, {
            upsert: true,
          });

        if (error) {
          throw new Error(error);
        }

        const { data: photoUrlData } = supabase.storage
          .from('anti-anti-social')
          .getPublicUrl(data.path);

        photoUrl = photoUrlData.publicUrl;
      }

      const response = await fetch('/api/posts/new', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, photoUrl }),
      });

      if (!response.ok) throw new Error('Failed to post');

      navigate('/');
    } catch {
      toast.error('Failed to post');
    }
  };

  return (
    <>
      <Header></Header>
      <main className='container'>
        <h1>New post</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            uploadPost();
          }}
          className='d-flex flex-column align-items-center mt-3 mb-4 w-100'
        >
          <label htmlFor='content' className='w-100'>
            <textarea
              name='content'
              id='content'
              className='form-control'
              rows={5}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </label>
          {isAddingPhoto ? (
            <div className='mt-3 d-flex gap-3 align-items-start border border-1 rounded-3 pb-3 ps-3 pl-3'>
              <label htmlFor='file' className='mt-3'>
                Select a photo
                <input
                  id='file-input'
                  type='file'
                  name='file'
                  className='form-control'
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <button
                className='btn'
                type='btn'
                onClick={() => setIsAddingPhoto(false)}
              >
                <img src={xSvg} alt='' className='x-icon' />
              </button>
            </div>
          ) : (
            <button
              className='btn border mt-3'
              type='button'
              onClick={() => setIsAddingPhoto(true)}
            >
              + Add a photo
            </button>
          )}
          <input
            type='submit'
            value='POST'
            className='btn bg-secondary text-white ps-4 pe-4 pt-2 pb-2 rounded-5 mt-3 mb-4'
          />
        </form>
      </main>
    </>
  );
}
