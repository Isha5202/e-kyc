//src\app\(user)\add-user\page.tsx
"use client"
import { AddBranchForm } from "./_components/AddBranchForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function AddUserPage() {
  return (
    <div className="mx-auto w-full">
    <Breadcrumb pageName="Add User" />
    <AddBranchForm />;
    </div>
  )
}
