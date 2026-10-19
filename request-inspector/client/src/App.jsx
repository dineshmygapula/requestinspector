import { useState, useCallback } from 'react';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth')) || null; } catch { return null; }
  });

  const onAuth = (data) => {
    setAuth(data);
    localStorage.setItem('auth', JSON.stringify(data));
  };
  const onLogout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem('auth');
  }, []);

  return auth
    ? <Dashboard token={auth.token} email={auth.email} onLogout={onLogout} />
    : <Login onAuth={onAuth} />;
}
