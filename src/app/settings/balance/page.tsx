// src/app/settings/balance/page.tsx

import BalanceDetails from "./_components/BalanceDetails";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function BalancePage() {
  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Breadcrumb pageName="Balance" />
      <BalanceDetails />
    </div>
  );
}
