"use client";
import React from "react";
import InputGroup from "@/components/FormElements/InputGroup";

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: { 
    branch_name: string; 
    branch_code: string; 
    contact_number: string; 
    email: string; 
    ifsc_code: string 
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    branch_name?: string;
    branch_code?: string;
    contact_number?: string;
    email?: string;
    ifsc_code?: string;
  };
}

export default function EditBranchModal({
  isOpen,
  onClose,
  onSave,
  formData,
  handleChange,
  errors = {},
}: EditBranchModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-99 bg-black bg-opacity-10"></div>
      <div className="fixed inset-0 z-99 flex items-center justify-center">
        <div className="w-[800px] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Edit Branch</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              name="branch_name"
              label="Branch Name"
              value={formData.branch_name}
              handleChange={handleChange}
              placeholder="Enter branch name"
              type="text"
              required
              error={errors.branch_name}
            />
            <InputGroup
              name="branch_code"
              label="Branch Code"
              value={formData.branch_code}
              handleChange={handleChange}
              placeholder="Enter branch code"
              type="text"
              required
              error={errors.branch_code}
            />
            <InputGroup
              name="contact_number"
              label="Contact Number"
              value={formData.contact_number}
              handleChange={handleChange}
              placeholder="Enter contact number"
              type="tel"
              error={errors.contact_number}
            />
            <InputGroup
              name="email"
              label="Email"
              value={formData.email}
              handleChange={handleChange}
              placeholder="Enter email"
              type="email"
              error={errors.email}
            />
            <InputGroup
              name="ifsc_code"
              label="IFSC Code"
              value={formData.ifsc_code}
              handleChange={handleChange}
              placeholder="Enter IFSC code"
              type="text"
              required
              error={errors.ifsc_code}
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