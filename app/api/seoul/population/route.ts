import { fetchPopulation, SeoulApiError } from "@/lib/seoul/fetchPopulation";

const API_CACHE_SECONDS = 5 * 60;

export const runtime = "nodejs";
export const revalidate = API_CACHE_SECONDS;

export async function GET(request: Request) {
  const areaNm = new URL(request.url).searchParams.get("areaNm")?.trim();
  if (!areaNm) {
    return jsonError("areaNm이 필요합니다.", 400);
  }

  try {
    const data = await fetchPopulation(areaNm);
    return Response.json(data, {
      headers: cacheHeaders(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "인구 데이터 요청에 실패했습니다.", statusFromError(error));
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

function cacheHeaders() {
  return {
    "Cache-Control": `public, s-maxage=${API_CACHE_SECONDS}, stale-while-revalidate=${API_CACHE_SECONDS}`,
  };
}
