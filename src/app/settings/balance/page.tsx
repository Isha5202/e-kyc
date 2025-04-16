// src/app/settings/balance/page.tsx

import BalanceDetails from "./_components/BalanceDetails";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function BalancePage() {
  return (
    <div className="mx-auto w-full">
      <Breadcrumb pageName="Balance" />
      <BalanceDetails />
    </div>
  );
}
