// src/app/settings/api-credentials/page.tsx

import ApiTextSettings from "./_components/ApiTextForm";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function ApiCredentialsPage() {
  return (
    <div className="mx-auto w-full">
      <Breadcrumb pageName="API Text" />
      <ApiTextSettings />
    </div>
  );
}
