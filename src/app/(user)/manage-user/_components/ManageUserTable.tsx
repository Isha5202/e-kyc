'use client';

import React, { useEffect, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import InputGroup from "@/components/FormElements/InputGroup";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CustomColumn extends TableColumn<User> {
  $allowOverflow?: boolean;
  $button?: boolean;
}

export default function ManageUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; email: string }>({ name: '', email: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const filteredUsers = data.filter((user: User) => user.role !== 'admin');
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditUserId(user.id);
    setEditFormData({ name: user.name, email: user.email });
  };

  const handleCancel = () => {
    setEditUserId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) throw new Error('Failed to update user');

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...editFormData } : user))
      );
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

  const rawColumns: CustomColumn[] = [
    {
      name: 'Sr. No.',
      cell: (_row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Name',
      cell: (row) =>
        editUserId === row.id ? (
          <InputGroup
            name="name"
            className="w-full rounded border px-2 py-1 text-sm"
            value={editFormData.name}
            handleChange={handleChange}
          />
        ) : (
          row.name
        ),
      sortable: true,
    },
    {
      name: 'Email',
      cell: (row) =>
        editUserId === row.id ? (
          <InputGroup
            name="email"
            className="w-full rounded border px-2 py-1 text-sm"
            value={editFormData.email}
            handleChange={handleChange}
          />
        ) : (
          row.email
        ),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) =>
        editUserId === row.id ? (
          <div className="flex gap-2">
            <button className="text-green-600 hover:underline" onClick={() => handleSave(row.id)}>
              Save
            </button>
            <button className="text-gray-500 hover:underline" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="text-blue-500 hover:underline" onClick={() => handleEdit(row)}>
              Edit
            </button>
            <button className="text-red-500 hover:underline" onClick={() => handleDelete(row.id)}>
              Delete
            </button>
          </div>
        ),
      ignoreRowClick: true,
    },
  ];

  const columns: TableColumn<User>[] = rawColumns.map(({ $allowOverflow, $button, ...col }) => ({
    ...col,
    ...(!!$allowOverflow && { allowOverflow: true }),
    ...(!!$button && { button: true }),
  }));

  return (
    <div className={cn(
      "p-6 grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1",
      "dark:bg-gray-dark dark:shadow-card"
    )}>
      <DataTable
        title={
          <div className="flex items-center justify-between w-full">
            <h2 className="mb-4 text-xl font-bold text-dark dark:text-white">Manage Users</h2>
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
    </div>
  );
}
