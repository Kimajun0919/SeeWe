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
    throw new SeoulApiError("areaNm이 필요합니다.", 400);
  }

  const cached = cityDataCache.get(normalizedAreaNm);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const key = process.env.SEOUL_OPEN_API_KEY;
  if (!key) {
    throw new SeoulApiError("SEOUL_OPEN_API_KEY가 설정되지 않았습니다.", 500);
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
    throw new SeoulApiError(`서울 도시데이터 API 네트워크 오류: ${stringifyError(error)}`);
  }

  if (!response.ok) {
    throw new SeoulApiError(`서울 도시데이터 API가 HTTP ${response.status}를 반환했습니다.`, response.status);
  }

  let payload: unknown;
  try {
    payload = xmlParser.parse(await response.text());
  } catch (error) {
    throw new SeoulApiError(`서울 도시데이터 XML 파싱에 실패했습니다: ${stringifyError(error)}`);
  }

  const result = extractResult(payload);
  if (result.code && result.code !== "INFO-000") {
    throw new SeoulApiError(result.message || `서울 도시데이터 API가 ${result.code}를 반환했습니다.`);
  }

  let normalized: SeoulCityData;
  try {
    normalized = normalizeCityData(payload);
  } catch (error) {
    throw new SeoulApiError(`서울 도시데이터 정규화에 실패했습니다: ${stringifyError(error)}`);
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
