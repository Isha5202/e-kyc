'use client';
import React from 'react';
import InputGroup from '@/components/FormElements/InputGroup';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: { name: string; email: string; password: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSave,
  formData,
  handleChange,
}: EditUserModalProps) {
  if (!isOpen || !formData.name || !formData.email) return null;

  return (
<>
  {/* Backdrop */}
  <div className="fixed inset-0 z-99 bg-black bg-opacity-10"></div>

  {/* Modal */}
  <div className="fixed inset-0 z-99 flex items-center justify-center">
    <div className="w-[500px] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        Edit User
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            name="name"
            label="Name"
            value={formData.name}
            handleChange={handleChange}
            placeholder="Enter name"
            type="text"
          />
          <InputGroup
            name="email"
            label="Email"
            value={formData.email}
            handleChange={handleChange}
            placeholder="Enter email"
            type="email"
          />
        </div>
        <InputGroup
          name="password"
          label="Password"
          value={formData.password}
          handleChange={handleChange}
          placeholder="Enter new password (optional)"
          type="password"
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          className="h-[40px] rounded-lg border border-gray-300 px-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </div>
  </div>
</>

  );
}
