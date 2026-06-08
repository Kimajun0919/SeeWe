"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { ErrorNotice } from "@/components/common/ErrorNotice";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { CrowdMap } from "@/components/map/CrowdMap";
import { areaConfigs, defaultAreaNm, getAreaConfig, getDefaultAreaConfig } from "@/lib/config/areas";
import { useLiveAreaData } from "@/lib/hooks/useLiveAreaData";
import { LiveSummaryCard } from "./LiveSummaryCard";

const feedbackFormUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || "https://forms.gle/yhT166DZaKZsrxi37";

type DashboardOverviewClientProps = {
  initialAreaNm?: string;
};

export function DashboardOverviewClient({ initialAreaNm }: DashboardOverviewClientProps) {
  const initialAreaConfig = initialAreaNm ? getAreaConfig(initialAreaNm) : undefined;
  const [areaNm, setAreaNm] = useState(initialAreaConfig?.areaNm ?? defaultAreaNm);
  const areaConfig = useMemo(() => getAreaConfig(areaNm) ?? getDefaultAreaConfig(), [areaNm]);
  const live = useLiveAreaData(areaConfig.areaNm);
  const cityData = live.cityData;
  const detailsHref = `/dashboard/details?area=${encodeURIComponent(areaConfig.areaNm)}`;

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.22),transparent_35%),#020617] px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5">
        <header className="flex flex-col gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/25 sm:rounded-3xl sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <BrandLogo />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200 sm:tracking-[0.28em]">
              Live crowd signal
            </p>
            <h1 className="mt-2 break-keep text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              실시간 주변 혼잡도와 교통 상황 대시보드
            </h1>
            <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-slate-300">
              MVP 대상지는 올림픽공원 핸드볼경기장 주변입니다. SeeWe는 서울시 공개 데이터를 10초마다 확인하고
              주변 추정 인구와 출입구별 추정 분포를 참고용으로 보여줍니다.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 lg:w-80">
            <label htmlFor="area-select" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              권역 선택
            </label>
            <select
              id="area-select"
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
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <Link
                href={detailsHref}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-200"
              >
                자세히 보기
              </Link>
              <Link
                href="/settings/areas"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-white/10"
              >
                권역 설정 보기
              </Link>
              <a
                href={feedbackFormUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-sky-100"
              >
                같이 개선하기
              </a>
            </div>
          </div>
        </header>

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
