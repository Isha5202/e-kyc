// src\components\Charts\kyc-stats\KycLineChart.tsx

'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Period = 'today' | 'month';

type ChartData = {
  name: string;  // hour label or week label
  value: number;
}[];

export default function KycLineChart() {
  const [period, setPeriod] = useState<Period>('today');
  const [data, setData] = useState<ChartData>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const res = await fetch(`/api/kyc-stats?period=${period}`);
          if (!res.ok) {
            console.error(`API error ${res.status}`);
            return;
          }
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        } catch (err) {
          console.error('Failed to fetch KYC stats:', err);
        }
      };
      
    fetchData();
  }, [period]);

  return (
    <div className="p-6 shadow-md rounded-xl bg-white w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">KYC Overview</h2>
        <select
          className="border px-3 py-1 rounded"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
        >
          <option value="today">Today</option>
          <option value="month">This Month</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, left: 10, right: 10, bottom: 20 }}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#33b5e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
