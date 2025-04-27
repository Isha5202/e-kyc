'use client';

import { useState } from 'react';
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AddBranchForm() {
  const [formData, setFormData] = useState({
    branch_code: '',
    branch_name: '',
    address_line1: '',
    postal_code: '',
    contact_number: '',
    email: '',
    ifsc_code: '',
  });

  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to add branch');
      }

      router.push('/manage-branch');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="mx-auto w-full">
      <ShowcaseSection title="Add New Branch" className="!p-6.5">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="branch_code"
              label="Branch Code"
              type="text"
              placeholder="e.g., BR001"
              className="w-full"
              value={formData.branch_code}
              handleChange={handleChange}
              required
            />
            <InputGroup
              name="branch_name"
              label="Branch Name"
              type="text"
              placeholder="Full branch name"
              className="w-full"
              value={formData.branch_name}
              handleChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="address_line1"
              label="Address"
              type="text"
              placeholder="Branch address"
              className="w-full"
              value={formData.address_line1}
              handleChange={handleChange}
              required
            />
            <InputGroup
              name="postal_code"
              label="Postal Code"
              type="text"
              placeholder="ZIP or postal code"
              className="w-full"
              value={formData.postal_code}
              handleChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="contact_number"
              label="Contact Number"
              type="text"
              placeholder="Phone number"
              className="w-full"
              value={formData.contact_number}
              handleChange={handleChange}
            />
            <InputGroup
              name="email"
              label="Email"
              type="email"
              placeholder="Branch email"
              className="w-full"
              value={formData.email}
              handleChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="ifsc_code"
              label="IFSC Code"
              type="text"
              placeholder="e.g., HDFC0001234"
              className="w-full"
              value={formData.ifsc_code}
              handleChange={handleChange}
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <div className="mt-6 flex gap-3">
            <Link
              href="/manage-branch"
              className="h-[40px] rounded-lg border border-gray-300 px-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-dark-3"
            >
              Back
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Submit
            </button>
          </div>
        </form>
      </ShowcaseSection>
    </div>
  );
}
