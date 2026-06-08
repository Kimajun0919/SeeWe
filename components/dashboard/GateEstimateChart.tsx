"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { congestionMarkerColor } from "@/lib/utils/congestion";
import { formatPopulation } from "@/lib/utils/number";
import type { GateEstimate } from "@/types/estimate";

export function GateEstimateChart({ estimates }: { estimates: GateEstimate[] }) {
  if (estimates.length === 0) {
    return <EmptyPanel title="출입구별 추정 인구 차트" />;
  }

  return (
    <section className="h-80 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">출입구별 추정 인구</h3>
          <p className="text-xs text-slate-400">모든 출입구 값은 실제 측정값이 아닌 추정값입니다.</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={estimates}>
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
          <Bar dataKey="estimatedMid" radius={[10, 10, 0, 0]}>
            {estimates.map((estimate) => (
              <Cell key={estimate.gateId} fill={congestionMarkerColor(estimate.congestionLevel)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">공개 데이터가 아직 없습니다.</p>
    </section>
  );
}
