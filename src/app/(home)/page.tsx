// src/app/page.tsx

import { redirect } from 'next/navigation';
import { getTokenFromCookies, verifyJWT } from '@/lib/auth';


import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RegionLabels } from "./_components/region-labels";
import TopKycTypesBarChart from "@/components/Charts/top-ekyc-type/TopKycTypesBarChart";
// import KycGraph from './_components/Graph/KycGraph';
type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  // 🔐 AUTH CHECK HERE
  const token = await getTokenFromCookies();
  const user = token ? await verifyJWT(token) : null;

  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>


      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
      <div className="col-span-12 xl:col-span-5">
          <TopKycTypesBarChart />
        </div>
        {/* <div className="col-span-12 xl:col-span-7">
        <KycGraph />
        </div> */}
        
      </div>
    </>
  );
}
