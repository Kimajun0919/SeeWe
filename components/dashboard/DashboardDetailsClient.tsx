"use client";

import { useMemo, useState } from "react";
import { ErrorNotice } from "@/components/common/ErrorNotice";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { defaultAreaNm, getAreaConfig as getStaticAreaConfig } from "@/lib/config/areas";
import { useLocalAreaConfigs } from "@/lib/hooks/useLocalAreaConfigs";
import { useLiveAreaData } from "@/lib/hooks/useLiveAreaData";
import { DashboardMenu } from "./DashboardMenu";
import { ForecastChart } from "./ForecastChart";
import { GateEstimateCard } from "./GateEstimateCard";
import { GateEstimateChart } from "./GateEstimateChart";
import { RefreshControl } from "./RefreshControl";
import { TrafficStatusCard } from "./TrafficStatusCard";
import { TransitStatusCard } from "./TransitStatusCard";

type DashboardDetailsClientProps = {
  initialAreaNm?: string;
};

export function DashboardDetailsClient({ initialAreaNm }: DashboardDetailsClientProps) {
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
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_36%),#020617] px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5">
        <DashboardMenu
          areaNm={areaConfig.areaNm}
          areaOptions={areaConfigs}
          currentPage="details"
          onAreaChange={setAreaNm}
        />

        <RefreshControl
          isFetching={live.isFetching}
          isError={live.isError}
          lastFetchedAt={live.lastFetchedAt}
          sourceUpdatedAt={live.sourceUpdatedAt}
          nextRefreshIn={live.nextRefreshIn}
          onRefresh={live.refetchAll}
        />

        {live.isError ? <ErrorNotice message={live.errorMessage} /> : null}

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <GateEstimateChart estimates={live.gateEstimates} />
          <ForecastChart forecast={live.population?.forecast ?? []} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {live.gateEstimates.length > 0 ? (
            live.gateEstimates.map((estimate) => <GateEstimateCard key={estimate.gateId} estimate={estimate} />)
          ) : (
            <>
              <LoadingSkeleton className="h-52" />
              <LoadingSkeleton className="h-52" />
              <LoadingSkeleton className="h-52" />
              <LoadingSkeleton className="h-52" />
            </>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <TrafficStatusCard traffic={cityData?.roadTraffic ?? []} incidents={cityData?.incidents ?? []} />
          <TransitStatusCard
            subways={cityData?.subways ?? []}
            buses={cityData?.buses ?? []}
            parkingLots={cityData?.parkingLots ?? []}
          />
        </section>

        <section className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300 sm:rounded-3xl sm:p-5">
          <p>이 서비스는 서울시 공개 데이터를 기반으로 주변 인구 추정치를 참고용으로 보여주는 도구입니다.</p>
          <p>
            출입구별 인구는 실제 측정값이 아닙니다. 전체 권역 인구, 교통, 위치 데이터를 바탕으로 계산한 추정값입니다.
          </p>
          <p>이 서비스는 개인 위치, 특정 단체, 집회 참여자 수를 식별하거나 추적하지 않습니다.</p>
          <p>현장 안전 판단은 경찰, 지자체, 시설 관리자 등 공식 안내를 우선해 주세요.</p>
          <p>
            앱은 5분마다 최신 데이터를 확인하며, 서울시 원천 데이터 갱신 주기에 따라 표시값이 즉시 바뀌지 않을 수 있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
