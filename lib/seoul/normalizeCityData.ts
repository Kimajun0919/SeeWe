import { toNumber } from "@/lib/utils/number";
import type {
  BusStopStatus,
  EventStatus,
  IncidentStatus,
  ParkingStatus,
  SeoulCityData,
  SubwayStatus,
  TrafficStatus,
  WeatherStatus,
} from "@/types/seoul";
import {
  collectRecords,
  collectValuesByKey,
  firstRecordWithAnyKey,
  flattenRecords,
  hasAnyKey,
  pickNumber,
  pickString,
  uniqueBy,
} from "./normalizeHelpers";

export function normalizeCityData(raw: unknown, appFetchedAt = new Date().toISOString()): SeoulCityData {
  const areaRecord = firstRecordWithAnyKey(raw, ["AREA_NM", "AREA_CD"]);
  const records = collectRecords(raw);

  return {
    areaName: pickString(areaRecord, ["AREA_NM"], ""),
    roadTraffic: normalizeTraffic(extractSectionRecords(raw, "ROAD_TRAFFIC_STTS")),
    incidents: normalizeIncidents(extractSectionRecords(raw, "ACDNT_CNTRL_STTS")),
    subways: normalizeSubways(extractSectionRecords(raw, "SUB_STTS")),
    buses: normalizeBuses(extractSectionRecords(raw, "BUS_STN_STTS")),
    parkingLots: normalizeParking(extractSectionRecords(raw, "PRK_STTS")),
    weather: normalizeWeather(extractSectionRecords(raw, "WEATHER_STTS")[0]),
    events: normalizeEvents(extractSectionRecords(raw, "EVENT_STTS")),
    sourceUpdatedAt:
      pickString(
        records.find((record) => hasAnyKey(record, ["PPLTN_TIME", "ROAD_TRAFFIC_TIME", "WEATHER_TIME"])) ?? areaRecord,
        ["PPLTN_TIME", "ROAD_TRAFFIC_TIME", "WEATHER_TIME", "LIVE_DATA_STTS_DT"],
        "",
      ) || null,
    appFetchedAt,
  };
}

function extractSectionRecords(root: unknown, sectionName: string) {
  const values = collectValuesByKey(root, sectionName);
  const records = values.flatMap((value) => flattenRecords(value));

  return records.filter((record) => !onlyContainsSection(record, sectionName));
}

function onlyContainsSection(record: Record<string, unknown>, sectionName: string): boolean {
  const keys = Object.keys(record);
  return keys.length === 1 && keys[0] === sectionName;
}

function normalizeTraffic(records: Record<string, unknown>[]): TrafficStatus[] {
  const traffic = records
    .map((record): TrafficStatus => {
      const speed = pickNumber(record, [
        "ROAD_TRAFFIC_SPD",
        "ROAD_TRAFFIC_AVG_SPEED",
        "AVG_SPEED",
        "SPEED",
        "SPD",
      ]);
      const rawStatus = pickString(record, [
        "ROAD_TRAFFIC_IDX",
        "ROAD_TRAFFIC_STTS",
        "TRAFFIC_STTS",
        "TRAFFIC_STATUS",
        "ROAD_TRAFFIC_LVL",
      ]);

      return {
        roadName: pickString(record, ["ROAD_NM", "ROAD_NAME", "ROAD_NM_KOR", "LINK_NM"], "정보없음"),
        sectionName:
          pickString(record, ["ROAD_SECTION_NM", "SECTION_NM", "START_ND_NM"], "") ||
          joinSection(record),
        speed,
        status: trafficStatus(rawStatus, speed),
        message: pickString(record, ["ROAD_MSG", "TRAFFIC_MSG", "MESSAGE"], ""),
        lat: pickNumber(record, ["LAT", "Y", "MAP_LAT"]) ?? undefined,
        lng: pickNumber(record, ["LNG", "X", "MAP_LNG", "LON"]) ?? undefined,
      };
    })
    .filter((item) => item.roadName !== "정보없음" || item.speed !== null);

  return uniqueBy(traffic, (item) => `${item.roadName}-${item.sectionName}-${item.speed ?? "x"}`).slice(0, 12);
}

