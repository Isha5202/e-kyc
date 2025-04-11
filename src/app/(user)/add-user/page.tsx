"use client"


import { AddUserForm } from "./_components/AddUserForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function AddUserPage() {
  return (
    <div className="mx-auto w-full">
    <Breadcrumb pageName="Add User" />
    <AddUserForm />;
    </div>
  )
}
