import type { SeoulPopulation } from "@/types/seoul";
import { extractResult } from "./normalizeHelpers";
import { normalizePopulation } from "./normalizePopulation";

const SEOUL_OPEN_API_BASE_URL = "http://openapi.seoul.go.kr:8088";
const CACHE_TTL_MS = 10_000;

type CacheEntry = {
  expiresAt: number;
  value: SeoulPopulation;
};

const populationCache = new Map<string, CacheEntry>();

export class SeoulApiError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "SeoulApiError";
    this.status = status;
  }
}

export async function fetchPopulation(areaNm: string): Promise<SeoulPopulation> {
  const normalizedAreaNm = areaNm.trim();
  if (!normalizedAreaNm) {
    throw new SeoulApiError("areaNm이 필요합니다.", 400);
  }

  const cached = populationCache.get(normalizedAreaNm);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const key = process.env.SEOUL_OPEN_API_KEY;
  if (!key) {
    throw new SeoulApiError("SEOUL_OPEN_API_KEY가 설정되지 않았습니다.", 500);
  }

  const url = `${SEOUL_OPEN_API_BASE_URL}/${encodeURIComponent(key)}/json/citydata_ppltn/1/5/${encodeURIComponent(
    normalizedAreaNm,
  )}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new SeoulApiError(`서울 인구 API 네트워크 오류: ${stringifyError(error)}`);
  }

  if (!response.ok) {
    throw new SeoulApiError(`서울 인구 API가 HTTP ${response.status}를 반환했습니다.`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new SeoulApiError(`서울 인구 JSON 파싱에 실패했습니다: ${stringifyError(error)}`);
  }

  const result = extractResult(payload);
  if (result.code && result.code !== "INFO-000") {
    throw new SeoulApiError(result.message || `서울 인구 API가 ${result.code}를 반환했습니다.`);
  }

  let normalized: SeoulPopulation;
  try {
    normalized = normalizePopulation(payload);
  } catch (error) {
    throw new SeoulApiError(`서울 인구 데이터 정규화에 실패했습니다: ${stringifyError(error)}`);
  }

  populationCache.set(normalizedAreaNm, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value: normalized,
  });

  return normalized;
}

function stringifyError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
