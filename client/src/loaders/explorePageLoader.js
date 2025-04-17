//povisi limit na 15 svugdje kad si gotov
export async function explorePageLoader() {
  const response = await fetch('/api/posts/explore?limit=4', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to load posts');

  const json = await response.json();

  return json;
}
