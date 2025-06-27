import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './app/routes/AppRouter';
import './styles.css';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
         <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
