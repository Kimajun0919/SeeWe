import { maxCongestionLevel, normalizeCongestionLevel } from "@/lib/utils/congestion";
import type { AreaConfig, GateConfig } from "@/types/area";
import type { GateEstimate } from "@/types/estimate";
import type { NormalizedCongestionLevel, SeoulCityData, SeoulPopulation, TrafficStatus } from "@/types/seoul";
import { calculateConfidence } from "./calculateConfidence";
import { calculateDistanceMeters } from "./calculateDistance";
import { normalizeWeights } from "./normalizeWeights";

type WeightedGate = {
  gate: GateConfig;
  weight: number;
  reasons: string[];
};

export function estimateGateCrowd(
  population: SeoulPopulation,
  cityData: SeoulCityData,
  areaConfig: AreaConfig,
): GateEstimate[] {
  const baseWeighted = normalizeWeights(
    areaConfig.gates.map((gate) => ({
      gate,
      weight: gate.baseWeight,
      reasons: ["Base entrance distribution from area configuration."],
    })),
  );

  const adjusted = baseWeighted.map((item) => applySignals(item, cityData, areaConfig));
  const normalized = normalizeWeights(adjusted);
  const confidence = calculateConfidence(population, cityData);

  return normalized.map(({ gate, weight, reasons }) => {
    const estimatedMin = Math.round(population.populationMin * weight);
    const estimatedMax = Math.round(population.populationMax * weight);
    const estimatedMid = Math.round(population.populationMid * weight);
    const density = estimatedMid / (Math.PI * gate.radiusM * gate.radiusM);
    const densityCongestion = densityToCongestion(density);
    const congestionLevel = maxCongestionLevel([
      densityCongestion,
      normalizeCongestionLevel(population.congestionLevel),
    ]);

    return {
      gateId: gate.id,
      gateName: gate.name,
      lat: gate.lat,
      lng: gate.lng,
      estimatedMin,
      estimatedMax,
      estimatedMid,
      weight,
      congestionLevel,
      confidence,
      reasons: uniqueReasons(reasons).slice(0, 4),
      isEstimated: true,
    };
  });
}

function applySignals(weightedGate: WeightedGate, cityData: SeoulCityData, areaConfig: AreaConfig): WeightedGate {
  let weight = weightedGate.weight;
  const reasons = [...weightedGate.reasons];
  const gatePosition = { lat: weightedGate.gate.lat, lng: weightedGate.gate.lng };

  for (const anchor of areaConfig.transitAnchors) {
    const distance = calculateDistanceMeters(gatePosition, anchor);
    const closeness = distanceCloseness(distance, 900);
    if (closeness <= 0) {
      continue;
    }

    const hasMatchingPublicData =
      anchor.type === "subway"
        ? cityData.subways.some((subway) => namesOverlap(subway.stationName, anchor.name))
        : cityData.buses.some((bus) => namesOverlap(bus.stopName, anchor.name));
    const dataMultiplier = hasMatchingPublicData ? 1.35 : 1;
    weight += anchor.influenceWeight * closeness * dataMultiplier;
    reasons.push(
      hasMatchingPublicData
        ? `${anchor.name} public transit signal is near this entrance.`
        : `${anchor.name} is a nearby transit access point.`,
    );
  }

  for (const anchor of areaConfig.parkingAnchors) {
    const distance = calculateDistanceMeters(gatePosition, anchor);
    const closeness = distanceCloseness(distance, 750);
    if (closeness <= 0) {
      continue;
    }

    const matchingParking = cityData.parkingLots.find((parking) => namesOverlap(parking.parkingName, anchor.name));
    const parkingMultiplier = matchingParking?.status === "만차" ? 1.35 : matchingParking ? 1.15 : 1;
    weight += anchor.influenceWeight * closeness * parkingMultiplier;
    reasons.push(
      matchingParking
        ? `${matchingParking.parkingName} parking availability affects vehicle access.`
        : `${anchor.name} can influence vehicle arrivals.`,
    );
  }

  for (const anchor of areaConfig.roadAnchors) {
    const distance = calculateDistanceMeters(gatePosition, anchor);
    const closeness = distanceCloseness(distance, 900);
    if (closeness <= 0) {
      continue;
    }

    const relatedTraffic = cityData.roadTraffic.find((traffic) => namesOverlap(traffic.roadName, anchor.name));
    const congestionMultiplier = relatedTraffic ? trafficAdjustment(relatedTraffic) : 0.35;
    weight += anchor.influenceWeight * closeness * congestionMultiplier;
    if (relatedTraffic) {
      reasons.push(`${relatedTraffic.roadName} is ${relatedTraffic.status} near this entrance.`);
    }
  }

  const nearbyIncident = cityData.incidents.find((incident) => {
    if (incident.lat === undefined || incident.lng === undefined) {
      return false;
    }

    return calculateDistanceMeters(gatePosition, { lat: incident.lat, lng: incident.lng }) <= 900;
  });

  if (nearbyIncident) {
    weight += 0.08;
    reasons.push(`Nearby incident/control signal: ${nearbyIncident.type}.`);
  } else if (cityData.incidents.length > 0) {
    weight += 0.03;
    reasons.push("Area-level incident/control data is present.");
  }

  return {
    ...weightedGate,
    weight,
    reasons,
  };
}

function densityToCongestion(density: number): NormalizedCongestionLevel {
  if (!Number.isFinite(density)) {
    return "정보없음";
  }
  if (density >= 0.08) {
    return "붐빔";
  }
  if (density >= 0.04) {
    return "약간 붐빔";
  }
  if (density >= 0.015) {
    return "보통";
  }
  return "여유";
}

function distanceCloseness(distanceMeters: number, maxDistanceMeters: number): number {
  if (distanceMeters >= maxDistanceMeters) {
    return 0;
  }

  return 1 - distanceMeters / maxDistanceMeters;
}

function trafficAdjustment(traffic: TrafficStatus): number {
  switch (traffic.status) {
    case "통제":
      return 1.25;
    case "정체":
      return 1.1;
    case "서행":
      return 0.85;
    case "원활":
      return 0.45;
    default:
      return 0.35;
  }
}

function namesOverlap(left: string, right: string): boolean {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/\s|공영|정류장|주차장|역|parking|station|stop|lot|nearby|access|-/g, "");

  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);

  return (
    normalizedLeft.length > 0 &&
    normalizedRight.length > 0 &&
    (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  );
}

function uniqueReasons(reasons: string[]): string[] {
  return [...new Set(reasons)];
}
