"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { PeriodPicker } from "@/components/period-picker"; // Import the PeriodPicker component

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function KycGraph() {
  const [kycData, setKycData] = useState<number | { week: number; count: number }[]>(0); // Updated state type
  const [view, setView] = useState<"today" | "monthly">("monthly"); // Explicit type for view
  const [loading, setLoading] = useState(false); // Loading state for API call
  const [error, setError] = useState<string | null>(null); // Error state for handling API errors

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch

      try {
        const res = await fetch(`/api/graph?view=${view}`);
        if (!res.ok) {
          throw new Error("Failed to fetch KYC data");
        }

        const data = await res.json();
        if (view === "monthly") {
          setKycData(data.kycCountsByWeek); // Expecting an array of { week, count }
        } else {
          setKycData(data.kycCount); // Expecting a single number for "today"
        }
      } catch (error) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view]); // Fetch data whenever the view changes

  const handleViewChange = (selectedView: "today" | "monthly") => {
    setView(selectedView); // Update the view when a new time frame is selected
  };

  // Modify chart data dynamically based on the view
  const chartData = {
    labels: view === "today" 
      ? ["Today"] 
      : Array.isArray(kycData) 
      ? (kycData as { week: number }[]).map((entry) => `Week ${entry.week}`) 
      : [], // Dynamic labels for weeks, only if kycData is an array
    datasets: [
      {
        label: "Total KYC",
        data: view === "today"
          ? [kycData] 
          : Array.isArray(kycData) 
          ? (kycData as { count: number }[]).map((entry) => entry.count) 
          : [], // Use count for weekly data, only if kycData is an array
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6 shadow-md rounded-xl bg-white w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          View KYC Data:
        </h2>

        {/* Use PeriodPicker for time frame selection */}
        <PeriodPicker
          sectionKey="kycView"
          defaultValue={view} // Ensure the default value is either "today" or "monthly"
          items={["today", "monthly"]}
          minimal={false}
          onChange={handleViewChange} // Handle the selection change
        />
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
}
