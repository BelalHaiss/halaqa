import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorMonitoringBootstrap } from '@/modules/observability';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <ErrorMonitoringBootstrap />
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
