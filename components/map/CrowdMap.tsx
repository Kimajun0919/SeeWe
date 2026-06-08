"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatPopulation } from "@/lib/utils/number";
import { useMapLayers, type MapLayerKey } from "@/lib/hooks/useMapLayers";
import type { AreaConfig } from "@/types/area";
import type { GateEstimate } from "@/types/estimate";
import type { SeoulCityData } from "@/types/seoul";
import { GateMarker } from "./GateMarker";
import { IncidentLayer } from "./IncidentLayer";
import { TrafficLayer } from "./TrafficLayer";
import { TransitLayer } from "./TransitLayer";

type CrowdMapProps = {
  areaConfig: AreaConfig;
  estimates: GateEstimate[];
  cityData?: SeoulCityData;
};

type KakaoLatLng = object;
type KakaoMapInstance = object;
type KakaoCustomOverlay = {
  setMap: (map: KakaoMapInstance | null) => void;
};
type KakaoMapsApi = {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: string | HTMLElement;
    map?: KakaoMapInstance;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlay;
  load: (callback: () => void) => void;
};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsApi;
    };
    __seeWeKakaoLoading?: Promise<void>;
  }
}

const layerLabels: Record<MapLayerKey, string> = {
  population: "인구",
  entrances: "출입구",
  roadTraffic: "도로 교통",
  incidents: "사고/통제",
  publicTransit: "대중교통",
  parking: "주차",
};

