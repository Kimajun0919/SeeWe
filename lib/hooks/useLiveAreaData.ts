"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GateEstimate } from "@/types/estimate";
import type { SeoulCityData, SeoulPopulation } from "@/types/seoul";
import { useCountdown } from "./useCountdown";

export const LIVE_REFRESH_INTERVAL_MS = 10_000;

type ApiErrorBody = {
  error?: string;
};

export function useLiveAreaData(areaNm: string) {
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
    queryKey: ["gate-estimates", areaNm],
    queryFn: () => fetchJson<GateEstimate[]>(`/api/estimate/gates?areaNm=${encodedAreaNm}`),
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
    return error instanceof Error ? error.message : "Data reception delayed.";
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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }

    throw new Error(body.error || `Request failed with HTTP ${response.status}.`);
  }

  return (await response.json()) as T;
}
