import type { AreaConfig } from "@/types/area";
import type { IncidentStatus } from "@/types/seoul";

type IncidentLayerProps = {
  areaConfig: AreaConfig;
  incidents: IncidentStatus[];
  project: (point: { lat: number; lng: number }) => { x: number; y: number };
};

export function IncidentLayer({ areaConfig, incidents, project }: IncidentLayerProps) {
  const positioned =
    incidents.length > 0
      ? incidents.map((incident, index) => ({
          incident,
          point: project({
            lat: incident.lat ?? areaConfig.center.lat + index * 0.0008,
            lng: incident.lng ?? areaConfig.center.lng - index * 0.0008,
          }),
        }))
      : [];

  return (
    <>
      {positioned.slice(0, 5).map(({ incident, point }) => (
        <div
          key={`${incident.type}-${incident.location}-${incident.startedAt ?? ""}`}
          className="absolute z-20 max-w-48 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-300/40 bg-red-950/85 px-3 py-2 text-[11px] text-red-50 shadow-xl"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        >
          <p className="font-semibold">{incident.type}</p>
          <p className="mt-1 line-clamp-2">{incident.location}</p>
        </div>
      ))}
    </>
  );
}
