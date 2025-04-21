'use client';

import React, { useState } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import { Lock } from 'lucide-react';

const ChangePasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleChange = async () => {
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      setResult('');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setResult('');
        return;
      }

      setResult('Password changed successfully!');
      setError('');

      // Reset fields after a delay
      setTimeout(() => {
        setNewPassword('');
        setConfirm('');
        setResult('');
      }, 2000);
    } catch (err) {
      setError('Failed to update password');
      setResult('');
    }
  };

  return (
    <div className="mx-auto w-full">
      <ShowcaseSection title="Change Password" className="!p-6.5">
        <form className="space-y-6">
          <InputGroup
            label="New Password"
            placeholder="Enter new password"
            type="password"
            value={newPassword}
            handleChange={(e) => setNewPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
            iconPosition="left"
            className="w-[500px]"
          />
          <InputGroup
            label="Confirm New Password"
            placeholder="Confirm your new password"
            type="password"
            value={confirm}
            handleChange={(e) => setConfirm(e.target.value)}
            required
            icon={<Lock size={18} />}
            iconPosition="left"
            className=" w-[500px]"
          />

          <button
            type="button"
            onClick={handleChange}
            className="h-[50px] rounded-lg bg-blue-900 px-8 py-2 text-sm font-medium text-white hover:bg-blue-900"
          >
            Update Password
          </button>

          {result && <div className="text-green-600 font-semibold pt-2">{result}</div>}
          {error && <div className="text-red-600 font-semibold pt-2">{error}</div>}
        </form>
      </ShowcaseSection>
    </div>
  );
};

export default ChangePasswordForm;
