"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AreaConfig } from "@/types/area";
import type { GateEstimate } from "@/types/estimate";
import type { SeoulCityData, SeoulPopulation } from "@/types/seoul";
import { useCountdown } from "./useCountdown";

export const LIVE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

type ApiErrorBody = {
  error?: string;
};

export function useLiveAreaData(areaConfig: AreaConfig) {
  const areaNm = areaConfig.areaNm;
  const encodedAreaNm = encodeURIComponent(areaNm);

  const populationQuery = useQuery({
    queryKey: ["seoul-population", areaNm],
    queryFn: () => fetchJson<SeoulPopulation>(`/api/seoul/population?areaNm=${encodedAreaNm}`),
    enabled: Boolean(areaNm),
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: 2,
    placeholderData: keepPreviousData,
  });

  const cityDataQuery = useQuery({
    queryKey: ["seoul-citydata", areaNm],
    queryFn: () => fetchJson<SeoulCityData>(`/api/seoul/citydata?areaNm=${encodedAreaNm}`),
    enabled: Boolean(areaNm),
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: 2,
    placeholderData: keepPreviousData,
  });

  const gateEstimateQuery = useQuery({
    queryKey: ["gate-estimates", areaNm, areaConfig],
    queryFn: () =>
      fetchJson<GateEstimate[]>("/api/estimate/gates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          areaNm,
          areaConfig,
        }),
      }),
    enabled: Boolean(areaNm),
    refetchInterval: LIVE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: 2,
    placeholderData: keepPreviousData,
  });

  const refetchAll = useCallback(async () => {
    await Promise.allSettled([
      populationQuery.refetch(),
      cityDataQuery.refetch(),
      gateEstimateQuery.refetch(),
    ]);
  }, [cityDataQuery, gateEstimateQuery, populationQuery]);

  const isFetching =
    populationQuery.isFetching || cityDataQuery.isFetching || gateEstimateQuery.isFetching;
  const isError = populationQuery.isError || cityDataQuery.isError || gateEstimateQuery.isError;
  const lastFetchedAt = Math.max(
    populationQuery.dataUpdatedAt,
    cityDataQuery.dataUpdatedAt,
    gateEstimateQuery.dataUpdatedAt,
  );
  const nextRefreshIn = useCountdown(lastFetchedAt, LIVE_REFRESH_INTERVAL_MS);
  const sourceUpdatedAt = populationQuery.data?.sourceUpdatedAt ?? null;
  const isSourceWaiting = useSourceWaiting(sourceUpdatedAt, populationQuery.dataUpdatedAt);

  const errorMessage = useMemo(() => {
    const error = populationQuery.error ?? cityDataQuery.error ?? gateEstimateQuery.error;
    return error instanceof Error ? error.message : "데이터 수신이 지연되고 있습니다.";
  }, [cityDataQuery.error, gateEstimateQuery.error, populationQuery.error]);

  return {
    populationQuery,
    cityDataQuery,
    gateEstimateQuery,
    population: populationQuery.data,
    cityData: cityDataQuery.data,
    gateEstimates: gateEstimateQuery.data ?? [],
    refetchAll,
    isFetching,
    isError,
    errorMessage,
    lastFetchedAt,
    sourceUpdatedAt,
    nextRefreshIn,
    isSourceWaiting,
  };
}

function useSourceWaiting(sourceUpdatedAt: string | null, dataUpdatedAt: number): boolean {
  const [isWaiting, setIsWaiting] = useState(false);
  const previousSourceRef = useRef<string | null>(null);
  const previousDataUpdatedAtRef = useRef(0);

  useEffect(() => {
    if (!sourceUpdatedAt || !dataUpdatedAt || previousDataUpdatedAtRef.current === dataUpdatedAt) {
      return;
    }

    const previousSource = previousSourceRef.current;
    setIsWaiting(Boolean(previousSource && previousSource === sourceUpdatedAt));
    previousSourceRef.current = sourceUpdatedAt;
    previousDataUpdatedAtRef.current = dataUpdatedAt;
  }, [dataUpdatedAt, sourceUpdatedAt]);

  return isWaiting;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: new Headers(init?.headers),
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }

    throw new Error(body.error || `요청이 실패했습니다. HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
