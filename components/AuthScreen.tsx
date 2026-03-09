import React, { useState } from 'react';
import { AuthUser, signIn, signUp } from '../services/auth';

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = mode === 'signup'
      ? signUp(email, username, password)
      : signIn(email, password);

    if (!result.ok || !result.user) {
      setError(result.error || 'Something went wrong.');
      return;
    }

    onAuthenticated(result.user);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#EEF5F4] rounded-[2rem] p-8 shadow-xl">
        <h1 className="text-3xl font-display font-black text-center text-[#2E2E2E]">MindBloom</h1>
        <p className="text-center text-sm text-[#3B3B3B]/60 mt-2">
          {mode === 'signup' ? 'Create your account to continue' : 'Sign in to your account'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-4 rounded-xl border border-[#EEF5F4] bg-[#FAF9F6]"
          />

          {mode === 'signup' && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full p-4 rounded-xl border border-[#EEF5F4] bg-[#FAF9F6]"
            />
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full p-4 rounded-xl border border-[#EEF5F4] bg-[#FAF9F6]"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" className="w-full bg-[#4E8B83] text-white py-3 rounded-xl font-bold">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signup' ? 'signin' : 'signup');
            setError('');
          }}
          className="w-full mt-4 text-sm text-[#4E8B83] font-semibold"
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>

        <p className="text-[11px] text-[#3B3B3B]/45 mt-5">
          Note: This is a local demo auth flow. For production email delivery and secure auth, connect Firebase/Auth0/Supabase backend.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
