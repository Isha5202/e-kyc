'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import InputGroup from '../FormElements/InputGroup';

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('[Login] Submitting login with data:', data);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('[Login] Raw response:', res);

      const result = await res.json();
      console.log('[Login] Parsed response JSON:', result);

      if (!res.ok) {
        setError(result?.error || 'Login failed');
        setData({ email: '', password: '' });
        return;
      }

      const { role, token } = result;

      console.log('[Login] Role returned from server:', role);
      console.log('[Login] Token returned from server:', token);

      if (!token) {
        console.warn('[Login] Warning: No token received in response!');
      }

      // Redirect based on role
      switch (role) {
        case 'admin':
          console.log('[Login] Redirecting to admin dashboard');
          router.push('/');
          break;
        case 'user':
          console.log('[Login] Redirecting to user dashboard');
          router.push('/users');
          break;
        default:
          console.log('[Login] Role not recognized. Redirecting to login page.');
          router.push('/login');
      }
    } catch (err) {
      console.error('[Login] Unexpected error:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <InputGroup
        type="email"
        label="Email"
        name="email"
        placeholder="Enter email"
        value={data.email}
        handleChange={handleChange}
        className="mb-4"
      />
      <InputGroup
        type="password"
        label="Password"
        name="password"
        placeholder="Enter password"
        value={data.password}
        handleChange={handleChange}
        className="mb-4"
      />

      <div className="flex justify-center">
        <button
          type="submit"
          className="w-[180px] mt-4 bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
}
