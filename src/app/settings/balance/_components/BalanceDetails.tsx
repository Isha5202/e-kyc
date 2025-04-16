// src/app/settings/balance/_components/BalanceDetails.tsx

import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function BalanceDetails() {
  return (
    <div className="mx-auto w-full">
      <ShowcaseSection title="Account Balance" className="!p-6.5">
        <div className="text-lg font-medium text-gray-800 dark:text-white">
          Current Balance: <span className="text-primary">₹1,234.56</span>
        </div>
      </ShowcaseSection>
    </div>
  );
}
