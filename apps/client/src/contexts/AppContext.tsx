import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import { type User } from '@halaqa/shared';
import { storageService } from '@/services';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = storageService.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    storageService.clearAll();
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
