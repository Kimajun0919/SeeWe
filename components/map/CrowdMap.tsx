"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatPopulation } from "@/lib/utils/number";
import { useMapLayers, type MapLayerKey } from "@/lib/hooks/useMapLayers";
import type { AreaConfig } from "@/types/area";
import type { GateEstimate } from "@/types/estimate";
import type { SeoulCityData } from "@/types/seoul";
import { GateMarker } from "./GateMarker";
import { IncidentLayer } from "./IncidentLayer";
import { MapLegend } from "./MapLegend";
import { TrafficLayer } from "./TrafficLayer";
import { TransitLayer } from "./TransitLayer";

type CrowdMapProps = {
  areaConfig: AreaConfig;
  estimates: GateEstimate[];
  cityData?: SeoulCityData;
};

type KakaoLatLng = object;
type KakaoMapInstance = object;
type KakaoMarker = object;
type KakaoMapsApi = {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMapInstance; title?: string }) => KakaoMarker;
  InfoWindow: new (options: { content: string; removable?: boolean }) => {
    open: (map: KakaoMapInstance, marker: KakaoMarker) => void;
  };
  event: {
    addListener: (target: KakaoMarker, type: "click", handler: () => void) => void;
  };
  load: (callback: () => void) => void;
};

declare global {
  interface Window {
    kakao?: {
      maps: KakaoMapsApi;
    };
    __crowdScopeKakaoLoading?: Promise<void>;
  }
}

const layerLabels: Record<MapLayerKey, string> = {
  population: "Population",
  entrances: "Entrances",
  roadTraffic: "Road traffic",
  incidents: "Incidents/controls",
  publicTransit: "Public transit",
  parking: "Parking",
};

export function CrowdMap({ areaConfig, estimates, cityData }: CrowdMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [sdkStatus, setSdkStatus] = useState<"missing-key" | "loading" | "ready" | "failed">("missing-key");
  const { layers, toggleLayer } = useMapLayers();
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const displayEstimates = useMemo(
    () =>
      estimates.length > 0
        ? estimates
        : areaConfig.gates.map((gate) => ({
            gateId: gate.id,
            gateName: gate.name,
            lat: gate.lat,
            lng: gate.lng,
            estimatedMin: 0,
            estimatedMax: 0,
            estimatedMid: 0,
            weight: gate.baseWeight,
            congestionLevel: "정보없음" as const,
            confidence: "낮음" as const,
            reasons: ["Waiting for Seoul public data."],
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
        const map = new maps.Map(mapRef.current, {
          center: new maps.LatLng(areaConfig.center.lat, areaConfig.center.lng),
          level: areaConfig.defaultZoom,
        });

        new maps.Marker({
          position: new maps.LatLng(areaConfig.mainSpot.lat, areaConfig.mainSpot.lng),
          map,
          title: areaConfig.mainSpot.name,
        });

        if (layers.entrances || layers.population) {
          displayEstimates.forEach((estimate) => {
            const marker = new maps.Marker({
              position: new maps.LatLng(estimate.lat, estimate.lng),
              map,
              title: estimate.gateName,
            });
            const infoWindow = new maps.InfoWindow({
              removable: true,
              content: `<div style="padding:10px;font-size:12px;line-height:1.5"><strong>${escapeHtml(
                estimate.gateName,
              )}</strong><br/>Estimated ${escapeHtml(formatPopulation(estimate.estimatedMin))} - ${escapeHtml(
                formatPopulation(estimate.estimatedMax),
              )}<br/>Congestion: ${escapeHtml(estimate.congestionLevel)}<br/>Confidence: ${escapeHtml(
                estimate.confidence,
              )}</div>`,
            });
            maps.event.addListener(marker, "click", () => infoWindow.open(map, marker));
          });
        }

        setSdkStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setSdkStatus("failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    areaConfig.center.lat,
    areaConfig.center.lng,
    areaConfig.defaultZoom,
    areaConfig.mainSpot.lat,
    areaConfig.mainSpot.lng,
    areaConfig.mainSpot.name,
    displayEstimates,
    kakaoMapKey,
    layers.entrances,
    layers.population,
  ]);

  const mainSpotPoint = project(areaConfig.mainSpot);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-slate-950/25">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-semibold text-white">Real-time Site Map</h3>
          <p className="mt-1 text-xs text-slate-400">
            {sdkStatus === "ready"
              ? "Kakao Maps SDK active with estimated entrance markers."
              : "Schematic fallback map. Add NEXT_PUBLIC_KAKAO_MAP_KEY to enable Kakao Maps."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(layerLabels) as MapLayerKey[]).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => toggleLayer(layer)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                layers[layer]
                  ? "bg-sky-300 text-slate-950 ring-sky-200"
                  : "bg-slate-900 text-slate-400 ring-white/10"
              }`}
            >
              {layerLabels[layer]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[520px] bg-slate-900">
        <div ref={mapRef} className="absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),rgba(15,23,42,0.2)_38%,rgba(2,6,23,0.86)_72%)]" />
        <div className="absolute inset-4 rounded-[2rem] border border-white/10" />

        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sky-200/60 bg-sky-300 px-3 py-2 text-xs font-bold text-slate-950 shadow-xl"
          style={{ left: `${mainSpotPoint.x}%`, top: `${mainSpotPoint.y}%` }}
        >
          {areaConfig.mainSpot.name}
        </div>

        {(layers.population || layers.entrances) &&
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

        {layers.roadTraffic ? (
          <TrafficLayer areaConfig={areaConfig} traffic={cityData?.roadTraffic ?? []} project={project} />
        ) : null}
        {layers.incidents ? (
          <IncidentLayer areaConfig={areaConfig} incidents={cityData?.incidents ?? []} project={project} />
        ) : null}
        {layers.publicTransit ? <TransitLayer areaConfig={areaConfig} project={project} /> : null}
        {layers.parking
          ? areaConfig.parkingAnchors.map((anchor) => {
              const point = project(anchor);
              return (
                <div
                  key={anchor.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/40 bg-amber-950/80 px-2 py-1 text-[11px] font-medium text-amber-100 shadow-lg"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  Parking: {anchor.name}
                </div>
              );
            })
          : null}

        <MapLegend estimates={displayEstimates} />
        <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-2xl border border-white/15 bg-slate-950/85 p-3 text-xs text-slate-300 shadow-xl backdrop-blur">
          This map visualizes surrounding crowd density estimates only. It does not identify individuals or group
          membership.
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

function loadKakaoSdk(appKey: string): Promise<void> {
  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (window.__crowdScopeKakaoLoading) {
    return window.__crowdScopeKakaoLoading;
  }

  window.__crowdScopeKakaoLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK loaded without maps object."));
        return;
      }
      window.kakao.maps.load(resolve);
    };
    script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK."));
    document.head.appendChild(script);
  });

  return window.__crowdScopeKakaoLoading;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
