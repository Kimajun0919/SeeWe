"use client";

import { useMemo, useState } from "react";
import { ErrorNotice } from "@/components/common/ErrorNotice";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { CrowdMap } from "@/components/map/CrowdMap";
import { defaultAreaNm, getAreaConfig as getStaticAreaConfig } from "@/lib/config/areas";
import { useLocalAreaConfigs } from "@/lib/hooks/useLocalAreaConfigs";
import { useLiveAreaData } from "@/lib/hooks/useLiveAreaData";
import { DashboardMenu } from "./DashboardMenu";
import { LiveSummaryCard } from "./LiveSummaryCard";

const feedbackFormUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || "https://forms.gle/yhT166DZaKZsrxi37";

type DashboardOverviewClientProps = {
  initialAreaNm?: string;
};

export function DashboardOverviewClient({ initialAreaNm }: DashboardOverviewClientProps) {
  const { areaConfigs, getAreaConfig, getDefaultAreaConfig } = useLocalAreaConfigs();
  const initialAreaConfig = initialAreaNm ? getStaticAreaConfig(initialAreaNm) : undefined;
  const [areaNm, setAreaNm] = useState(initialAreaConfig?.areaNm ?? defaultAreaNm);
  const areaConfig = useMemo(
    () => getAreaConfig(areaNm) ?? getDefaultAreaConfig(),
    [areaNm, getAreaConfig, getDefaultAreaConfig],
  );
  const live = useLiveAreaData(areaConfig);
  const cityData = live.cityData;

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.22),transparent_35%),#020617] px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5">
        <DashboardMenu
          areaNm={areaConfig.areaNm}
          areaOptions={areaConfigs}
          currentPage="dashboard"
          feedbackFormUrl={feedbackFormUrl}
          onAreaChange={setAreaNm}
        />

        {live.isError ? <ErrorNotice message={live.errorMessage} /> : null}

        {live.population ? (
          <LiveSummaryCard
            population={live.population}
            lastFetchedAt={live.lastFetchedAt}
            isSourceWaiting={live.isSourceWaiting}
          />
        ) : (
          <LoadingSkeleton className="h-56" />
        )}

        <CrowdMap areaConfig={areaConfig} estimates={live.gateEstimates} cityData={cityData} />
      </div>
    </main>
  );
}
