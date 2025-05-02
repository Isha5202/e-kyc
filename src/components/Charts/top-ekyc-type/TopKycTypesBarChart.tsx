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
  Legend,
  LabelList
} from 'recharts';

const COLORS = [ '#33b5e5'];

type KycLog = {
  kycType: string;
};

type ChartData = {
  name: string;
  value: number;
  percentage: number; // Keep this as number
}[];

export default function TopKycTypesBarChart() {
  const [data, setData] = useState<ChartData>([]);

  useEffect(() => {
    const fetchKycLogs = async () => {
      try {
        const res = await fetch('/api/kyc-logs');
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const frequencyMap: Record<string, number> = {};

          json.data.forEach((log: KycLog) => {
            const type = log.kycType;
            frequencyMap[type] = (frequencyMap[type] || 0) + 1;
          });

          const totalCount = json.data.length; // Total number of KYC logs
          const chartData = Object.entries(frequencyMap)
            .map(([name, value]) => ({
              name,
              value,
              percentage: ((value / totalCount) * 100), // Keep percentage as a number
            }))
            .sort((a, b) => b.value - a.value) // Sort in descending order
            .slice(0, 5); // Limit to top 10 KYC types

          setData(chartData);
        }
      } catch (error) {
        console.error('Failed to fetch KYC logs:', error);
      }
    };

    fetchKycLogs();
  }, []);

  return (
    <div className=" p-6 shadow-md rounded-xl bg-white w-full max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
              Top KYC Types
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
            formatter={(value: number) => `${value} (${(value).toFixed(2)}%)`}
          />
          
          <Bar dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList
              dataKey="percentage"
              position="top"
              fill="#333"
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}