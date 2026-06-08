import { fetchCityData } from "@/lib/seoul/fetchCityData";
import { SeoulApiError } from "@/lib/seoul/fetchPopulation";

export const runtime = "nodejs";
export const revalidate = 10;

export async function GET(request: Request) {
  const areaNm = new URL(request.url).searchParams.get("areaNm")?.trim();
  if (!areaNm) {
    return jsonError("areaNm is required.", 400);
  }

  try {
    const data = await fetchCityData(areaNm);
    return Response.json(data, {
      headers: cacheHeaders(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "City data request failed.", statusFromError(error));
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
    "Cache-Control": "public, s-maxage=10, stale-while-revalidate=10",
  };
}
