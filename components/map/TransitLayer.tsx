import type { AreaConfig } from "@/types/area";

type TransitLayerProps = {
  areaConfig: AreaConfig;
  project: (point: { lat: number; lng: number }) => { x: number; y: number };
};

export function TransitLayer({ areaConfig, project }: TransitLayerProps) {
  return (
    <>
      {areaConfig.transitAnchors.map((anchor) => {
        const point = project(anchor);
        return (
          <div
            key={anchor.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/40 bg-cyan-950/80 px-2 py-1 text-[11px] font-medium text-cyan-100 shadow-lg"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {anchor.type === "subway" ? "Subway" : "Bus"}: {anchor.name}
          </div>
        );
      })}
    </>
  );
}
