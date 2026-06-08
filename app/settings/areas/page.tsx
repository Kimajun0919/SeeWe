import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";
import { areaConfigs } from "@/lib/config/areas";

export default function AreaSettingsPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-slate-950 px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BrandLogo />
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-white/10"
            >
              대시보드로 돌아가기
            </Link>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200 sm:tracking-[0.28em]">
            권역 설정
          </p>
          <h1 className="mt-2 break-keep text-2xl font-bold text-white sm:text-3xl">권역 구성 관리</h1>
          <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-slate-300">
            서울 API 권역명, 지도 중심 좌표, 주요 지점, 출입구, 대중교통 기준점, 도로 기준점, 주차장 기준점,
            기본 확대 수준을 관리합니다. 현재 MVP는 `lib/config/areas.ts`에 설정을 저장합니다.
          </p>
        </header>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {areaConfigs.map((area) => (
            <article
              key={area.areaNm}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-keep text-xl font-semibold text-white">{area.displayName}</h2>
                  <p className="mt-1 break-all text-sm text-slate-400">AREA_NM: {area.areaNm}</p>
                </div>
                <span className="w-fit rounded-full bg-sky-300 px-3 py-1 text-xs font-bold text-slate-950">
                  확대 {area.defaultZoom}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <ConfigItem label="중심 좌표" value={`${area.center.lat}, ${area.center.lng}`} />
                <ConfigItem label="주요 지점" value={area.mainSpot.name} />
                <ConfigItem label="출입구" value={`${area.gates.length}개 설정`} />
                <ConfigItem label="대중교통 기준점" value={`${area.transitAnchors.length}개 설정`} />
                <ConfigItem label="도로 기준점" value={`${area.roadAnchors.length}개 설정`} />
                <ConfigItem label="주차 기준점" value={`${area.parkingAnchors.length}개 설정`} />
              </dl>

              <div className="mt-5 grid gap-2">
                {area.gates.map((gate) => (
                  <div key={gate.id} className="rounded-2xl bg-slate-950/50 p-3 text-sm">
                    <p className="break-keep font-medium text-white">{gate.name}</p>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                      {gate.lat}, {gate.lng} - 반경 {gate.radiusM}m - 기본 가중치 {gate.baseWeight}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5">
          <h2 className="text-lg font-semibold text-white">새 권역 추가</h2>
          <p className="mt-2 break-keep text-sm leading-6 text-slate-300">
            `areaConfigs`에 서울시가 공식 지원하는 `AREA_NM`, 중심 좌표, 주요 지점, 출입구, 대중교통 기준점,
            도로 기준점, 주차장 기준점, 기본 확대 수준을 추가하면 됩니다. UI에서는 출입구 값이 항상 추정값으로
            표시되어야 합니다.
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
      <dd className="mt-1 break-words text-slate-200">{value}</dd>
    </div>
  );
}
