import { StatusBadge } from "@/components/common/StatusBadge";
import type { AreaConfig } from "@/types/area";
import type { TrafficStatus } from "@/types/seoul";

type TrafficLayerProps = {
  areaConfig: AreaConfig;
  traffic: TrafficStatus[];
  project: (point: { lat: number; lng: number }) => { x: number; y: number };
};

export function TrafficLayer({ areaConfig, traffic, project }: TrafficLayerProps) {
  return (
    <>
      {areaConfig.roadAnchors.map((anchor) => {
        const match = traffic.find((item) => namesOverlap(item.roadName, anchor.name));
        const point = project(anchor);

        return (
          <div
            key={anchor.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/80 px-2 py-1 text-[11px] shadow-lg"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="mr-2 text-slate-200">{anchor.name}</span>
            <StatusBadge tone={match?.status === "정체" || match?.status === "통제" ? "danger" : "neutral"}>
              {match?.status ?? "정보없음"}
            </StatusBadge>
          </div>
        );
      })}
    </>
  );
}

function namesOverlap(left: string, right: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/\s|-/g, "");
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
}
