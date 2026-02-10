import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
