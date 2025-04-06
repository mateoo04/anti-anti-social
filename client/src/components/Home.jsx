import { useAuth } from '../context/authContext';
import Header from './partials/Header';

export default function Home() {
  const { authenticatedUser } = useAuth();

  return (
    <>
      <Header></Header>
      <h1>Hello {authenticatedUser.username}!</h1>
    </>
  );
}
