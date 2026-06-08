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
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/20 sm:rounded-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="break-keep text-sm font-semibold leading-5 text-slate-100">
            10초마다 서울시 최신 공개 데이터를 확인합니다.
          </p>
          <div className="mt-2 grid gap-1 text-xs leading-5 text-slate-300 sm:grid-cols-3 sm:gap-4">
            <span>앱 새로고침: {lastFetchedAt ? formatClock(lastFetchedAt) : "정보없음"}</span>
            <span>서울 원천 시각: {formatSourceTime(sourceUpdatedAt)}</span>
            <span>다음 자동 확인까지 {nextRefreshIn}초</span>
          </div>
          {isError ? (
            <p className="mt-2 text-xs font-medium text-red-200">
              데이터 수신 지연: 이전 데이터를 표시하고 있습니다.
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={isFetching}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 sm:w-auto sm:min-w-32"
        >
          {isFetching ? "새로고침 중..." : isError ? "다시 시도" : "새로고침"}
        </button>
      </div>
    </section>
  );
}
