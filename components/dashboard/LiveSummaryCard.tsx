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
    <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">현재 권역</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{population?.areaName || "올림픽공원"}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {population?.congestionMessage || "서울시 공개 데이터를 기다리는 중입니다."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {population ? <StatusBadge level={population.congestionLevel}>{population.congestionLevel}</StatusBadge> : null}
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
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
