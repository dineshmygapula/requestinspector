import { useState } from 'react';
import { request } from './api.js';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await request(`/auth/${mode}`, { method: 'POST', body: { email, password } });
      onAuth(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card auth">
      <h1>Request Inspector</h1>
      <p className="muted">{mode === 'login' ? 'Sign in to view traffic' : 'Create an account'}</p>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (6+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </div>
  );
}
