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
    throw new SeoulApiError("areaNm is required.", 400);
  }

  const cached = populationCache.get(normalizedAreaNm);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const key = process.env.SEOUL_OPEN_API_KEY;
  if (!key) {
    throw new SeoulApiError("SEOUL_OPEN_API_KEY is not configured.", 500);
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
    throw new SeoulApiError(`Seoul population API network error: ${stringifyError(error)}`);
  }

  if (!response.ok) {
    throw new SeoulApiError(`Seoul population API returned HTTP ${response.status}.`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new SeoulApiError(`Failed to parse Seoul population JSON: ${stringifyError(error)}`);
  }

  const result = extractResult(payload);
  if (result.code && result.code !== "INFO-000") {
    throw new SeoulApiError(result.message || `Seoul population API returned ${result.code}.`);
  }

  let normalized: SeoulPopulation;
  try {
    normalized = normalizePopulation(payload);
  } catch (error) {
    throw new SeoulApiError(`Failed to normalize Seoul population data: ${stringifyError(error)}`);
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
