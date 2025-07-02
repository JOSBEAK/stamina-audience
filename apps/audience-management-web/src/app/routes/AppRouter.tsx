import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ContactsPage } from '../pages/contacts';

import { App } from '../app';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <div>
            <h1 className="text-3xl font-bold">Welcome!</h1>
            <p className="mt-2">
              Select a page from the navigation to get started.
            </p>
          </div>
        ),
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
        children: [
          {
            path: 'all',
            element: <ContactsPage />,
          },
          {
            path: 'audience-lists/:audienceListId',
            element: <ContactsPage />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
} 