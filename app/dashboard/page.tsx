"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorNotice } from "@/components/common/ErrorNotice";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { GateEstimateCard } from "@/components/dashboard/GateEstimateCard";
import { GateEstimateChart } from "@/components/dashboard/GateEstimateChart";
import { LiveSummaryCard } from "@/components/dashboard/LiveSummaryCard";
import { RefreshControl } from "@/components/dashboard/RefreshControl";
import { TrafficStatusCard } from "@/components/dashboard/TrafficStatusCard";
import { TransitStatusCard } from "@/components/dashboard/TransitStatusCard";
import { CrowdMap } from "@/components/map/CrowdMap";
import { areaConfigs, defaultAreaNm, getAreaConfig, getDefaultAreaConfig } from "@/lib/config/areas";
import { useLiveAreaData } from "@/lib/hooks/useLiveAreaData";

const feedbackFormUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || "https://forms.gle/yhT166DZaKZsrxi37";

export default function DashboardPage() {
  const [areaNm, setAreaNm] = useState(defaultAreaNm);
  const areaConfig = useMemo(() => getAreaConfig(areaNm) ?? getDefaultAreaConfig(), [areaNm]);
  const live = useLiveAreaData(areaConfig.areaNm);
  const cityData = live.cityData;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.22),transparent_35%),#020617] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/25 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">SeeWe</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Real-time crowd density and traffic dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              MVP focus: Olympic Park Handball Gymnasium. The service checks Seoul public data every 10 seconds and
              displays surrounding population and entrance-level estimates as reference data.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-72">
            <label htmlFor="area-select" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Area selector
            </label>
            <select
              id="area-select"
              value={areaConfig.areaNm}
              onChange={(event) => setAreaNm(event.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none ring-sky-300 transition focus:ring-2"
            >
              {areaConfigs.map((area) => (
                <option key={area.areaNm} value={area.areaNm}>
                  {area.displayName}
                </option>
              ))}
            </select>
            <Link href="/settings/areas" className="text-xs font-medium text-sky-200 hover:text-sky-100">
              Manage area configuration
            </Link>
            <a
              href={feedbackFormUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-sky-100"
            >
              같이 개선하기
            </a>
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

        <section className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-300">
          <p>This service is a reference tool for surrounding crowd density based on Seoul public data.</p>
          <p>
            Entrance-level population is not an actual measured value. It is an estimate based on population, traffic,
            and location data.
          </p>
          <p>
            This service does not identify or track protest participants, specific group sizes, or individual locations.
          </p>
          <p>
            For safety decisions on site, follow official guidance from police, local government, and facility managers.
          </p>
          <p>
            Even though the app checks for updates every 10 seconds, displayed values may not change immediately
            depending on the Seoul source data update interval.
          </p>
        </section>
      </div>
    </main>
  );
}
