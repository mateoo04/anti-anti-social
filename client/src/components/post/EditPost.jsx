import { useEffect, useRef, useState } from 'react';
import Header from './../layout/Header';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import xSvg from '../../assets/icons/x-circle.svg';
import imageSvg from '../../assets/icons/image.svg';
import supabase, { uploadPhoto } from '../../utils/supabase';
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

  const uploadPost = async () => {
    if (content.length < 1 || content.length > 320) {
      toast.error('Post text must be between 1 and 320 characters long.');
      return;
    }

    try {
      const uploadObj = { content };

      if (file && isAddingPhoto) {
        let photoUrlResult = await uploadPhoto(
          file,
          `post-photos/${authenticatedUser.id}-${Date.now()}`
        );
        if (photoUrlResult?.invalid) return;
        else uploadObj.photoUrl = photoUrlResult;
      }

      const response = await fetch('/api/posts/new', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadObj),
      });

      if (!response.ok) throw new Error('Failed to post');

      navigate(`/users/${authenticatedUser.id}`);
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
      const updateObj = { content };

      if (file && isAddingPhoto) {
        let photoUrlResult = await uploadPhoto(
          file,
          `post-photos/${authenticatedUser.id}-${Date.now()}`
        );
        if (photoUrlResult?.invalid) return;
        else updateObj.photoUrl = photoUrlResult;
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
              className='rounded-5 p-3 form-control'
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </label>
          {isAddingPhoto ? (
            <div className='rounded-5 d-flex flex-column mt-3 d-flex gap-1 align-items-start border border-1 rounded-3 pb-3'>
              <button
                className='btn align-self-end me-2'
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
                  className='rounded-5 form-control'
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
            className='post-btn btn bg-primary text-white ps-4 pe-4 pt-2 pb-2 rounded-5 mt-3 mb-2  '
          />
        </form>
      </main>
    </>
  );
}
