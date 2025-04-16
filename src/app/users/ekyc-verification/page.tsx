import EKYCForm from './_components/EKYCForm';
import UserBreadcrumb from "@/components/UserBreadcrumbs/Breadcrumb";

export default function EKYCPage() {
  return (
    <div className="mx-auto w-full">
      <UserBreadcrumb pageName="E-KYC Verification" />
      <EKYCForm />
    </div>
  );
}
