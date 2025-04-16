'use client';

import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import Link from 'next/link';
import { cn } from "@/lib/utils";

// Sample data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

// Declare a custom type for your columns with transient props
interface CustomColumn extends TableColumn<any> {
  $allowOverflow?: boolean;
  $button?: boolean;
}

// Use transient props (they won’t go to DOM)
const rawColumns: CustomColumn[] = [
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
  },
  {
    name: 'Actions',
    cell: (row) => (
      <div className="flex gap-2">
        <button
          className="text-blue-500 hover:underline"
          onClick={() => alert(`Edit ${row.name}`)}
        >
          Edit
        </button>
        <button
          className="text-red-500 hover:underline"
          onClick={() => alert(`Delete ${row.name}`)}
        >
          Delete
        </button>
      </div>
    ),

    ignoreRowClick: true,
  },
];

// Map transient props into real props that `react-data-table-component` uses
const columns: TableColumn<any>[] = rawColumns.map(({ $allowOverflow, $button, ...col }) => ({
  ...col,
  ...(!!$allowOverflow && { allowOverflow: true }),
  ...(!!$button && { button: true }),
}));

// Component
export default function ManageUserTable() {
  return (
    <div className={cn(
      "p-6 grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1",
      "dark:bg-gray-dark dark:shadow-card"
    )}>
      <DataTable
        className="flex items-center justify-between w-full"
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
        pagination
      />
    </div>
  );
}
