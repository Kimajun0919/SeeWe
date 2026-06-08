"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPopulation } from "@/lib/utils/number";
import type { SeoulPopulation } from "@/types/seoul";

export function ForecastChart({ forecast }: { forecast: SeoulPopulation["forecast"] }) {
  if (forecast.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl">
        <h3 className="font-semibold text-white">12시간 예측</h3>
        <p className="mt-2 text-sm text-slate-400">공개 데이터가 아직 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl">
      <h3 className="font-semibold text-white">12시간 인구 예측</h3>
      <p className="mt-1 break-keep text-xs leading-5 text-slate-400">
        서울시 공개 데이터의 최소·최대 예측 인구입니다.
      </p>
      <div className="-mx-2 mt-3 overflow-x-auto px-2 pb-1">
        <div className="h-64 min-w-[520px] sm:h-72 sm:min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#cbd5e1", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  color: "#e2e8f0",
                }}
                formatter={(value, name) => [
                  formatPopulation(Number(value)),
                  name === "populationMin" ? "예측 최소" : "예측 최대",
                ]}
              />
              <Line type="monotone" dataKey="populationMin" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="populationMax" stroke="#fb7185" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