function normalizeIncidents(records: Record<string, unknown>[]): IncidentStatus[] {
  const incidents = records
    .map((record): IncidentStatus => ({
      type: pickString(record, ["ACDNT_CNTRL_TYPE", "ACDNT_TYPE", "INCIDENT_TYPE", "TYPE"], "사고/통제"),
      location: pickString(record, ["ACDNT_CNTRL_NM", "ACDNT_CNTRL_LOC", "LOCATION", "ROAD_NM"], "위치 정보 없음"),
      startedAt: pickString(record, ["ACDNT_OCCR_DT", "START_DT", "STARTED_AT", "OCCUR_DT"], "") || null,
      message: pickString(
        record,
        ["ACDNT_CNTRL_MSG", "ACDNT_CNTRL_DTL", "INCIDENT_MSG", "MESSAGE", "DETAIL"],
        "세부 메시지가 없습니다.",
      ),
      lat: pickNumber(record, ["LAT", "Y", "MAP_LAT"]) ?? undefined,
      lng: pickNumber(record, ["LNG", "X", "MAP_LNG", "LON"]) ?? undefined,
    }))
    .filter((item) => item.location !== "위치 정보 없음" || item.message !== "세부 메시지가 없습니다.");

  return uniqueBy(incidents, (item) => `${item.type}-${item.location}-${item.startedAt ?? ""}`).slice(0, 10);
}

function normalizeSubways(records: Record<string, unknown>[]): SubwayStatus[] {
  const subways = records
    .map((record): SubwayStatus => ({
      stationName: pickString(record, ["SUB_STN_NM", "STN_NM", "STATION_NM", "SUBWAY_STN_NM"], "정보없음"),
      lineName: pickString(record, ["SUB_LINE", "LINE_NM", "SUBWAY_LINE"], ""),
      rideCount: pickNumber(record, ["RIDE_PASGR_NUM", "RIDE_CNT", "BOARDING_CNT"]),
      alightCount: pickNumber(record, ["ALIGHT_PASGR_NUM", "ALIGHT_CNT", "GETOFF_CNT"]),
      congestionHint: pickString(record, ["SUB_CONGEST_MSG", "CONGEST_MSG", "MESSAGE"], ""),
      lat: pickNumber(record, ["LAT", "Y", "MAP_LAT"]) ?? undefined,
      lng: pickNumber(record, ["LNG", "X", "MAP_LNG", "LON"]) ?? undefined,
    }))
    .filter((item) => item.stationName !== "정보없음");

  return uniqueBy(subways, (item) => `${item.stationName}-${item.lineName ?? ""}`).slice(0, 10);
}

function normalizeBuses(records: Record<string, unknown>[]): BusStopStatus[] {
  const buses = records
    .map((record): BusStopStatus => ({
      stopName: pickString(record, ["BUS_STN_NM", "STN_NM", "STOP_NM", "BUS_STOP_NM"], "정보없음"),
      stopId: pickString(record, ["BUS_STN_ID", "ARS_ID", "STOP_ID"], ""),
      rideCount: pickNumber(record, ["RIDE_PASGR_NUM", "RIDE_CNT", "BOARDING_CNT"]),
      alightCount: pickNumber(record, ["ALIGHT_PASGR_NUM", "ALIGHT_CNT", "GETOFF_CNT"]),
      lat: pickNumber(record, ["LAT", "Y", "MAP_LAT"]) ?? undefined,
      lng: pickNumber(record, ["LNG", "X", "MAP_LNG", "LON"]) ?? undefined,
    }))
    .filter((item) => item.stopName !== "정보없음");

  return uniqueBy(buses, (item) => `${item.stopName}-${item.stopId ?? ""}`).slice(0, 12);
}

