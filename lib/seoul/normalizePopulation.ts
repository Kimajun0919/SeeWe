import { normalizeCongestionLevel } from "@/lib/utils/congestion";
import { toRoundedNumber } from "@/lib/utils/number";
import type { SeoulPopulation } from "@/types/seoul";
import {
  collectRecords,
  collectValuesByKey,
  firstRecordWithAnyKey,
  flattenRecords,
  hasAnyKey,
  pickNumber,
  pickString,
  pickValue,
} from "./normalizeHelpers";

const populationKeys = [
  "AREA_CONGEST_LVL",
  "AREA_PPLTN_MIN",
  "AREA_PPLTN_MAX",
  "PPLTN_TIME",
];

const forecastKeys = ["FCST_TIME", "FCST_CONGEST_LVL", "FCST_PPLTN_MIN", "FCST_PPLTN_MAX"];

export function normalizePopulation(raw: unknown, appFetchedAt = new Date().toISOString()): SeoulPopulation {
  const records = collectRecords(raw);
  const areaRecord = firstRecordWithAnyKey(raw, ["AREA_NM", "AREA_CD"]);
  const populationRecord =
    records.find((record) => hasAnyKey(record, populationKeys)) ??
    firstRecordWithAnyKey(raw, populationKeys);

  if (!populationRecord) {
    throw new Error("Missing Seoul population status fields in API response.");
  }

  const populationMin = toRoundedNumber(pickValue(populationRecord, ["AREA_PPLTN_MIN"]));
  const populationMax = toRoundedNumber(pickValue(populationRecord, ["AREA_PPLTN_MAX"]));

  if (populationMin === 0 && populationMax === 0) {
    throw new Error("Missing population range in Seoul API response.");
  }

  const forecastValue =
    pickValue(populationRecord, ["FCST_PPLTN"]) ?? collectValuesByKey(raw, "FCST_PPLTN")[0];

  const forecastRecords = [
    ...flattenRecords(forecastValue),
    ...records.filter((record) => hasAnyKey(record, forecastKeys)),
  ].filter((record) => hasAnyKey(record, forecastKeys));

  const forecast = forecastRecords
    .map((record) => {
      const min = toRoundedNumber(pickValue(record, ["FCST_PPLTN_MIN", "PPLTN_MIN"]));
      const max = toRoundedNumber(pickValue(record, ["FCST_PPLTN_MAX", "PPLTN_MAX"]));

      return {
        time: pickString(record, ["FCST_TIME", "TIME"], "정보없음"),
        congestionLevel: normalizeCongestionLevel(
          pickString(record, ["FCST_CONGEST_LVL", "CONGEST_LVL"], "정보없음"),
        ),
        populationMin: min,
        populationMax: max,
        populationMid: Math.round((min + max) / 2),
      };
    })
    .filter((item, index, list) => item.time !== "정보없음" && list.findIndex((next) => next.time === item.time) === index)
    .slice(0, 12);

  return {
    areaName: pickString(populationRecord, ["AREA_NM"], pickString(areaRecord, ["AREA_NM"], "")),
    areaCode: pickString(populationRecord, ["AREA_CD"], pickString(areaRecord, ["AREA_CD"], "")),
    congestionLevel: normalizeCongestionLevel(pickString(populationRecord, ["AREA_CONGEST_LVL"], "정보없음")),
    congestionMessage: pickString(populationRecord, ["AREA_CONGEST_MSG"], "혼잡도 메시지가 없습니다."),
    populationMin,
    populationMax,
    populationMid: Math.round((populationMin + populationMax) / 2),
    maleRate: pickNumber(populationRecord, ["MALE_PPLTN_RATE"]),
    femaleRate: pickNumber(populationRecord, ["FEMALE_PPLTN_RATE"]),
    ageRates: {
      age0: pickNumber(populationRecord, ["PPLTN_RATE_0"]),
      age10: pickNumber(populationRecord, ["PPLTN_RATE_10"]),
      age20: pickNumber(populationRecord, ["PPLTN_RATE_20"]),
      age30: pickNumber(populationRecord, ["PPLTN_RATE_30"]),
      age40: pickNumber(populationRecord, ["PPLTN_RATE_40"]),
      age50: pickNumber(populationRecord, ["PPLTN_RATE_50"]),
      age60: pickNumber(populationRecord, ["PPLTN_RATE_60"]),
      age70: pickNumber(populationRecord, ["PPLTN_RATE_70"]),
    },
    residentRate: pickNumber(populationRecord, ["RESNT_PPLTN_RATE"]),
    nonResidentRate: pickNumber(populationRecord, ["NON_RESNT_PPLTN_RATE"]),
    replaceYn: normalizeReplaceYn(pickString(populationRecord, ["REPLACE_YN"], "")),
    sourceUpdatedAt: pickString(populationRecord, ["PPLTN_TIME"], "") || null,
    appFetchedAt,
    forecast,
  };
}

function normalizeReplaceYn(value: string): "Y" | "N" | null {
  if (value === "Y" || value === "N") {
    return value;
  }

  return null;
}
