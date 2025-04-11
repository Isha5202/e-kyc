// src/app/(user)/manage-user/_components/ManageUserTable.tsx

'use client';

import React from 'react';
import DataTable from 'react-data-table-component';
import Link from 'next/link';
import { cn } from "@/lib/utils";

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

const columns = [
  {
    name: 'Sr. No.',
    cell: (_row: any, index: number) => index + 1,
    width: '80px',
  },
  {
    name: 'Name',
    selector: (row: any) => row.name,
    sortable: true,
  },
  {
    name: 'Email',
    selector: (row: any) => row.email,
  },
  {
    name: 'Actions',
    cell: (row: any) => (
      <div className={cn("flex gap-2")}>
        <button
          className={cn("text-blue-500 hover:underline")}
          onClick={() => alert(`Edit ${row.name}`)}
        >
          Edit
        </button>
        <button
          className={cn("text-red-500 hover:underline")}
          onClick={() => alert(`Delete ${row.name}`)}
        >
          Delete
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
];

export default function ManageUserTable() {
  return (
    <div className={cn(
      "p-6 grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1",
      "dark:bg-gray-dark dark:shadow-card"
    )}>
      <DataTable
        className={cn("flex items-center justify-between w-full")}
        title={
          <div className={cn("flex items-center justify-between w-full")}>
            <h2 className="mb-4 text-xl font-bold text-dark dark:text-white">
              Manage Users
            </h2>
            <Link href="/add-user">
              <button className={cn(
                "flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white",
                "hover:bg-opacity-90"
              )}>
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
