import { getProviders, signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) setError(res.error);
    if (res?.ok) window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <button
          className="w-full mb-2 py-2 px-4 rounded bg-black text-white"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
        <button
          className="w-full mb-4 py-2 px-4 rounded bg-gray-800 text-white"
          onClick={() => signIn('github')}
        >
          Sign in with GitHub
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-blue-600 text-white"
          >
            Sign in with Email
          </button>
        </form>
      </div>
    </div>
  );
} 