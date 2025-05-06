'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const COLORS = ['#00C49F'];

type ApiDataItem = {
  kycType: string;
  count: number;
};

type ChartData = {
  name: string;
  value: number;
  percentage: number;
}[];

/**
 * UserTopKycBarChart — For showing Top 3 KYC types by the currently logged-in user.
 */
export default function UserTopKycBarChart() {
  const [data, setData] = useState<ChartData>([]);

  useEffect(() => {
    const fetchKycLogs = async () => {
      try {
        const res = await fetch('/api/user/kyc-logs');
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const total = json.data.reduce(
            (acc: number, item: ApiDataItem) => acc + item.count,
            0
          );

          const chartData = json.data.map((item: ApiDataItem) => ({
            name: item.kycType,
            value: item.count,
            percentage: (item.count / total) * 100,
          }));

          setData(chartData);
        }
      } catch (error) {
        console.error('Failed to fetch user KYC logs:', error);
      }
    };

    fetchKycLogs();
  }, []);

  return (
    <div className="p-6 shadow-md rounded-xl bg-white w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Your Top 3 KYC Types
        </h2>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 30, left: 10, right: 10, bottom: 20 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `${value}`}
          />
          <Bar dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="percentage"
              position="top"
              fill="#333"
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
