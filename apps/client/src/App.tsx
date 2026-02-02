import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from '@halaqa/shared';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import GroupDetails from './components/GroupDetails';
import Sessions from './components/Sessions';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import Users from './components/Users';
import Learners from './components/Learners';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('halaqa_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('halaqa_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('halaqa_user');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout user={currentUser} onLogout={handleLogout}>
          <Routes>
            <Route path='/' element={<Dashboard user={currentUser} />} />
            <Route path='/groups' element={<Groups user={currentUser} />} />
            <Route
              path='/groups/:id'
              element={<GroupDetails user={currentUser} />}
            />
            <Route path='/sessions' element={<Sessions user={currentUser} />} />
            <Route
              path='/attendance/:sessionId'
              element={<Attendance user={currentUser} />}
            />
            <Route path='/learners' element={<Learners user={currentUser} />} />
            <Route path='/reports' element={<Reports user={currentUser} />} />
            <Route path='/users' element={<Users user={currentUser} />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
