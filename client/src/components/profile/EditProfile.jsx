import { useAuth } from '../../context/authContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import supabase from '../../utils/supabase';
import { useEffect } from 'react';
import Header from '../layout/Header';
import { useNavigate } from 'react-router-dom';

const editUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters long'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long'),
  username: z.string().min(2, 'Username must be at least 2 characters long'),
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
  const { authenticatedUser, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

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
      });
    }
  }, [authenticatedUser, reset]);

  const updateUser = async (formFields) => {
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
        const filePath = `profile-photos/${authenticatedUser.id}-${Date.now()}`;

        const { data, error } = await supabase.storage
          .from('anti-anti-social')
          .upload(filePath, formFields.file, {
            upsert: true,
          });

        if (error) {
          throw new Error(error);
        }

        const { data: profileImageUrlData } = supabase.storage
          .from('anti-anti-social')
          .getPublicUrl(data.path);

        updatedFields.profileImageUrl = profileImageUrlData.publicUrl;

        delete updatedFields.file;
      }

      const response = await fetch('/api/users', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      const json = await response.json();

      setAuthenticatedUser((prev) => ({ ...prev, ...json }));
      navigate(`/user/${authenticatedUser.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save changes');
    }
  };

  return (
    <>
      <Header></Header>
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
          <label htmlFor='firstName'>
            First name
            <input
              type='text'
              name='firstName'
              id='firstName'
              {...register('firstName')}
              className='form-control mb-3'
            />
          </label>
          <label htmlFor='lastName'>
            Last name
            <input
              type='text'
              name='lastName'
              id='lastName'
              {...register('lastName')}
              className='form-control mb-3'
            />
          </label>
          <label htmlFor='username'>
            Username
            <input
              type='text'
              name='username'
              id='username'
              {...register('username')}
              className='form-control mb-3'
            />
          </label>
          <label htmlFor='file' className='mb-3'>
            New profile photo
            <input
              id='file-input'
              type='file'
              name='file'
              className='form-control mb-3'
              {...register('file')}
            />
          </label>
          <input
            type='submit'
            value='SAVE CHANGES'
            className='btn bg-primary text-white'
          />
        </form>
      </main>
    </>
  );
}
