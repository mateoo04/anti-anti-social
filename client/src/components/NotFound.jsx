import { Link } from 'react-router-dom';
import Header from './layout/Header';

export default function NotFound() {
  return (
    <>
      <main className='container d-flex justify-content-center'>
        <div className='mt-5'>
          <h2>Page not found</h2>
          <Link className='text-primary' to='/'>
            Go to the Home screen
          </Link>
        </div>
      </main>
    </>
  );
}
