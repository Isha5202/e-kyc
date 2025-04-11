// src/app/settings/service-log/_components/ServiceLogTable.tsx

'use client';

import DataTable from 'react-data-table-component';
import { cn } from '@/lib/utils';

const logs = [
  { id: 1, name: 'John Doe', type: 'Aadhar', time: '2025-04-11 10:30 AM', amount: 1.5 },
  { id: 2, name: 'Jane Smith', type: 'PAN', time: '2025-04-11 11:00 AM', amount: 2.5 },
  { id: 3, name: 'Amit Patel', type: 'Aadhar', time: '2025-04-11 11:15 AM', amount: 1.5 },
];

const columns = [
  {
    name: 'User Name',
    selector: (row: any) => row.name,
    sortable: true,
  },
  {
    name: 'Verification Type',
    selector: (row: any) => row.type,
    sortable: true,
  },
  {
    name: 'Time',
    selector: (row: any) => row.time,
    sortable: true,
  },
  {
    name: 'Deducted (₹)',
    selector: (row: any) => row.amount.toFixed(2),
    sortable: true,
    right: true,
  },
];

export default function ServiceLogTable() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <div className={cn(
        "p-6 grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1",
        "dark:bg-gray-dark dark:shadow-card"
      )}>
        <h2 className="mb-4 text-xl font-bold text-dark dark:text-white">Service Log</h2>
        <DataTable
          columns={columns}
          data={logs}
          pagination
        />
      </div>
    </div>
  );
}
