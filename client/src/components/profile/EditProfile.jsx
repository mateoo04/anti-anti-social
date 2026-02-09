import { useAuth } from '../../context/authContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import supabase, { uploadPhoto } from '../../utils/supabase';
import { useEffect, useRef } from 'react';
import Header from '../layout/Header';
import { useNavigate } from 'react-router-dom';
import personSvg from '../../assets/icons/person-circle.svg';

const editUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters long'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long'),
  username: z.string().min(2, 'Username must be at least 2 characters long'),
  bio: z
    .string()
    .min(2, 'Bio must be at least 2 characters long')
    .max(200, 'Bio cannot be longer than 200 characters')
    .nullable()
    .optional(),
  file: z
    .optional(z.instanceof(FileList))
    .transform((fileList) => {
      if (fileList && fileList.length > 0) return fileList[0];
      return undefined;
    })
    .refine((file) => {
      if (file)
        return [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ].includes(file.type);
      return true;
    }, 'Invalid file format! Please upload a JPG, PNG, GIF, WebP or SVG.'),
});

export default function EditProfile() {
  const { authenticatedUser, setAuthenticatedUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const photoRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  useEffect(() => {
    if (authenticatedUser) {
      reset({
        firstName: authenticatedUser.firstName,
        lastName: authenticatedUser.lastName,
        username: authenticatedUser.username,
        bio: authenticatedUser.bio,
      });
    }
  }, [authenticatedUser, reset]);

  const updateUser = async (formFields) => {
    let response = {};
    try {
      const updatedFields = Object.fromEntries(
        Object.entries(formFields).filter(
          ([key, value]) =>
            value != null && value != '' && value !== authenticatedUser[key]
        )
      );

      if (!Object.keys(updatedFields).length) {
        toast.error('No changes');
        return;
      }

      if (formFields.file) {
        const profileImageUrl = await uploadPhoto(
          formFields.file,
          `profile-photos/${authenticatedUser.id}-${Date.now()}`
        );

        if (profileImageUrl.invalid) return;

        updatedFields.profileImageUrl = profileImageUrl;

        delete updatedFields.file;
      }

      response = await fetch('/api/users', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (response.status === 409) {
        toast.error('Username is taken. Please choose another.');
        return;
      }

      if (!response.ok) throw new Error('Failed to save changes');

      const json = await response.json();

      setAuthenticatedUser((prev) => ({ ...prev, ...json }));
      navigate(`/users/${authenticatedUser.id}`);
    } catch (err) {
      toast.error(`Failed to save changes${response.status === 403 ? ' (you may be restricted)' : ''}`);
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

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'This will permanently delete your account. Continue?'
    );
    if (!confirmed) return;

    let response = {};
    try {
      response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      setAuthenticatedUser(null);
      navigate('/');
      toast.success('Account deleted');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <>
      <main className='container'>
        {Object.values(errors).length ? (
          <div className='bg-warning rounded-4 p-3 mb-3'>
            <ul className='ps-3 mb-0'>
              {Object.values(errors).map((error, index) => {
                return <li key={`error-${index}`}>{error.message}</li>;
              })}
            </ul>
          </div>
        ) : (
          ''
        )}
        <form
          onSubmit={handleSubmit(updateUser)}
          className='d-flex flex-column p-3'
        >
          <legend>Edit profile</legend>
          <div className='d-flex gap-3 pt-3 pb-3'>
            <img
              src={authenticatedUser.profileImageUrl || personSvg}
              alt=''
              ref={photoRef}
              className='profile-photo-lg'
            />
            <label htmlFor='file-input' className='mb-3'>
              New profile photo
              <input
                id='file-input'
                type='file'
                name='file'
                className='rounded-5 form-control mb-3'
                {...register('file')}
                onChange={(e) => {
                  setSelectedPhoto(e.target.files[0]);
                }}
              />
            </label>
          </div>
          <label htmlFor='firstName'>
            First name
            <input
              type='text'
              name='firstName'
              id='firstName'
              {...register('firstName')}
              className='rounded-5 ps-3 pe-3 form-control mb-3'
            />
          </label>
          <label htmlFor='lastName'>
            Last name
            <input
              type='text'
              name='lastName'
              id='lastName'
              {...register('lastName')}
              className='rounded-5 ps-3 pe-3 form-control mb-3'
            />
          </label>
          <label htmlFor='username'>
            Username
            <input
              type='text'
              name='username'
              id='username'
              {...register('username')}
              className='rounded-5 ps-3 pe-3 form-control mb-3'
            />
          </label>
          <label htmlFor='bio'>
            Bio
            <textarea
              name='bio'
              id='bio'
              maxLength={150}
              {...register('bio')}
              className='rounded-5 p-3 form-control mb-3'
            ></textarea>
          </label>
          <input
            type='submit'
            value='SAVE CHANGES'
            className='btn rounded-5 pt-2 pb-2 bg-secondary text-white'
          />
        </form>
        <div className='container ps-3 pe-3'>
        <button
          type='button'
          onClick={deleteAccount}
          className='btn rounded-5 pt-2 pb-2 w-100 bg-danger text-white'
        >
          DELETE ACCOUNT
        </button>
        </div>
      </main>
    </>
  );
}
