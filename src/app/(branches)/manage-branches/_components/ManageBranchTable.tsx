'use client';

import React, { useEffect, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import EditBranchModal from './EditBranchModal';

interface Branch {
  id: number;
  branch_name: string;
  branch_code: string;
  contact_number: string;
  email: string;
  ifsc_code: string;
}

export default function ManageBranchTable() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBranchId, setEditBranchId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    branch_name: '',
    branch_code: '',
    contact_number: '',
    email: '',
    ifsc_code: '',
  });
  const [errors, setErrors] = useState({
    branch_name: '',
    branch_code: '',
    contact_number: '',
    email: '',
    ifsc_code: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        const data = await res.json();
        setBranches(data);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
        setMessage({ type: 'error', text: 'Failed to load branches.' });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      branch_name: '',
      branch_code: '',
      contact_number: '',
      email: '',
      ifsc_code: ''
    };

    // Branch Name validation
    if (!editFormData.branch_name.trim()) {
      newErrors.branch_name = "Branch name is required";
      isValid = false;
    }

 // IFSC Code validation (must come before branch code validation)
 if (!editFormData.ifsc_code.trim()) {
  newErrors.ifsc_code = "IFSC code is required";
  isValid = false;
} else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(editFormData.ifsc_code)) {
  newErrors.ifsc_code = "Invalid format (e.g., ABCD0123456)";
  isValid = false;
}

// Branch Code validation - must match last 6 digits of IFSC
if (!editFormData.branch_code.trim()) {
  newErrors.branch_code = "Branch code is required";
  isValid = false;
} else {
  // Get last 6 digits of IFSC code
  const lastSixOfIfsc = editFormData.ifsc_code.slice(-6);
  
  // Check if branch code matches last 6 of IFSC
  if (editFormData.branch_code !== lastSixOfIfsc) {
    newErrors.branch_code = "Must match last 6 digits of IFSC code";
    isValid = false;
  }
  
  // Additional check for alphanumeric (if needed)
  if (!/^[A-Z0-9]{6}$/.test(editFormData.branch_code)) {
    newErrors.branch_code = "Must be exactly 6 alphanumeric characters";
    isValid = false;
  }
}

    // Contact Number validation
    if (editFormData.contact_number && !/^[0-9]{10}$/.test(editFormData.contact_number)) {
      newErrors.contact_number = "Must be 10 digits";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

if (editFormData.email && !emailRegex.test(editFormData.email)) {
  newErrors.email = "Please enter a valid email address";
  isValid = false;
}

    setErrors(newErrors);
    return isValid;
  };

  const openEditModal = async (branchId: number) => {
    try {
      const res = await fetch(`/api/branches/${branchId}`);
      const branch = await res.json();

      setEditBranchId(branchId);
      setEditFormData({
        branch_name: branch.branch_name || '',
        branch_code: branch.branch_code || '',
        contact_number: branch.contact_number || '',
        email: branch.email || '',
        ifsc_code: branch.ifsc_code || '',
      });
      setErrors({
        branch_name: '',
        branch_code: '',
        contact_number: '',
        email: '',
        ifsc_code: ''
      });
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to load branch for edit:', error);
      setMessage({ type: 'error', text: 'Failed to load branch for editing.' });
    }
  };

  const handleSave = async () => {
    if (!editBranchId) return;

    if (!validateForm()) return;

    try {
      const res = await fetch(`/api/branches/${editBranchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error('Failed to update branch');

      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === editBranchId
            ? { ...branch, ...editFormData }
            : branch
        )
      );

      setMessage({ type: 'success', text: 'Branch updated successfully.' });
      setModalOpen(false);
      setEditBranchId(null);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update branch.' });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const res = await fetch(`/api/branches/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      setBranches((prev) => prev.filter((branch) => branch.id !== deleteConfirmId));
      setMessage({ type: 'success', text: 'Branch deleted successfully.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete branch.' });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const DeleteConfirmationDialog = () => {
    if (!deleteConfirmId) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
          <p>Are you sure you want to delete this branch? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const columns: TableColumn<Branch>[] = [
    {
      name: 'Sr. No.',
      cell: (_row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Branch Name',
      selector: (row) => row.branch_name,
      sortable: true,
    },
    {
      name: 'Branch Code',
      selector: (row) => row.branch_code,
      sortable: true,
    },
    {
      name: 'Contact Number',
      selector: (row) => row.contact_number || '-',
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row) => row.email || '-',
      sortable: true,
    },
    {
      name: 'IFSC Code',
      selector: (row) => row.ifsc_code,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => openEditModal(row.id)}
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:underline"
            onClick={() => handleDeleteClick(row.id)}
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <div
      className={cn(
        'p-6 grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1',
        'dark:bg-gray-dark dark:shadow-card'
      )}
    >
      {message && (
        <div
          className={cn(
            'mb-4 p-3 rounded-md text-sm font-medium',
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          )}
        >
          {message.text}
        </div>
      )}

      <DataTable
        title={
          <div className="flex items-center justify-between w-full">
            <h2 className="mb-4 text-xl font-bold text-dark dark:text-white">
              Manage Branches
            </h2>
            <Link href="/add-branch">
              <button className="flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
                + Add Branch
              </button>
            </Link>
          </div>
        }
        columns={columns}
        data={branches}
        progressPending={loading}
        pagination
      />

      <EditBranchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        formData={editFormData}
        handleChange={handleChange}
        errors={errors}
      />

      <DeleteConfirmationDialog />
    </div>
  );
}