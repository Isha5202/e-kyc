"use client";

import { useState, useEffect } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Select } from "@/components/FormElements/select";

export function AddUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    branchId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("/api/branches");
        if (!res.ok) throw new Error("Failed to fetch branches");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          fetchError: "Failed to load branches",
        }));
        console.error(err);
      }
    };

    fetchBranches();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Branch validation
    if (!formData.branchId) {
      newErrors.branchId = "Please select a branch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          branchId: formData.branchId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add user");
      }

      router.push("/manage-user");
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        submitError: err.message || "Something went wrong.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const branchItems = branches.map(
    (branch: { id: string; branch_name: string; ifsc_code: string }) => ({
      value: branch.id,
      label: `${branch.branch_name} (${branch.ifsc_code})`,
    }),
  );

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
              error={errors.name}
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
              error={errors.email}
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
              error={errors.password}
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
              error={errors.confirmPassword}
            />
          </div>

          <Select
            label="Branch"
            name="branchId"
            placeholder="Select Branch"
            value={formData.branchId}
            handleChange={handleChange}
            items={branchItems}
            required
            error={errors.branchId}
          />

          {errors.submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{errors.submitError}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href="/manage-user"
              className="h-[40px] rounded-lg border border-gray-300 px-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-dark-3"
            >
              Back
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </ShowcaseSection>
    </div>
  );
}
