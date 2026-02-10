import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { queryClient } from '@/lib/query-client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
      <Toaster position='top-center' richColors />
    </ThemeProvider>
  </QueryClientProvider>
);
