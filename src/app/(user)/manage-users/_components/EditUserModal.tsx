"use client";
import React, { useEffect, useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: { 
    name: string; 
    email: string; 
    password: string;
    confirmPassword: string;
    branchId: string 
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  branches: { id: number; branch_name: string; ifsc_code: string }[];
  errors?: {
    password?: string;
    confirmPassword?: string;
    submitError?: string;
  };
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSave,
  formData,
  handleChange,
  branches,
  errors = {},
}: EditUserModalProps) {
  const [branchItems, setBranchItems] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const branchItems = branches.map((branch) => ({
      value: branch.id.toString(),
      label: branch.branch_name,
    }));
    setBranchItems(branchItems);
  }, [branches]);

  if (!isOpen || !formData.name || !formData.email) return null;

  return (
    <>
      <div className="fixed inset-0 z-99 bg-black bg-opacity-10"></div>

      <div className="fixed inset-0 z-99 flex items-center justify-center">
        <div className="w-[700px] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Edit User
          </h2>

          {errors.submitError && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{errors.submitError}</p>
            </div>
          )}
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

            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                name="password"
                label="New Password"
                value={formData.password}
                handleChange={handleChange}
                placeholder="Enter new password"
                type="password"
                error={errors.password}
              />
              <InputGroup
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                handleChange={handleChange}
                placeholder="Confirm new password"
                type="password"
                error={errors.confirmPassword}
              />
            </div>

            <Select
              label="Branch"
              name="branchId"
              value={formData.branchId}
              items={branchItems}
              handleChange={handleChange}
              placeholder="Select Branch"
              required
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