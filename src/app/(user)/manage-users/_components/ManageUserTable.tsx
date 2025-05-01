'use client';

import React, { useEffect, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import EditUserModal from './EditUserModal';
import { authHelpers } from '@/lib/schema';

interface Branch {
  id: number;
  branch_name: string;
  ifsc_code: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branchName: string | null;
  branchId: number | null;
}

interface EditFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  branchId: string;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ManageUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    branchId: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const filtered = data.filter((user: User) => user.role !== 'admin');
        setUsers(filtered);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setMessage({ type: 'error', text: 'Failed to load users.' });
      } finally {
        setLoading(false);
      }
    };

    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        const data = await res.json();
        setBranches(data);
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };

    fetchUsers();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const openEditModal = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const user = await res.json();

      setEditUserId(userId);
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Always empty for new password
        confirmPassword: '', // Always empty for confirmation
        branchId: user.branchId ? user.branchId.toString() : '',
      });
      setFormErrors({ name: '', email: '', password: '', confirmPassword: '' });
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to load user for edit:', error);
      setMessage({ type: 'error', text: 'Failed to load user for editing.' });
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };

    // Name validation (only alphabets and spaces)
    if (!editFormData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(editFormData.name.trim())) {
      newErrors.name = 'Name should contain only alphabets';
      isValid = false;
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Email validation
    if (!editFormData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if ( !emailRegex.test(editFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Only validate password if it's not empty
    if (editFormData.password) {
      const passwordValidation = authHelpers.validatePasswordComplexity(editFormData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message || 'Password does not meet complexity requirements';
        isValid = false;
      }

      if (editFormData.password !== editFormData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!editUserId) return;

    if (!validateForm()) {
      return;
    }

    try {
      const payload: {
        name: string;
        email: string;
        branchId: number;
        password?: string;
      } = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        branchId: Number(editFormData.branchId),
      };

      // Only include password if it's not empty
      if (editFormData.password) {
        payload.password = editFormData.password;
      }

      const res = await fetch(`/api/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        // User with this email already exists
        setFormErrors(prev => ({
          ...prev,
          email: 'User with this email already exists'
        }));
        return;
      }
      throw new Error(data.message || 'Failed to update user');
    }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editUserId
            ? { 
                ...user, 
                name: editFormData.name.trim(), 
                email: editFormData.email.trim(), 
                branchName: getBranchName(Number(editFormData.branchId)),
                branchId: Number(editFormData.branchId)
              }
            : user
        )
      );

      setMessage({ type: 'success', text: 'User updated successfully.' });
      setModalOpen(false);
      setEditUserId(null);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update user.' });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const res = await fetch(`/api/users/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      setUsers((prev) => prev.filter((user) => user.id !== deleteConfirmId));
      setMessage({ type: 'success', text: 'User deleted successfully.' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to delete user.' });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For name field, only allow alphabets and spaces
    if (name === 'name') {
      // Only update if the input is alphabetic or space
      if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
        setEditFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    setFormErrors(prev => ({
      ...prev,
      [name]: '',
      ...(name === 'password' && { confirmPassword: '' })
    }));
  };

  const getBranchName = (branchId: number): string => {
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.branch_name : 'N/A';
  };

  const DeleteConfirmationDialog = () => {
    if (!deleteConfirmId) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
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

  const columns: TableColumn<User>[] = [
    {
      name: 'Sr. No.',
      cell: (_row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: 'Branch Name',
      selector: (row) => row.branchName || 'N/A',
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
              Manage Users
            </h2>
            <Link href="/add-user">
              <button className="flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
                + Add User
              </button>
            </Link>
          </div>
        }
        columns={columns}
        data={users}
        progressPending={loading}
        pagination
      />

      <EditUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        formData={editFormData}
        handleChange={handleChange}
        branches={branches}
        errors={formErrors}
      />

      <DeleteConfirmationDialog />
    </div>
  );
}