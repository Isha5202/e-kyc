'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import dynamic from 'next/dynamic';

// 👇 Dynamically import the component with SSR turned off
const ManageBranchTable = dynamic(() => import('./_components/ManageBranchTable'), {
  ssr: false,
});

export default function ManageBranchPage() {
  return (
    <div className="mx-auto w-full">
      <Breadcrumb pageName="Manage Branch" />
      <ManageBranchTable />
    </div>
  );
}
