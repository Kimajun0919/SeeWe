import { areaConfigs as defaultAreaConfigs } from "@/lib/config/areas";
import type { AreaConfig } from "@/types/area";

export const LOCAL_AREA_CONFIGS_STORAGE_KEY = "seewe.areaConfigs.v1";
export const LOCAL_AREA_CONFIGS_UPDATED_EVENT = "seewe:area-configs-updated";

export function loadLocalAreaConfigs(): AreaConfig[] {
  if (typeof window === "undefined") {
    return defaultAreaConfigs;
  }

  const rawValue = window.localStorage.getItem(LOCAL_AREA_CONFIGS_STORAGE_KEY);
  if (!rawValue) {
    return defaultAreaConfigs;
  }

  try {
    return mergeAreaConfigs(JSON.parse(rawValue));
  } catch {
    return defaultAreaConfigs;
  }
}

export function saveLocalAreaConfigs(configs: AreaConfig[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_AREA_CONFIGS_STORAGE_KEY, JSON.stringify(configs));
  window.dispatchEvent(new Event(LOCAL_AREA_CONFIGS_UPDATED_EVENT));
}

export function clearLocalAreaConfigs(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_AREA_CONFIGS_STORAGE_KEY);
  window.dispatchEvent(new Event(LOCAL_AREA_CONFIGS_UPDATED_EVENT));
}

export function mergeAreaConfigs(savedConfigs: unknown): AreaConfig[] {
  if (!Array.isArray(savedConfigs)) {
    return defaultAreaConfigs;
  }

  const savedByAreaNm = new Map<string, Record<string, unknown>>();
  savedConfigs.forEach((config) => {
    if (isRecord(config) && typeof config.areaNm === "string") {
      savedByAreaNm.set(config.areaNm, config);
    }
  });

  return defaultAreaConfigs.map((area) => {
    const saved = savedByAreaNm.get(area.areaNm);
    if (!saved) {
      return area;
    }

    return {
      ...area,
      center: mergeCoordinate(area.center, saved.center),
      mainSpot: mergeCoordinate(area.mainSpot, saved.mainSpot),
      gates: mergeCoordinateList(area.gates, saved.gates),
      transitAnchors: mergeCoordinateList(area.transitAnchors, saved.transitAnchors),
      roadAnchors: mergeCoordinateList(area.roadAnchors, saved.roadAnchors),
      parkingAnchors: mergeCoordinateList(area.parkingAnchors, saved.parkingAnchors),
    };
  });
}

function mergeCoordinate<T extends { lat: number; lng: number }>(base: T, saved: unknown): T {
  if (!isRecord(saved)) {
    return base;
  }

  return {
    ...base,
    lat: readCoordinate(saved.lat, base.lat),
    lng: readCoordinate(saved.lng, base.lng),
  };
}

function mergeCoordinateList<T extends { id: string; lat: number; lng: number }>(base: T[], saved: unknown): T[] {
  if (!Array.isArray(saved)) {
    return base;
  }

  const savedById = new Map<string, Record<string, unknown>>();
  saved.forEach((point) => {
    if (isRecord(point) && typeof point.id === "string") {
      savedById.set(point.id, point);
    }
  });

  return base.map((point) => mergeCoordinate(point, savedById.get(point.id)));
}

function readCoordinate(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
