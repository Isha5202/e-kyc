'use client';
import React, { useState } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';

type ErrorWithMessage = {
  message: string;
};

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely extract error message
  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String((error as ErrorWithMessage).message);
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  }

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult('');

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword, 
          confirmPassword 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setResult('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <ShowcaseSection title="Change Password" className="!p-6.5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative w-[500px]">
            <InputGroup
              label="Current Password"
              placeholder="Enter current password"
              type="password"
              value={currentPassword}
              handleChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          
          <div className="relative w-[500px]">
            <InputGroup
              label="New Password"
              placeholder="Enter new password"
              type="password"
              value={newPassword}
              handleChange={(e) => setNewPassword(e.target.value)}
              required
              className="pl-10"
            />
          </div>
          
          <div className="relative w-[500px]">
            <InputGroup
              label="Confirm New Password"
              placeholder="Confirm your new password"
              type="password"
              value={confirmPassword}
              handleChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`h-[50px] rounded-lg px-8 py-2 text-sm font-medium text-white ${
              isLoading ? 'bg-gray-500' : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>

          {result && (
            <div className="pt-2 text-sm font-medium text-green-600">
              {result}
            </div>
          )}
          {error && (
            <div className="pt-2 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
        </form>
      </ShowcaseSection>
    </div>
  );
};

export default ChangePasswordForm;