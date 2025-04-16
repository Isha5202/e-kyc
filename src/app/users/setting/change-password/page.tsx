import ChangePasswordForm from './_components/ChangePasswordForm';
import UserBreadcrumb from "@/components/UserBreadcrumbs/Breadcrumb";
const ChangePasswordPage = () => {
  return (
    <div className="mx-auto w-full">
      <UserBreadcrumb pageName="Change Password" />
      <ChangePasswordForm />
    </div>
  );
};

export default ChangePasswordPage;
