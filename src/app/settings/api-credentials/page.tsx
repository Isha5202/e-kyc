// src/app/settings/api-credentials/page.tsx

import ApiCredentialsForm from "./_components/ApiCredentialsForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function ApiCredentialsPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="API Credentials" />
      <ApiCredentialsForm />
    </div>
  );
}
