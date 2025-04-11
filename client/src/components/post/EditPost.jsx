import { useEffect, useRef, useState } from 'react';
import Header from './../layout/Header';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import xSvg from '../../assets/icons/x-circle.svg';
import imageSvg from '../../assets/icons/image.svg';
import supabase from '../../utils/supabase';
import { useAuth } from '../../context/authContext';

export default function EditPost() {
  const { postId } = useParams();
  const { authenticatedUser } = useAuth();
  const photoRef = useRef();
  const navigate = useNavigate();

  const [existingPhotoUrl, setExistingPhotoUrl] = useState();
  const [file, setFile] = useState();
  const [content, setContent] = useState('');

  const [isAddingPhoto, setIsAddingPhoto] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch the post');

        const json = await response.json();

        setContent(json.content);
        if (json.photoUrl) setExistingPhotoUrl(json.photoUrl);
      } catch {
        toast.error('Failed to fetch the post');
      }
    };

    if (postId) fetchPost();
  }, [postId]);

  const uploadImage = async () => {
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
        return { invalid: true };
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

      return photoUrlData.publicUrl;
    }

    return undefined;
  };

  const uploadPost = async () => {
    if (content.length < 1 || content.length > 320) {
      toast.error('Post text must be between 1 and 320 characters long.');
      return;
    }

    try {
      let photoUrl = await uploadImage();
      if (photoUrl?.invalid) return;

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

  const updatePost = async () => {
    if (content.length < 1 || content.length > 320) {
      toast.error('Post text must be between 1 and 320 characters long.');
      return;
    }

    try {
      let updateObj = { content };
      if (file) {
        const photoUrl = await uploadImage();
        if (photoUrl?.invalid) return;
        else updateObj.photoUrl = photoUrl;
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateObj),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      navigate(`/user/${authenticatedUser.id}`);
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
      <Header></Header>
      <main className='container'>
        <h1>{postId ? 'Edit post' : 'New post'}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            postId ? updatePost() : uploadPost();
          }}
          className='d-flex flex-column align-items-center mt-3 mb-4 w-100'
        >
          <label htmlFor='content' className='w-100'>
            <textarea
              name='content'
              id='content'
              className='form-control'
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </label>
          {isAddingPhoto ? (
            <div className='d-flex flex-column mt-3 d-flex gap-1 align-items-start border border-1 rounded-3 pb-3'>
              <button
                className='btn align-self-end'
                type='btn'
                onClick={() => setIsAddingPhoto(false)}
              >
                <img src={xSvg} alt='' className='x-icon' />
              </button>
              <div className='border-top border-bottom w-100 d-flex justify-content-center align-items-center uploaded-image-container'>
                <img
                  src={existingPhotoUrl || imageSvg}
                  alt=''
                  ref={photoRef}
                  className='uploaded-image'
                />
              </div>
              <label htmlFor='file-input' className='ps-3 pe-3'>
                Select a photo
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
            value={postId ? 'SAVE' : 'POST'}
            className='btn bg-secondary text-white ps-4 pe-4 pt-2 pb-2 rounded-5 mt-3 mb-2  '
          />
        </form>
      </main>
    </>
  );
}
