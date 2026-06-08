import { StatusBadge } from "@/components/common/StatusBadge";
import type { BusStopStatus, ParkingStatus, SubwayStatus } from "@/types/seoul";

type TransitStatusCardProps = {
  subways: SubwayStatus[];
  buses: BusStopStatus[];
  parkingLots: ParkingStatus[];
};

export function TransitStatusCard({ subways, buses, parkingLots }: TransitStatusCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
      <h3 className="font-semibold text-white">Public Transit And Parking</h3>

      <div className="mt-4 grid gap-3">
        <TransitGroup title="Nearby subway stations">
          {subways.length > 0 ? (
            subways.slice(0, 4).map((subway) => (
              <TransitLine
                key={`${subway.stationName}-${subway.lineName ?? ""}`}
                title={subway.stationName}
                detail={`${subway.lineName || "Line info unavailable"} - Ride ${flowValue(subway.rideCount)} / Alight ${flowValue(subway.alightCount)}`}
              />
            ))
          ) : (
            <NoData />
          )}
        </TransitGroup>

        <TransitGroup title="Nearby bus stops">
          {buses.length > 0 ? (
            buses.slice(0, 4).map((bus) => (
              <TransitLine
                key={`${bus.stopName}-${bus.stopId ?? ""}`}
                title={bus.stopName}
                detail={`Ride ${flowValue(bus.rideCount)} / Alight ${flowValue(bus.alightCount)}`}
              />
            ))
          ) : (
            <NoData />
          )}
        </TransitGroup>

        <TransitGroup title="Parking lot status">
          {parkingLots.length > 0 ? (
            parkingLots.slice(0, 4).map((parking) => (
              <div key={parking.parkingName} className="flex items-center justify-between rounded-2xl bg-slate-950/40 p-3">
                <div>
                  <p className="text-sm font-medium text-white">{parking.parkingName}</p>
                  <p className="text-xs text-slate-400">
                    Available {parking.availableCount ?? "정보없음"} / Capacity {parking.capacity ?? "정보없음"}
                  </p>
                </div>
                <StatusBadge tone={parking.status === "만차" ? "danger" : parking.status === "보통" ? "warning" : "success"}>
                  {parking.status}
                </StatusBadge>
              </div>
            ))
          ) : (
            <NoData />
          )}
        </TransitGroup>
      </div>
    </section>
  );
}

function TransitGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function TransitLine({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/40 p-3">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function NoData() {
  return <p className="rounded-2xl bg-slate-950/40 p-3 text-sm text-slate-400">No public data available.</p>;
}

function flowValue(value: number | null | undefined): string {
  return value === null || value === undefined ? "정보없음" : value.toLocaleString("ko-KR");
}
