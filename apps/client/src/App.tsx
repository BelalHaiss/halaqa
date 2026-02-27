import { RouterProvider } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorMonitoringBootstrap } from '@/modules/observability';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <ErrorMonitoringBootstrap />
      <OfflineIndicator />
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
