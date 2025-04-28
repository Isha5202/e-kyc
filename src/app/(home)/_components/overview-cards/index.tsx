import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { users, branches, kyc } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 2xl:gap-7.5">
      <OverviewCard
        label="Total Users"
        value={compactFormat(users)}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Total Branches"
        value={compactFormat(branches)}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Total KYC"
        value={compactFormat(kyc)}
        Icon={icons.Views}
      />
    </div>
  );
}
