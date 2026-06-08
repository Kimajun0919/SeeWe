"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { DashboardMenu } from "@/components/dashboard/DashboardMenu";
import { areaConfigs as defaultAreaConfigs, defaultAreaNm, getAreaConfig as getDefaultAreaConfig } from "@/lib/config/areas";
import { useLocalAreaConfigs } from "@/lib/hooks/useLocalAreaConfigs";
import type { AreaConfig } from "@/types/area";

type AreaSettingsClientProps = {
  initialAreaNm?: string;
};

type CoordinateField = "lat" | "lng";
type CoordinateListKey = "gates" | "transitAnchors" | "roadAnchors" | "parkingAnchors";

export function AreaSettingsClient({ initialAreaNm }: AreaSettingsClientProps) {
  const { areaConfigs, saveAreaConfigs, resetAreaConfigs } = useLocalAreaConfigs();
  const initialAreaConfig = initialAreaNm ? getDefaultAreaConfig(initialAreaNm) : undefined;
  const [selectedAreaNm, setSelectedAreaNm] = useState(initialAreaConfig?.areaNm ?? defaultAreaNm);
  const [draftConfigs, setDraftConfigs] = useState<AreaConfig[] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const activeConfigs = draftConfigs ?? areaConfigs;

  const selectedArea = useMemo(
    () => activeConfigs.find((area) => area.areaNm === selectedAreaNm) ?? activeConfigs[0],
    [activeConfigs, selectedAreaNm],
  );
  const dashboardHref = `/dashboard?area=${encodeURIComponent(selectedArea.areaNm)}`;

  const updateArea = (areaNm: string, updater: (area: AreaConfig) => AreaConfig) => {
    setDraftConfigs((current) =>
      (current ?? areaConfigs).map((area) => (area.areaNm === areaNm ? updater(area) : area)),
    );
  };

  const updateCenterCoordinate = (field: CoordinateField, rawValue: string) => {
    const value = parseCoordinate(rawValue);
    if (value === null) {
      return;
    }

    updateArea(selectedArea.areaNm, (area) => ({
      ...area,
      center: {
        ...area.center,
        [field]: value,
      },
    }));
  };

  const updateMainSpotCoordinate = (field: CoordinateField, rawValue: string) => {
    const value = parseCoordinate(rawValue);
    if (value === null) {
      return;
    }

    updateArea(selectedArea.areaNm, (area) => ({
      ...area,
      mainSpot: {
        ...area.mainSpot,
        [field]: value,
      },
    }));
  };

  const updateListCoordinate = (
    listKey: CoordinateListKey,
    pointId: string,
    field: CoordinateField,
    rawValue: string,
  ) => {
    const value = parseCoordinate(rawValue);
    if (value === null) {
      return;
    }

    updateArea(selectedArea.areaNm, (area) => {
      const nextList = area[listKey].map((point) =>
        point.id === pointId
          ? {
              ...point,
              [field]: value,
            }
          : point,
      ) as AreaConfig[CoordinateListKey];

      return {
        ...area,
        [listKey]: nextList,
      };
    });
  };

  const restoreSelectedArea = () => {
    const defaultArea = defaultAreaConfigs.find((area) => area.areaNm === selectedArea.areaNm);
    if (!defaultArea) {
      return;
    }

    updateArea(selectedArea.areaNm, () => defaultArea);
    setStatusMessage("선택한 권역 좌표를 기본값으로 되돌렸습니다. 저장을 눌러 반영하세요.");
  };

  const saveDraft = () => {
    saveAreaConfigs(activeConfigs);
    setDraftConfigs(null);
    setStatusMessage("좌표 설정을 이 브라우저에 저장했습니다.");
  };

  const resetAll = () => {
    resetAreaConfigs();
    setDraftConfigs(null);
    setStatusMessage("로컬 좌표 설정을 모두 삭제했습니다.");
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-slate-950 px-3 py-4 text-slate-100 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BrandLogo />
            <DashboardMenu
              areaNm={selectedArea.areaNm}
              areaOptions={activeConfigs}
              currentPage="settings"
              onAreaChange={setSelectedAreaNm}
            />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200 sm:tracking-[0.28em]">
            권역 설정
          </p>
          <h1 className="mt-2 break-keep text-2xl font-bold text-white sm:text-3xl">권역 좌표 관리</h1>
          <p className="mt-3 max-w-3xl break-keep text-sm leading-6 text-slate-300">
            지도 중심, 주요 지점, 출입구, 대중교통, 도로, 주차 기준점 좌표를 직접 조정합니다. 저장한 값은
            브라우저 localStorage에만 남고 이 기기에서만 대시보드와 추정 계산에 반영됩니다.
          </p>
        </header>

        <section className="mt-5 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label htmlFor="settings-area-select" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                권역 선택
              </label>
              <select
                id="settings-area-select"
                value={selectedArea.areaNm}
                onChange={(event) => setSelectedAreaNm(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none ring-sky-300 transition focus:ring-2"
              >
                {activeConfigs.map((area) => (
                  <option key={area.areaNm} value={area.areaNm}>
                    {area.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[34rem]">
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-200"
              >
                로컬 저장
              </button>
              <button
                type="button"
                onClick={restoreSelectedArea}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-white/10"
              >
                권역 기본값
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/10"
              >
                전체 초기화
              </button>
            </div>
          </div>

          {statusMessage ? (
            <p className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              {statusMessage}
            </p>
          ) : null}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <CoordinateCard
            title="지도 중심 좌표"
            description="지도 초기 중심점입니다."
            lat={selectedArea.center.lat}
            lng={selectedArea.center.lng}
            onLatChange={(value) => updateCenterCoordinate("lat", value)}
            onLngChange={(value) => updateCenterCoordinate("lng", value)}
          />
          <CoordinateCard
            title="주요 지점 좌표"
            description={selectedArea.mainSpot.name}
            lat={selectedArea.mainSpot.lat}
            lng={selectedArea.mainSpot.lng}
            onLatChange={(value) => updateMainSpotCoordinate("lat", value)}
            onLngChange={(value) => updateMainSpotCoordinate("lng", value)}
          />
        </section>

        <PointList
          title="출입구 좌표"
          points={selectedArea.gates.map((gate) => ({
            id: gate.id,
            label: gate.gateNo ? `${gate.gateNo} ${gate.name}` : gate.name,
            meta: `반경 ${gate.radiusM}m - 기본 가중치 ${gate.baseWeight}`,
            lat: gate.lat,
            lng: gate.lng,
          }))}
          onChange={(pointId, field, value) => updateListCoordinate("gates", pointId, field, value)}
        />

        <PointList
          title="대중교통 기준점 좌표"
          points={selectedArea.transitAnchors.map((anchor) => ({
            id: anchor.id,
            label: `${anchor.type === "subway" ? "지하철" : "버스"} ${anchor.name}`,
            meta: `영향 가중치 ${anchor.influenceWeight}`,
            lat: anchor.lat,
            lng: anchor.lng,
          }))}
          onChange={(pointId, field, value) => updateListCoordinate("transitAnchors", pointId, field, value)}
        />

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <PointList
            title="도로 기준점 좌표"
            points={selectedArea.roadAnchors.map((anchor) => ({
              id: anchor.id,
              label: anchor.name,
              meta: `영향 가중치 ${anchor.influenceWeight}`,
              lat: anchor.lat,
              lng: anchor.lng,
            }))}
            onChange={(pointId, field, value) => updateListCoordinate("roadAnchors", pointId, field, value)}
            compact
          />

          <PointList
            title="주차 기준점 좌표"
            points={selectedArea.parkingAnchors.map((anchor) => ({
              id: anchor.id,
              label: anchor.name,
              meta: `영향 가중치 ${anchor.influenceWeight}`,
              lat: anchor.lat,
              lng: anchor.lng,
            }))}
            onChange={(pointId, field, value) => updateListCoordinate("parkingAnchors", pointId, field, value)}
            compact
          />
        </section>

        <section className="mt-5 rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5">
          <h2 className="text-lg font-semibold text-white">저장 후 확인</h2>
          <p className="mt-2 break-keep text-sm leading-6 text-slate-300">
            저장된 좌표는 API 서버에 영구 저장되지 않고 현재 브라우저에만 적용됩니다. 다른 기기나 브라우저에서는
            기본 좌표를 사용합니다.
          </p>
          <Link
            href={dashboardHref}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
          >
            현재 권역 대시보드 보기
          </Link>
        </section>
      </div>
    </main>
  );
}

function CoordinateCard({
  title,
  description,
  lat,
  lng,
  onLatChange,
  onLngChange,
}: {
  title: string;
  description: string;
  lat: number;
  lng: number;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
}) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5">
      <h2 className="break-keep text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 break-keep text-sm text-slate-400">{description}</p>
      <CoordinateInputs lat={lat} lng={lng} onLatChange={onLatChange} onLngChange={onLngChange} />
    </article>
  );
}

function PointList({
  title,
  points,
  onChange,
  compact = false,
}: {
  title: string;
  points: Array<{
    id: string;
    label: string;
    meta: string;
    lat: number;
    lng: number;
  }>;
  onChange: (pointId: string, field: CoordinateField, value: string) => void;
  compact?: boolean;
}) {
  return (
    <section className={`${compact ? "" : "mt-5"} rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-4 sm:rounded-3xl sm:p-5`}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 grid gap-3">
        {points.map((point) => (
          <article key={point.id} className="rounded-2xl bg-slate-950/50 p-3">
            <div className="min-w-0">
              <h3 className="break-keep text-sm font-semibold text-white">{point.label}</h3>
              <p className="mt-1 break-keep text-xs text-slate-500">{point.meta}</p>
            </div>
            <CoordinateInputs
              lat={point.lat}
              lng={point.lng}
              onLatChange={(value) => onChange(point.id, "lat", value)}
              onLngChange={(value) => onChange(point.id, "lng", value)}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function CoordinateInputs({
  lat,
  lng,
  onLatChange,
  onLngChange,
}: {
  lat: number;
  lng: number;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        LAT
        <input
          type="number"
          step="0.000001"
          value={lat}
          onChange={(event) => onLatChange(event.target.value)}
          className="min-h-11 rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold tracking-normal text-slate-100 outline-none ring-sky-300 transition focus:ring-2"
        />
      </label>
      <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        LNG
        <input
          type="number"
          step="0.000001"
          value={lng}
          onChange={(event) => onLngChange(event.target.value)}
          className="min-h-11 rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold tracking-normal text-slate-100 outline-none ring-sky-300 transition focus:ring-2"
        />
      </label>
    </div>
  );
}

function parseCoordinate(rawValue: string): number | null {
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}
