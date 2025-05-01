'use client';

import { useState, useEffect, useCallback } from 'react';
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Debounce utility function
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

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
  const [fieldErrors, setFieldErrors] = useState({
    branch_code: '',
    branch_name: '',
    address_line1: '',
    postal_code: '',
    contact_number: '',
    email: '',
    ifsc_code: ''
  });
  const router = useRouter();

  // Update branch code when IFSC code changes
  useEffect(() => {
    if (formData.ifsc_code.length === 11) {
      const lastSixDigits = formData.ifsc_code.slice(-6);
      setFormData(prev => ({ ...prev, branch_code: lastSixDigits }));
      setFieldErrors(prev => ({...prev, branch_code: ''}));
    }
  }, [formData.ifsc_code]);

  // Memoized validation function
  const validateField = useCallback((name: string, value: string) => {
    switch (name) {
      case 'branch_code':
        if (!value.trim()) return 'Branch code is required';
        if (!/^\d{6}$/.test(value)) return 'Branch code must be exactly 6 digits';
        if (formData.ifsc_code && value !== formData.ifsc_code.slice(-6)) {
          return 'Branch code must match last 6 digits of IFSC code';
        }
        return '';
      
      case 'branch_name':
        if (!value.trim()) return 'Branch name is required';
        if (value.length < 3 || value.length > 50) return 'Branch name must be 3-50 characters';
        return '';
      
      case 'address_line1':
        if (!value.trim()) return 'Address is required';
        if (value.length < 5 || value.length > 100) return 'Address must be 5-100 characters';
        return '';
      
      case 'postal_code':
        if (!value.trim()) return 'Postal code is required';
        if (!/^\d{4,10}$/.test(value)) return 'Postal code must be 4-10 digits';
        return '';
      
      case 'contact_number':
        if (!value.trim()) return 'Contact number is required';
        if (!/^\d{10,12}$/.test(value)) return 'Contact number must be 10-12 digits';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      
      case 'ifsc_code':
        if (!value.trim()) return 'IFSC code is required';
        if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(value)) return 'IFSC code must be 11 characters (e.g., ABCD0123456)';
        return '';
      
      default:
        return '';
    }
  }, [formData.ifsc_code]);

  // Debounced validation
  const debouncedValidation = useCallback(
    debounce((name: string, value: string) => {
      const errorMessage = validateField(name, value);
      setFieldErrors(prev => ({...prev, [name]: errorMessage}));
    }, 300),
    [validateField]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Always update the form data immediately
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Run debounced validation
    debouncedValidation(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submit
    let hasErrors = false;
    const newFieldErrors = {...fieldErrors};

    // Run immediate validation for all fields on submit
    Object.entries(formData).forEach(([name, value]) => {
      const errorMessage = validateField(name, value);
      newFieldErrors[name as keyof typeof newFieldErrors] = errorMessage;
      if (errorMessage) hasErrors = true;
    });

    setFieldErrors(newFieldErrors);

    if (hasErrors) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError(data.message || 'Branch already exists');
        } else {
          throw new Error(data.message || 'Failed to add branch');
        }
        return;
      }

      router.push('/manage-branches');
    } catch (err: any) {
      setError(err.message || 'Something went wrong while adding the branch');
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
              placeholder="Last 6 digits of IFSC code"
              className="w-full"
              value={formData.branch_code}
              handleChange={handleChange}
              required
              error={fieldErrors.branch_code}
              maxLength={6}
              disabled={!!formData.ifsc_code && formData.ifsc_code.length === 11}
            />
            <InputGroup
              name="branch_name"
              label="Branch Name"
              type="text"
              placeholder="Full branch name (3-50 characters)"
              className="w-full"
              value={formData.branch_name}
              handleChange={handleChange}
              required
              error={fieldErrors.branch_name}
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="address_line1"
              label="Address"
              type="text"
              placeholder="Branch address (5-100 characters)"
              className="w-full"
              value={formData.address_line1}
              handleChange={handleChange}
              required
              error={fieldErrors.address_line1}
              maxLength={100}
            />
            <InputGroup
              name="postal_code"
              label="Postal Code"
              type="text"
              placeholder="ZIP or postal code (4-10 digits)"
              className="w-full"
              value={formData.postal_code}
              handleChange={handleChange}
              required
              error={fieldErrors.postal_code}
              maxLength={10}
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="contact_number"
              label="Contact Number"
              type="text"
              placeholder="Phone number (10-12 digits)"
              className="w-full"
              value={formData.contact_number}
              handleChange={handleChange}
              required
              error={fieldErrors.contact_number}
              maxLength={12}
            />
            <InputGroup
              name="email"
              label="Email"
              type="email"
              placeholder="Branch email (e.g., branch@example.com)"
              className="w-full"
              value={formData.email}
              handleChange={handleChange}
              required
              error={fieldErrors.email}
            />
          </div>

          <div className="flex flex-col gap-4 xl:flex-row">
            <InputGroup
              name="ifsc_code"
              label="IFSC Code"
              type="text"
              placeholder="e.g., HDFC0001234 (11 characters)"
              className="w-full"
              value={formData.ifsc_code}
              handleChange={handleChange}
              required
              error={fieldErrors.ifsc_code}
              maxLength={11}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href="/manage-branches"
              className="h-[40px] rounded-lg border border-gray-300 px-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-dark-3"
            >
              Back
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              disabled={Object.values(fieldErrors).some(error => error) || 
                        Object.values(formData).some(value => !value.trim())}
            >
              Submit
            </button>
          </div>
        </form>
      </ShowcaseSection>
    </div>
  );
}