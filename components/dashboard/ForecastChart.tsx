"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPopulation } from "@/lib/utils/number";
import type { SeoulPopulation } from "@/types/seoul";

export function ForecastChart({ forecast }: { forecast: SeoulPopulation["forecast"] }) {
  if (forecast.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
        <h3 className="font-semibold text-white">12-hour forecast</h3>
        <p className="mt-2 text-sm text-slate-400">No public data available.</p>
      </section>
    );
  }

  return (
    <section className="h-80 rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <h3 className="font-semibold text-white">12-hour Population Forecast</h3>
      <p className="mt-1 text-xs text-slate-400">Minimum and maximum population forecast from Seoul public data.</p>
      <ResponsiveContainer width="100%" height="82%">
        <LineChart data={forecast}>
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
              name === "populationMin" ? "Forecast min" : "Forecast max",
            ]}
          />
          <Line type="monotone" dataKey="populationMin" stroke="#38bdf8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="populationMax" stroke="#fb7185" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
