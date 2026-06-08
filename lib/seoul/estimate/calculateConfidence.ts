import { minutesSince } from "@/lib/utils/date";
import type { SeoulCityData, SeoulPopulation } from "@/types/seoul";

export function calculateConfidence(population: SeoulPopulation, cityData: SeoulCityData): "높음" | "보통" | "낮음" {
  const sourceAgeMinutes = minutesSince(population.sourceUpdatedAt);
  const sourceIsFresh = sourceAgeMinutes !== null && sourceAgeMinutes <= 10;
  const hasReplacementData = population.replaceYn === "Y";
  const hasTraffic = cityData.roadTraffic.length > 0;
  const hasTransit = cityData.subways.length > 0 || cityData.buses.length > 0;
  const hasParking = cityData.parkingLots.length > 0;

  if (hasReplacementData || sourceAgeMinutes === null || sourceAgeMinutes > 30) {
    return "낮음";
  }

  if (sourceIsFresh && hasTraffic && (hasTransit || hasParking)) {
    return "높음";
  }

  return "보통";
}
