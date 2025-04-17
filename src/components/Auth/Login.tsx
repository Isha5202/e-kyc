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
    console.log('[handleChange] Field changed:', e.target.name, e.target.value);
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
  
      console.log('[handleSubmit] Response status:', res.status);
  
      let result = {};
      const text = await res.text();
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (err) {
          console.error('[handleSubmit] Failed to parse JSON:', err);
        }
      }
  
      console.log('[handleSubmit] Response JSON:', result);
  
      if (!res.ok) {
        setError((result as any)?.error || 'Login failed');
        setData({ email: '', password: '' }); // ✅ Clear fields on error
        setLoading(false);
        return;
      }
  
      const role = (result as any)?.role;
  
      if (role === 'admin') {
        await router.push('/');
      } else if (role === 'user') {
        await router.push('/users');
      } else {
        console.warn('[handleSubmit] Unknown role, redirecting to /login');
        await router.push('/login');
      }
    } catch (error) {
      console.error('[handleSubmit] Unexpected error:', error);
      setError('Something went wrong.');
      setData({ email: '', password: '' }); // ✅ Also reset here for server errors
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white ">


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

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
