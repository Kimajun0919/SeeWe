import Link from "next/link";
import { areaConfigs } from "@/lib/config/areas";

export default function AreaSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <Link href="/dashboard" className="text-sm font-medium text-sky-200 hover:text-sky-100">
            Back to dashboard
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Area settings</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Area configuration management</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Register Seoul API area names, map centers, main spots, entrances, transit anchors, road anchors, parking
            anchors, and default zoom levels. This MVP stores configuration in `lib/config/areas.ts`.
          </p>
        </header>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {areaConfigs.map((area) => (
            <article key={area.areaNm} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{area.displayName}</h2>
                  <p className="mt-1 text-sm text-slate-400">AREA_NM: {area.areaNm}</p>
                </div>
                <span className="rounded-full bg-sky-300 px-3 py-1 text-xs font-bold text-slate-950">
                  Zoom {area.defaultZoom}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <ConfigItem label="Center" value={`${area.center.lat}, ${area.center.lng}`} />
                <ConfigItem label="Main spot" value={area.mainSpot.name} />
                <ConfigItem label="Entrances" value={`${area.gates.length} configured`} />
                <ConfigItem label="Transit anchors" value={`${area.transitAnchors.length} configured`} />
                <ConfigItem label="Road anchors" value={`${area.roadAnchors.length} configured`} />
                <ConfigItem label="Parking anchors" value={`${area.parkingAnchors.length} configured`} />
              </dl>

              <div className="mt-5 grid gap-2">
                {area.gates.map((gate) => (
                  <div key={gate.id} className="rounded-2xl bg-slate-950/50 p-3 text-sm">
                    <p className="font-medium text-white">{gate.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {gate.lat}, {gate.lng} - radius {gate.radiusM}m - base weight {gate.baseWeight}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="text-lg font-semibold text-white">Add a new area</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            For this MVP, add new areas by extending `areaConfigs` with an officially supported Seoul `AREA_NM`,
            center coordinates, a main spot, entrances, transit anchors, road anchors, parking anchors, and a default
            zoom level. Keep entrance values labeled as estimates in the UI.
          </p>
        </section>
      </div>
    </main>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/50 p-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-200">{value}</dd>
    </div>
  );
}
