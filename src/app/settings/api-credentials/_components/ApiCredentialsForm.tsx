'use client';

import { useEffect, useState } from 'react';
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function ApiCredentialsForm() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCredentials = async () => {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data?.client_id) setClientId(data.client_id);
      if (data?.client_secret) setClientSecret(data.client_secret);
    };
    fetchCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
      headers: { 'Content-Type': 'application/json' },
    });
    setLoading(false);
    alert('API credentials updated!');
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <ShowcaseSection title="API Credentials" className="!p-6.5">
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
