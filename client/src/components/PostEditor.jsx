import { useState } from 'react';
import Header from './partials/Header';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function PostEditor() {
  const [content, setContent] = useState({});
  const navigate = useNavigate();

  const uploadPost = async () => {
    try {
      const response = await fetch('/api/posts/new', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
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
          <input
            type='submit'
            value='POST'
            className='btn bg-secondary text-white ps-4 pe-4 pt-2 pb-2 rounded-5 mt-4 mb-4'
          />
        </form>
      </main>
    </>
  );
}
