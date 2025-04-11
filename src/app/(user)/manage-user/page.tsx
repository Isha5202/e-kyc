// src/app/(user)/manage-user/page.tsx
"use client"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ManageUserTable from "./_components/ManageUserTable";

export default function ManageUsersPage() {
  return (
    <div className="mx-auto w-full ">
      <Breadcrumb pageName="Manage User" />
      <ManageUserTable />
    </div>
  );
}
