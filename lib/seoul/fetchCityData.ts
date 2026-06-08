import { XMLParser } from "fast-xml-parser";
import type { SeoulCityData } from "@/types/seoul";
import { extractResult } from "./normalizeHelpers";
import { normalizeCityData } from "./normalizeCityData";
import { SeoulApiError } from "./fetchPopulation";

const SEOUL_OPEN_API_BASE_URL = "http://openapi.seoul.go.kr:8088";
const CACHE_TTL_MS = 10_000;

type CacheEntry = {
  expiresAt: number;
  value: SeoulCityData;
};

const cityDataCache = new Map<string, CacheEntry>();
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
});

export async function fetchCityData(areaNm: string): Promise<SeoulCityData> {
  const normalizedAreaNm = areaNm.trim();
  if (!normalizedAreaNm) {
    throw new SeoulApiError("areaNm is required.", 400);
  }

  const cached = cityDataCache.get(normalizedAreaNm);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const key = process.env.SEOUL_OPEN_API_KEY;
  if (!key) {
    throw new SeoulApiError("SEOUL_OPEN_API_KEY is not configured.", 500);
  }

  const url = `${SEOUL_OPEN_API_BASE_URL}/${encodeURIComponent(key)}/xml/citydata/1/5/${encodeURIComponent(
    normalizedAreaNm,
  )}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/xml,text/xml",
      },
    });
  } catch (error) {
    throw new SeoulApiError(`Seoul citydata API network error: ${stringifyError(error)}`);
  }

  if (!response.ok) {
    throw new SeoulApiError(`Seoul citydata API returned HTTP ${response.status}.`, response.status);
  }

  let payload: unknown;
  try {
    payload = xmlParser.parse(await response.text());
  } catch (error) {
    throw new SeoulApiError(`Failed to parse Seoul citydata XML: ${stringifyError(error)}`);
  }

  const result = extractResult(payload);
  if (result.code && result.code !== "INFO-000") {
    throw new SeoulApiError(result.message || `Seoul citydata API returned ${result.code}.`);
  }

  let normalized: SeoulCityData;
  try {
    normalized = normalizeCityData(payload);
  } catch (error) {
    throw new SeoulApiError(`Failed to normalize Seoul citydata: ${stringifyError(error)}`);
  }

  cityDataCache.set(normalizedAreaNm, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value: normalized,
  });

  return normalized;
}

export function emptyCityData(areaNm: string): SeoulCityData {
  return {
    areaName: areaNm,
    roadTraffic: [],
    incidents: [],
    subways: [],
    buses: [],
    parkingLots: [],
    sourceUpdatedAt: null,
    appFetchedAt: new Date().toISOString(),
  };
}

function stringifyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
