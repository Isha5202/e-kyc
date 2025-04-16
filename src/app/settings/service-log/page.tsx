// src/app/settings/service-log/page.tsx

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ServiceLogTable from "./_components/ServiceLogTable";

export default function ServiceLogPage() {
  return (
    <div className="mx-auto w-full">
      <Breadcrumb pageName="Service Log" />
      <ServiceLogTable />
    </div>
  );
}
