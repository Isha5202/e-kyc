'use client';

import React, { useEffect, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import EditUserModal from './EditUserModal';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ManageUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const filtered = data.filter((user: User) => user.role !== 'admin');
        setUsers(filtered);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openEditModal = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const user = await res.json();

      setEditUserId(userId);
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        password: user.password_hash || '',
      });
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to load user for edit:', error);
    }
  };

  const handleSave = async () => {
    if (!editUserId) return;

    try {
      const res = await fetch(`/api/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error('Failed to update user');

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editUserId
            ? { ...user, name: editFormData.name, email: editFormData.email }
            : user
        )
      );

      setModalOpen(false);
      setEditUserId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete user');

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns: TableColumn<User>[] = [
    {
      name: 'Sr. No.',
      cell: (_row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
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
            onClick={() => handleDelete(row.id)}
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
      />
    </div>
  );
}