export function CrowdMap({ areaConfig, estimates, cityData }: CrowdMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<KakaoMapInstance | null>(null);
  const nativeOverlaysRef = useRef<KakaoCustomOverlay[]>([]);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [sdkStatus, setSdkStatus] = useState<"missing-key" | "loading" | "ready" | "failed">("missing-key");
  const { layers, toggleLayer } = useMapLayers();
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!isLayerMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!layerMenuRef.current?.contains(event.target as Node)) {
        setIsLayerMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isLayerMenuOpen]);

  const displayEstimates = useMemo(
    () =>
      estimates.length > 0
        ? estimates
        : areaConfig.gates.map((gate) => ({
            gateId: gate.id,
            gateNo: gate.gateNo,
            gateName: gate.name,
            gateType: gate.type,
            lat: gate.lat,
            lng: gate.lng,
            estimatedMin: 0,
            estimatedMax: 0,
            estimatedMid: 0,
            weight: gate.baseWeight,
            congestionLevel: "정보없음" as const,
            confidence: "낮음" as const,
            reasons: ["서울시 공개 데이터를 기다리는 중입니다."],
            isEstimated: true as const,
          })),
    [areaConfig.gates, estimates],
  );

  const bounds = useMemo(() => {
    const points = [
      areaConfig.center,
      areaConfig.mainSpot,
      ...areaConfig.gates,
      ...areaConfig.transitAnchors,
      ...areaConfig.roadAnchors,
      ...areaConfig.parkingAnchors,
    ];
    const lats = points.map((point) => point.lat);
    const lngs = points.map((point) => point.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latPadding = Math.max((maxLat - minLat) * 0.18, 0.002);
    const lngPadding = Math.max((maxLng - minLng) * 0.18, 0.002);

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [areaConfig]);

  const project = useMemo(
    () => (point: { lat: number; lng: number }) => ({
      x: clamp(((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100, 7, 93),
      y: clamp(((bounds.maxLat - point.lat) / (bounds.maxLat - bounds.minLat)) * 100, 7, 93),
    }),
    [bounds],
  );

  const markerScale = useMemo(() => {
    const values = displayEstimates.map((estimate) => estimate.estimatedMid);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [displayEstimates]);

  useEffect(() => {
    clearNativeOverlays(nativeOverlaysRef.current);
    kakaoMapRef.current = null;

    if (!kakaoMapKey || !mapRef.current) {
      setSdkStatus("missing-key");
      return;
    }

    let cancelled = false;
    setSdkStatus("loading");

    loadKakaoSdk(kakaoMapKey)
      .then(() => {
        if (cancelled || !window.kakao || !mapRef.current) {
          return;
        }

        const maps = window.kakao.maps;
        mapRef.current.innerHTML = "";
        const map = new maps.Map(mapRef.current, {
          center: new maps.LatLng(areaConfig.center.lat, areaConfig.center.lng),
          level: areaConfig.defaultZoom,
        });

        kakaoMapRef.current = map;
        setSdkStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setSdkStatus("failed");
        }
      });

    return () => {
      cancelled = true;
      clearNativeOverlays(nativeOverlaysRef.current);
      kakaoMapRef.current = null;
    };
  }, [
    areaConfig.center.lat,
    areaConfig.center.lng,
    areaConfig.defaultZoom,
    areaConfig.areaNm,
    kakaoMapKey,
  ]);

  useEffect(() => {
    if (sdkStatus !== "ready" || !window.kakao || !kakaoMapRef.current) {
      return;
    }

    const maps = window.kakao.maps;
    const map = kakaoMapRef.current;
    const overlays: KakaoCustomOverlay[] = [];
    const addOverlay = (
      point: { lat: number; lng: number },
      content: HTMLElement,
      options?: { zIndex?: number; yAnchor?: number },
    ) => {
      overlays.push(
        new maps.CustomOverlay({
          position: new maps.LatLng(point.lat, point.lng),
          content,
          map,
          xAnchor: 0.5,
          yAnchor: options?.yAnchor ?? 0.5,
          zIndex: options?.zIndex ?? 10,
        }),
      );
    };

    clearNativeOverlays(nativeOverlaysRef.current);

    addOverlay(areaConfig.mainSpot, createPillOverlayElement(areaConfig.mainSpot.name, "main"), {
      zIndex: 40,
      yAnchor: 0.65,
    });

    if (layers.population || layers.entrances) {
      displayEstimates.forEach((estimate) => {
        const size = markerSize(estimate.estimatedMid, markerScale.min, markerScale.max);
        addOverlay(estimate, createGateOverlayElement(estimate, size), { zIndex: 50 });
      });
    }

    if (layers.roadTraffic) {
      areaConfig.roadAnchors.forEach((anchor) => {
        const match = cityData?.roadTraffic.find((item) => namesOverlap(item.roadName, anchor.name));
        addOverlay(anchor, createPillOverlayElement(`${anchor.name} ${match?.status ?? "정보없음"}`, "road"), {
          zIndex: 20,
        });
      });
    }

    if (layers.incidents) {
      (cityData?.incidents ?? []).slice(0, 5).forEach((incident, index) => {
        addOverlay(
          {
            lat: incident.lat ?? areaConfig.center.lat + index * 0.0008,
            lng: incident.lng ?? areaConfig.center.lng - index * 0.0008,
          },
          createPillOverlayElement(`${incident.type}: ${incident.location}`, "danger"),
          { zIndex: 45 },
        );
      });
    }

    if (layers.publicTransit) {
      areaConfig.transitAnchors.forEach((anchor) => {
        addOverlay(
          anchor,
          createPillOverlayElement(`${anchor.type === "subway" ? "지하철" : "버스"}: ${anchor.name}`, "transit"),
          { zIndex: 20 },
        );
      });
    }

    if (layers.parking) {
      areaConfig.parkingAnchors.forEach((anchor) => {
        addOverlay(anchor, createPillOverlayElement(`주차: ${anchor.name}`, "parking"), { zIndex: 20 });
      });
    }

    nativeOverlaysRef.current = overlays;

    return () => {
      clearNativeOverlays(overlays);
      if (nativeOverlaysRef.current === overlays) {
        nativeOverlaysRef.current = [];
      }
    };
  }, [areaConfig, cityData, displayEstimates, layers, markerScale.max, markerScale.min, sdkStatus]);

  const mainSpotPoint = project(areaConfig.mainSpot);
  const shouldRenderFallbackMap = sdkStatus !== "ready";

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/25 sm:rounded-3xl">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">실시간 현장 지도</h3>
          <p className="mt-1 break-keep text-xs leading-5 text-slate-400">
            {sdkStatus === "ready"
              ? "카카오 지도에 출입구별 추정 인구 마커를 표시합니다."
              : "카카오 지도 키가 없어서 간이 지도를 표시합니다. NEXT_PUBLIC_KAKAO_MAP_KEY를 설정하면 카카오 지도가 활성화됩니다."}
          </p>
        </div>
        <div ref={layerMenuRef} className="relative">
          <button
            type="button"
            aria-expanded={isLayerMenuOpen}
            onClick={() => setIsLayerMenuOpen((current) => !current)}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-sky-100 transition hover:bg-white/10 sm:w-auto"
          >
            표시 항목
          </button>

          {isLayerMenuOpen ? (
            <div className="absolute right-0 top-12 z-40 grid w-48 gap-1 rounded-3xl border border-white/10 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-slate-950/40 backdrop-blur">
              {(Object.keys(layerLabels) as MapLayerKey[]).map((layer) => (
                <label
                  key={layer}
                  className="flex min-h-10 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-slate-200 transition hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={layers[layer]}
                    onChange={() => toggleLayer(layer)}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950 accent-sky-300"
                  />
                  <span className="text-sm font-semibold">{layerLabels[layer]}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative h-[430px] bg-slate-900 sm:h-[520px]">
        <div ref={mapRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),rgba(15,23,42,0.2)_38%,rgba(2,6,23,0.86)_72%)]" />
        <div className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-white/10 sm:inset-4 sm:rounded-[2rem]" />

        {shouldRenderFallbackMap ? (
          <div
            className="absolute z-30 max-w-36 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sky-200/60 bg-sky-300 px-3 py-2 text-center text-xs font-bold text-slate-950 shadow-xl"
            style={{ left: `${mainSpotPoint.x}%`, top: `${mainSpotPoint.y}%` }}
          >
            {areaConfig.mainSpot.name}
          </div>
        ) : null}

        {shouldRenderFallbackMap &&
          (layers.population || layers.entrances) &&
          displayEstimates.map((estimate) => {
            const point = project(estimate);
            const size = markerSize(estimate.estimatedMid, markerScale.min, markerScale.max);
            return (
              <GateMarker
                key={estimate.gateId}
                estimate={estimate}
                x={point.x}
                y={point.y}
                size={size}
                isSelected={selectedGateId === estimate.gateId}
                onSelect={(gateId) => setSelectedGateId((current) => (current === gateId ? null : gateId))}
              />
            );
          })}

        {shouldRenderFallbackMap && layers.roadTraffic ? (
          <TrafficLayer areaConfig={areaConfig} traffic={cityData?.roadTraffic ?? []} project={project} />
        ) : null}
        {shouldRenderFallbackMap && layers.incidents ? (
          <IncidentLayer areaConfig={areaConfig} incidents={cityData?.incidents ?? []} project={project} />
        ) : null}
        {shouldRenderFallbackMap && layers.publicTransit ? <TransitLayer areaConfig={areaConfig} project={project} /> : null}
        {shouldRenderFallbackMap && layers.parking
          ? areaConfig.parkingAnchors.map((anchor) => {
              const point = project(anchor);
              return (
                <div
                  key={anchor.id}
                  className="absolute z-10 max-w-32 -translate-x-1/2 -translate-y-1/2 truncate rounded-full border border-amber-200/40 bg-amber-950/80 px-2 py-1 text-[11px] font-medium text-amber-100 shadow-lg sm:max-w-none"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  주차: {anchor.name}
                </div>
              );
            })
          : null}

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-30 rounded-2xl border border-white/15 bg-slate-950/85 p-3 text-xs leading-5 text-slate-300 shadow-xl backdrop-blur sm:right-auto sm:max-w-sm">
          이 지도는 주변 인구 추정치를 참고용으로 시각화합니다. 개인 위치, 특정 단체, 참여자 규모를 식별하거나 추적하지 않습니다.
        </div>
      </div>
    </section>
  );
}

function markerSize(value: number, min: number, max: number): number {
  if (max <= min) {
    return 42;
  }

  return 34 + ((value - min) / (max - min)) * 28;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clearNativeOverlays(overlays: KakaoCustomOverlay[]): void {
  overlays.forEach((overlay) => overlay.setMap(null));
  overlays.length = 0;
}

function createGateOverlayElement(estimate: GateEstimate, size: number): HTMLElement {
  const displaySize = Math.max(size, 44);
  const element = document.createElement("div");
  element.className = `pointer-events-none flex flex-col items-center justify-center rounded-full border-2 border-white/80 text-[10px] font-bold shadow-xl shadow-slate-950/40 backdrop-blur ${gateTypeClass(
    estimate.gateType,
  )}`;
  element.style.width = `${displaySize}px`;
  element.style.height = `${displaySize}px`;
  element.title = `${estimate.gateName} 추정 ${formatPopulation(estimate.estimatedMin)} - ${formatPopulation(
    estimate.estimatedMax,
  )}`;

  const gateNo = document.createElement("span");
  gateNo.className = "leading-none";
  gateNo.textContent = estimate.gateNo ?? estimate.gateName.split(" ")[0];

  const population = document.createElement("span");
  population.className = "mt-0.5 leading-none";
  population.textContent = `${Math.round(estimate.estimatedMid / 100) / 10}천`;

  element.append(gateNo, population);
  return element;
}

function gateTypeClass(gateType: GateEstimate["gateType"]): string {
  switch (gateType) {
    case "vip_operation":
      return "bg-amber-300/90 text-slate-950";
    case "player":
      return "bg-violet-300/90 text-slate-950";
    case "staff":
      return "bg-emerald-300/90 text-slate-950";
    default:
      return "bg-sky-400/90 text-slate-950";
  }
}

function createPillOverlayElement(
  label: string,
  variant: "main" | "road" | "danger" | "transit" | "parking",
): HTMLElement {
  const element = document.createElement("div");
  element.className = `pointer-events-none max-w-52 truncate border px-2 py-1 text-[11px] font-semibold shadow-lg backdrop-blur ${pillOverlayClass(
    variant,
  )}`;
  element.textContent = label;
  element.title = label;
  return element;
}

function pillOverlayClass(variant: "main" | "road" | "danger" | "transit" | "parking"): string {
  switch (variant) {
    case "main":
      return "rounded-2xl border-sky-200/60 bg-sky-300 text-slate-950";
    case "danger":
      return "rounded-2xl border-red-300/40 bg-red-950/85 text-red-50";
    case "transit":
      return "rounded-full border-cyan-200/40 bg-cyan-950/85 text-cyan-100";
    case "parking":
      return "rounded-full border-amber-200/40 bg-amber-950/85 text-amber-100";
    default:
      return "rounded-full border-white/20 bg-slate-950/85 text-slate-100";
  }
}

function namesOverlap(left: string, right: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/\s|-/g, "");
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
}

function loadKakaoSdk(appKey: string): Promise<void> {
  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (window.__seeWeKakaoLoading) {
    return window.__seeWeKakaoLoading;
  }

  window.__seeWeKakaoLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오 지도 SDK가 정상적으로 로드되지 않았습니다."));
        return;
      }
      window.kakao.maps.load(resolve);
    };
    script.onerror = () => reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

  return window.__seeWeKakaoLoading;
}
