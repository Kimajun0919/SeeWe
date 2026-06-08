import { StatusBadge } from "@/components/common/StatusBadge";
import type { IncidentStatus, TrafficStatus } from "@/types/seoul";

type TrafficStatusCardProps = {
  traffic: TrafficStatus[];
  incidents: IncidentStatus[];
};

export function TrafficStatusCard({ traffic, incidents }: TrafficStatusCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Nearby Road Traffic</h3>
        <StatusBadge tone={incidents.length > 0 ? "danger" : "neutral"}>
          {incidents.length > 0 ? `${incidents.length} incident/control` : "No controls"}
        </StatusBadge>
      </div>

      <div className="mt-4 space-y-3">
        {traffic.length > 0 ? (
          traffic.slice(0, 5).map((item) => (
            <div key={`${item.roadName}-${item.sectionName}`} className="rounded-2xl bg-slate-950/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{item.roadName}</p>
                  <p className="text-xs text-slate-400">{item.sectionName}</p>
                </div>
                <StatusBadge
                  tone={item.status === "통제" || item.status === "정체" ? "danger" : item.status === "서행" ? "warning" : "success"}
                >
                  {item.status}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Average speed: {item.speed === null ? "정보없음" : `${item.speed} km/h`}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-slate-950/40 p-3 text-sm text-slate-400">No public data available.</p>
        )}
      </div>

      {incidents.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-950/30 p-3 text-sm text-red-100">
          <p className="font-semibold">Incident/control status</p>
          <p className="mt-1">{incidents[0].location}: {incidents[0].message}</p>
        </div>
      ) : null}
    </section>
  );
}
