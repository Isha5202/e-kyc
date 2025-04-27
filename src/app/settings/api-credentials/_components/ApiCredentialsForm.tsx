'use client';

import { useEffect, useState } from 'react';
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { cn } from '@/lib/utils';

export default function ApiCredentialsForm() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data?.client_id) setClientId(data.client_id);
        if (data?.client_secret) setClientSecret(data.client_secret);
      } catch (error) {
        console.error('Failed to fetch credentials:', error);
        setMessage({ type: 'error', text: 'Failed to load credentials.' });
      }
    };
    fetchCredentials();
  }, []);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Update failed');

      setMessage({ type: 'success', text: 'API credentials updated successfully.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update API credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <ShowcaseSection title="API Credentials" className="!p-6.5">

        {/* Message */}
        {message && (
          <div
            className={cn(
              'mb-4 p-3 rounded-md text-sm font-medium',
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            )}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputGroup
            label="API Key"
            type="text"
            value={clientId}
            handleChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your API key"
          />
          <InputGroup
            label="API Secret"
            type="password"
            value={clientSecret}
            handleChange={(e) => setClientSecret(e.target.value)}
            placeholder="Enter your API secret"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </ShowcaseSection>
    </div>
  );
}
