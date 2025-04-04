import { useAuth } from '../context/authContext';

export default function Home() {
  const { authenticatedUser } = useAuth();

  return (
    <>
      <h1>Hello {authenticatedUser.username}!</h1>
    </>
  );
}
