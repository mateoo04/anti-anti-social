export async function homePageLoader() {
  const response = await fetch('/api/posts?limit=4', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to load posts');

  const json = await response.json();

  return json;
}
