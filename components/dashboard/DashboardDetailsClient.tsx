"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ErrorNotice } from "@/components/common/ErrorNotice";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { areaConfigs, defaultAreaNm, getAreaConfig, getDefaultAreaConfig } from "@/lib/config/areas";
import { useLiveAreaData } from "@/lib/hooks/useLiveAreaData";
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
  const initialAreaConfig = initialAreaNm ? getAreaConfig(initialAreaNm) : undefined;
  const [areaNm, setAreaNm] = useState(initialAreaConfig?.areaNm ?? defaultAreaNm);
  const areaConfig = useMemo(() => getAreaConfig(areaNm) ?? getDefaultAreaConfig(), [areaNm]);
  const live = useLiveAreaData(areaConfig.areaNm);
  const cityData = live.cityData;
  const dashboardHref = `/dashboard?area=${encodeURIComponent(areaConfig.areaNm)}`;

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_36%),#020617] px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5">
        <header className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/25 sm:rounded-3xl sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <BrandLogo />
            </div>

            <div className="flex w-full flex-col gap-2 lg:w-80">
              <label htmlFor="details-area-select" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                권역 선택
              </label>
              <select
                id="details-area-select"
                value={areaConfig.areaNm}
                onChange={(event) => setAreaNm(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none ring-sky-300 transition focus:ring-2"
              >
                {areaConfigs.map((area) => (
                  <option key={area.areaNm} value={area.areaNm}>
                    {area.displayName}
                  </option>
                ))}
              </select>
              <Link
                href={dashboardHref}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-white/10"
              >
                대시보드로 돌아가기
              </Link>
            </div>
          </div>
        </header>

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
          <p>이 서비스는 서울시 공개 데이터를 기반으로 주변 혼잡도를 참고용으로 보여주는 도구입니다.</p>
          <p>
            출입구별 인구는 실제 측정값이 아닙니다. 전체 권역 인구, 교통, 위치 데이터를 바탕으로 계산한 추정값입니다.
          </p>
          <p>이 서비스는 개인 위치, 특정 단체, 집회 참여자 수를 식별하거나 추적하지 않습니다.</p>
          <p>현장 안전 판단은 경찰, 지자체, 시설 관리자 등 공식 안내를 우선해 주세요.</p>
          <p>
            앱은 10초마다 최신 데이터를 확인하지만, 서울시 원천 데이터 갱신 주기에 따라 표시값이 즉시 바뀌지 않을 수 있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
