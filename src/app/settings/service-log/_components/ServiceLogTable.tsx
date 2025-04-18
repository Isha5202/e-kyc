'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import the DataTable
const DataTable = dynamic(() => import('react-data-table-component'), { ssr: false });

interface KYCLog {
  logId: number;
  userName: string;
  userEmail: string;
  kycType: string;
  inputValue: string;
  status: string;
  timestamp: string;
}

const rawColumns = [
  {
    name: 'User Name',
    selector: (row: KYCLog) => row.userName,
    sortable: true,
  },
  {
    name: 'Email',
    selector: (row: KYCLog) => row.userEmail,
    sortable: true,
  },
  {
    name: 'Verification Type',
    selector: (row: KYCLog) => row.kycType,
    sortable: true,
  },
  {
    name: 'Input Number',
    selector: (row: KYCLog) => row.inputValue,
    sortable: true,
  },
  {
    name: 'Status',
    selector: (row: KYCLog) => row.status,
    sortable: true,
  },
  {
    name: 'Time',
    selector: (row: KYCLog) => new Date(row.timestamp).toLocaleString(),
    sortable: true,
  },
];

const columns = rawColumns.map(({ $allowOverflow, ...col }: any) => ({
  ...col,
  ...(!!$allowOverflow && { allowOverflow: true }),
}));

export default function ServiceLogTable() {
  const [logs, setLogs] = useState<KYCLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<KYCLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/kyc-logs');
        const json = await res.json();
        if (json.success) {
          setLogs(json.data);
          setFilteredLogs(json.data);
        } else {
          console.error('Failed to fetch logs:', json.error);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = logs.filter((log) =>
      (log.userName || '').toLowerCase().includes(query) ||
      (log.userEmail || '').toLowerCase().includes(query) ||
      (log.kycType || '').toLowerCase().includes(query) ||
      (log.inputValue || '').toLowerCase().includes(query) ||
      (log.status || '').toLowerCase().includes(query)
    );
    setFilteredLogs(filtered);
  }, [search, logs]);

  return (
    <div className="mx-auto w-full">
      <div
        className={cn(
          'p-6 grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1',
          'dark:bg-gray-dark dark:shadow-card'
        )}
      >
<div className="flex items-center justify-between mb-4 flex-wrap gap-2">
  <h2 className="text-xl font-bold text-dark dark:text-white">Service Log</h2>

  {/* Search Box */}
  <input
    type="text"
    placeholder="Search logs..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="p-2 w-full sm:w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
  />
</div>


        <DataTable
          columns={columns}
          data={filteredLogs}
          progressPending={loading}
          pagination
          highlightOnHover
          striped
        />
      </div>
    </div>
  );
}
