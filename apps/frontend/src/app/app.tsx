import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <div>
      <main className="container mx-auto max-w-screen-2xl w-full p-4">
        <Outlet />
      </main>
    </div>
  );
}
