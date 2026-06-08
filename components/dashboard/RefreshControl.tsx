"use client";

import { formatClock, formatSourceTime } from "@/lib/utils/date";

type RefreshControlProps = {
  isFetching: boolean;
  isError?: boolean;
  lastFetchedAt: number;
  sourceUpdatedAt: string | null;
  nextRefreshIn: number;
  onRefresh: () => Promise<void> | void;
};

export function RefreshControl({
  isFetching,
  isError = false,
  lastFetchedAt,
  sourceUpdatedAt,
  nextRefreshIn,
  onRefresh,
}: RefreshControlProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Checking for the latest available data every 10 seconds.
          </p>
          <div className="mt-2 grid gap-1 text-xs text-slate-300 sm:grid-cols-3 sm:gap-4">
            <span>Last app refresh: {lastFetchedAt ? formatClock(lastFetchedAt) : "정보없음"}</span>
            <span>Seoul source timestamp: {formatSourceTime(sourceUpdatedAt)}</span>
            <span>Next automatic refresh in {nextRefreshIn} seconds</span>
          </div>
          {isError ? (
            <p className="mt-2 text-xs font-medium text-red-200">Data reception delayed: displaying previous data.</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={isFetching}
          className="inline-flex min-w-32 items-center justify-center rounded-2xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        >
          {isFetching ? "Refreshing..." : isError ? "Try again" : "Refresh"}
        </button>
      </div>
    </section>
  );
}
