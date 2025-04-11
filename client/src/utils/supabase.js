import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_API_KEY
);

export default supabase;

export async function uploadPhoto(file, filePath) {
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

  return profileImageUrlData.publicUrl;
}
