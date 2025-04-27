'use client';

import { useState, useEffect } from 'react';
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select } from "@/components/FormElements/select";

export function AddUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    branchId: '', // Added branchId to store selected branch
  });

  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]); // To store branch data
  const router = useRouter();

  // Fetch branch data when the component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        console.log('Fetched branches:', data); // Add this
        setBranches(data);
      } catch (err) {
        setError('Failed to load branches');
        console.error(err);
      }
    };
  
    fetchBranches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          branchId: formData.branchId, // Sending branchId with the request
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add user');
      }

      router.push('/manage-user');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    }
  };

  const branchItems = branches.map((branch: { id: string; branch_name: string; ifsc_code: string }) => ({
    value: branch.id,
    label: `${branch.branch_name} (${branch.ifsc_code})`,
  }));
  console.log('Mapped items for select:', branchItems); // Add this

  return (
    <div className="mx-auto w-full">
      <ShowcaseSection title="Add New User" className="!p-6.5">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="name"
              label="Full Name"
              type="text"
              placeholder="Enter full name"
              className="w-full"
              value={formData.name}
              handleChange={handleChange}
              required
            />
            <InputGroup
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email address"
              className="w-full"
              value={formData.email}
              handleChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="password"
              label="Password"
              type="password"
              placeholder="Enter password"
              className="w-full"
              value={formData.password}
              handleChange={handleChange}
              required
            />
            <InputGroup
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              className="w-full"
              value={formData.confirmPassword}
              handleChange={handleChange}
              required
            />
          </div>

          {/* Select box for Branch */}
          <Select
            label="Branch"
            name="branchId"
            placeholder="Select Branch"
            value={formData.branchId}
            handleChange={handleChange}
            items={branchItems}
            required
          />

          {error && <p className="text-red-500">{error}</p>}

          <div className="mt-6 flex gap-3">
            <Link
              href="/manage-user"
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
