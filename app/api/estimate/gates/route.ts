import { getAreaConfig } from "@/lib/config/areas";
import { emptyCityData, fetchCityData } from "@/lib/seoul/fetchCityData";
import { fetchPopulation, SeoulApiError } from "@/lib/seoul/fetchPopulation";
import { estimateGateCrowd } from "@/lib/seoul/estimate/estimateGateCrowd";
import type { AreaConfig } from "@/types/area";
import type { SeoulCityData, SeoulPopulation } from "@/types/seoul";

export const runtime = "nodejs";
export const revalidate = 10;

type EstimateRequestBody = {
  areaNm?: string;
  population?: SeoulPopulation;
  citydata?: SeoulCityData;
  areaConfig?: AreaConfig;
};

export async function GET(request: Request) {
  const areaNm = new URL(request.url).searchParams.get("areaNm")?.trim();
  if (!areaNm) {
    return jsonError("areaNm이 필요합니다.", 400);
  }

  return estimateForArea({ areaNm });
}

export async function POST(request: Request) {
  let body: EstimateRequestBody;
  try {
    body = (await request.json()) as EstimateRequestBody;
  } catch {
    body = {};
  }

  const areaNm = body.areaNm?.trim();
  if (!areaNm) {
    return jsonError("areaNm이 필요합니다.", 400);
  }

  return estimateForArea({ ...body, areaNm });
}

async function estimateForArea(input: EstimateRequestBody & { areaNm: string }) {
  const areaConfig = input.areaConfig ?? getAreaConfig(input.areaNm);
  if (!areaConfig) {
    return jsonError(`알 수 없는 areaNm입니다: ${input.areaNm}`, 404);
  }

  try {
    const population = input.population ?? (await fetchPopulation(input.areaNm));
    const cityData = input.citydata ?? (await fetchCityDataOrEmpty(input.areaNm));
    const estimates = estimateGateCrowd(population, cityData, areaConfig);

    return Response.json(estimates, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=10",
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "출입구 추정 계산에 실패했습니다.", statusFromError(error));
  }
}

async function fetchCityDataOrEmpty(areaNm: string): Promise<SeoulCityData> {
  try {
    return await fetchCityData(areaNm);
  } catch {
    return emptyCityData(areaNm);
  }
}

function jsonError(message: string, status: number) {
  return Response.json(
    {
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function statusFromError(error: unknown): number {
  return error instanceof SeoulApiError ? error.status : 502;
}
