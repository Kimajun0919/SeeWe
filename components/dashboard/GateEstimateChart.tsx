"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPopulation } from "@/lib/utils/number";
import type { GateEstimate } from "@/types/estimate";

export function GateEstimateChart({ estimates }: { estimates: GateEstimate[] }) {
  if (estimates.length === 0) {
    return <EmptyPanel title="출입구별 추정 인구 차트" />;
  }

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">출입구별 추정 인구</h3>
          <p className="break-keep text-xs leading-5 text-slate-400">
            모든 출입구 값은 실제 측정값이 아닌 추정값입니다.
          </p>
        </div>
      </div>
      <div className="-mx-2 mt-3 overflow-x-auto px-2 pb-1">
        <div className="h-64 min-w-[520px] sm:h-72 sm:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estimates} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
              <XAxis dataKey="gateName" tick={{ fill: "#cbd5e1", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(125,211,252,0.12)" }}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  color: "#e2e8f0",
                }}
                formatter={(value) => [formatPopulation(Number(value)), "추정 중앙값"]}
              />
              <Bar dataKey="estimatedMid" fill="#38bdf8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">공개 데이터가 아직 없습니다.</p>
    </section>
  );
}
