import { Link, Outlet } from 'react-router-dom';

export function App() {
  return (
    <div>
      <div className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex gap-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/contacts" className="hover:text-gray-300">
            Contacts
          </Link>
          <Link to="/broadcasts" className="hover:text-gray-300">
            Broadcasts
          </Link>
        </nav>
      </div>

      <main className="container mx-auto max-w-screen-2xl w-full p-4">
        <Outlet />
      </main>
    </div>
  );
}
