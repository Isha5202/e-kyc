'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import dynamic from 'next/dynamic';

// 👇 Dynamically import the component with SSR turned off
const ManageUserTable = dynamic(() => import('./_components/ManageUserTable'), {
  ssr: false,
});

export default function ManageUsersPage() {
  return (
    <div className="mx-auto w-full">
      <Breadcrumb pageName="Manage User" />
      <ManageUserTable />
    </div>
  );
}