function normalizeParking(records: Record<string, unknown>[]): ParkingStatus[] {
  const parkingLots = records
    .map((record): ParkingStatus => {
      const capacity = pickNumber(record, ["PRK_CPCTY", "CAPACITY", "TOT_CNT", "TOTAL_COUNT"]);
      const currentCount = pickNumber(record, ["CUR_PRK_CNT", "CUR_PARKING_CNT", "CURRENT_COUNT"]);
      const availableCount =
        pickNumber(record, ["CUR_PRK_AVBL_CNT", "AVAILABLE_CNT", "AVAILABLE_COUNT"]) ??
        (capacity !== null && currentCount !== null ? Math.max(0, capacity - currentCount) : null);

      return {
        parkingName: pickString(record, ["PRK_NM", "PARKING_NM", "PARKING_NAME"], "정보없음"),
        capacity,
        currentCount,
        availableCount,
        status: parkingStatus(capacity, availableCount),
        lat: pickNumber(record, ["LAT", "Y", "MAP_LAT"]) ?? undefined,
        lng: pickNumber(record, ["LNG", "X", "MAP_LNG", "LON"]) ?? undefined,
      };
    })
    .filter((item) => item.parkingName !== "정보없음");

  return uniqueBy(parkingLots, (item) => item.parkingName).slice(0, 12);
}

function normalizeWeather(record: Record<string, unknown> | undefined): WeatherStatus | undefined {
  if (!record) {
    return undefined;
  }

  return {
    temperature: pickNumber(record, ["TEMP", "TEMPERATURE", "NOW_TEMP"]),
    precipitation: pickString(record, ["PRECIPITATION", "PCP_MSG", "RAIN_MSG"], ""),
    pm10: pickString(record, ["PM10", "PM10_INDEX", "PM10_MSG"], ""),
    pm25: pickString(record, ["PM25", "PM25_INDEX", "PM25_MSG"], ""),
    message: pickString(record, ["WEATHER_MSG", "MESSAGE"], ""),
  };
}

function normalizeEvents(records: Record<string, unknown>[]): EventStatus[] {
  const events = records
    .map((record): EventStatus => ({
      title: pickString(record, ["EVENT_NM", "EVENT_TITLE", "TITLE"], "정보없음"),
      place: pickString(record, ["EVENT_PLACE", "PLACE"], ""),
      startDate: pickString(record, ["EVENT_STRT_DATE", "START_DATE", "EVENT_START_DATE"], ""),
      endDate: pickString(record, ["EVENT_END_DATE", "END_DATE"], ""),
    }))
    .filter((item) => item.title !== "정보없음");

  return uniqueBy(events, (item) => `${item.title}-${item.place ?? ""}`).slice(0, 8);
}

function trafficStatus(
  rawStatus: string,
  speed: number | null,
): "원활" | "서행" | "정체" | "통제" | "정보없음" {
  if (rawStatus.includes("통제")) {
    return "통제";
  }
  if (rawStatus.includes("정체") || rawStatus.includes("혼잡")) {
    return "정체";
  }
  if (rawStatus.includes("서행")) {
    return "서행";
  }
  if (rawStatus.includes("원활") || rawStatus.includes("소통")) {
    return "원활";
  }

  if (speed === null) {
    return "정보없음";
  }
  if (speed >= 25) {
    return "원활";
  }
  if (speed >= 12) {
    return "서행";
  }
  if (speed > 0) {
    return "정체";
  }

  return "정보없음";
}

function parkingStatus(
  capacity: number | null,
  availableCount: number | null,
): "여유" | "보통" | "혼잡" | "정보없음" {
  if (capacity === null || availableCount === null || capacity <= 0) {
    return "정보없음";
  }

  const ratio = availableCount / capacity;
  if (ratio >= 0.35) {
    return "여유";
  }
  if (ratio >= 0.12) {
    return "보통";
  }

  return "혼잡";
}

function joinSection(record: Record<string, unknown>): string {
  const start = pickString(record, ["START_ND_NM", "START_NODE_NM"], "");
  const end = pickString(record, ["END_ND_NM", "END_NODE_NM"], "");
  return [start, end].filter(Boolean).join(" - ") || "구간 정보 없음";
}
