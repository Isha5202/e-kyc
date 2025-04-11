'use client';

import React, { useState } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import { Lock } from 'lucide-react';

const ChangePasswordForm = () => {
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [result, setResult] = useState('');

  const handleChange = () => {
    if (newPassword !== confirm) {
      alert('❌ Passwords do not match');
      return;
    }

    setResult('✅ Password changed successfully!');

    // Reset fields after a delay
    setTimeout(() => {
      setCurrent('');
      setNewPassword('');
      setConfirm('');
      setResult('');
    }, 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <ShowcaseSection title="Change Password" className="!p-6.5">
        <form className="space-y-6">
          <InputGroup
            label="Current Password"
            placeholder="Enter your current password"
            type="password"
            value={current}
            handleChange={(e) => setCurrent(e.target.value)}
            required
            icon={<Lock size={18} />}
            iconPosition="left"
            className="w-[800px]"
          />

          <InputGroup
            label="New Password"
            placeholder="Enter new password"
            type="password"
            value={newPassword}
            handleChange={(e) => setNewPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
            iconPosition="left"
            className="w-[800px]"
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
            className=" w-[800px]"
          />

          <button
            type="button"
            onClick={handleChange}
            className="h-[50px] rounded-lg bg-green-600 px-8 py-2 text-sm font-medium text-white hover:bg-green-700 l"
          >
            Update Password
          </button>

          {result && (
            <div className="text-green-600 font-semibold pt-2">{result}</div>
          )}
        </form>
      </ShowcaseSection>
    </div>
  );
};

export default ChangePasswordForm;
