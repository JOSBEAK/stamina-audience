import { Route, Routes, Link } from 'react-router-dom';
import ContactsPage from '../pages/contacts';
import BroadcastsPage from '../pages/broadcasts';

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

      <main className="container mx-auto p-4">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1 className="text-3xl font-bold">Welcome!</h1>
                <p className="mt-2">
                  Select a page from the navigation to get started.
                </p>
              </div>
            }
          />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/broadcasts" element={<BroadcastsPage />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;
