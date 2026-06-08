import { StatusBadge } from "@/components/common/StatusBadge";
import { formatClock, formatSourceTime } from "@/lib/utils/date";
import { formatPopulation } from "@/lib/utils/number";
import type { SeoulPopulation } from "@/types/seoul";

type LiveSummaryCardProps = {
  population?: SeoulPopulation;
  lastFetchedAt: number;
  isSourceWaiting: boolean;
};

export function LiveSummaryCard({ population, lastFetchedAt, isSourceWaiting }: LiveSummaryCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">현재 권역</p>
          <h2 className="mt-2 break-keep text-xl font-bold text-white sm:text-2xl">
            {population?.areaName || "올림픽공원"}
          </h2>
          <p className="mt-2 max-w-3xl break-keep text-sm leading-6 text-slate-300">
            서울시 공개 데이터의 인구 범위와 추정 중앙값만 표시합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {population?.replaceYn === "Y" ? <StatusBadge tone="warning">대체 데이터 사용 중</StatusBadge> : null}
          {isSourceWaiting ? <StatusBadge tone="info">서울 원천 데이터 갱신 대기 중</StatusBadge> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          label="주변 추정 인구"
          value={
            population
              ? `${formatPopulation(population.populationMin)} - ${formatPopulation(population.populationMax)}`
              : "정보없음"
          }
        />
        <SummaryMetric label="추정 중앙값" value={formatPopulation(population?.populationMid)} />
        <SummaryMetric label="서울 원천 시각" value={formatSourceTime(population?.sourceUpdatedAt)} />
        <SummaryMetric label="앱 새로고침 시각" value={lastFetchedAt ? formatClock(lastFetchedAt) : "정보없음"} />
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="break-keep text-xs text-slate-400">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-white sm:text-lg">{value}</p>
    </div>
  );
}
