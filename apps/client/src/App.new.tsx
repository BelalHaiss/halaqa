import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { storageService } from '@/services';
import { User } from '@halaqa/shared';

// Modules
import { LoginView } from '@/modules/auth';
import { DashboardView } from '@/modules/dashboard';
import { GroupsView, GroupDetailsView } from '@/modules/groups';

// Legacy Components (to be refactored)
import Layout from '@/components/Layout';
import Sessions from '@/components/Sessions';
import Attendance from '@/components/Attendance';
import Reports from '@/components/Reports';
import Users from '@/components/Users';
import CreateGroupModal from '@/components/CreateGroupModal';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = storageService.getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const savedUser = storageService.getUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storageService.clearAll();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LoginView onLoginSuccess={handleLoginSuccess} />
          <Toaster position='top-center' richColors />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Layout user={currentUser} onLogout={handleLogout}>
            <Routes>
              <Route path='/' element={<DashboardView user={currentUser} />} />
              <Route
                path='/groups'
                element={
                  <GroupsView
                    user={currentUser}
                    onCreateGroup={() => setShowCreateGroupModal(true)}
                  />
                }
              />
              <Route path='/groups/:id' element={<GroupDetailsView />} />
              <Route
                path='/sessions'
                element={<Sessions user={currentUser} />}
              />
              <Route
                path='/attendance/:sessionId'
                element={<Attendance user={currentUser} />}
              />
              <Route path='/reports' element={<Reports user={currentUser} />} />
              <Route path='/users' element={<Users user={currentUser} />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Layout>

          {/* Modals */}
          {showCreateGroupModal && (
            <CreateGroupModal
              isOpen={showCreateGroupModal}
              onClose={() => setShowCreateGroupModal(false)}
            />
          )}
        </Router>
        <Toaster position='top-center' richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
