export type CongestionLevel = "여유" | "보통" | "약간 붐빔" | "붐빔" | string;

export type SeoulPopulation = {
  areaName: string;
  areaCode: string;
  congestionLevel: CongestionLevel;
  congestionMessage: string;
  populationMin: number;
  populationMax: number;
  populationMid: number;
  maleRate: number | null;
  femaleRate: number | null;
  ageRates: {
    age0: number | null;
    age10: number | null;
    age20: number | null;
    age30: number | null;
    age40: number | null;
    age50: number | null;
    age60: number | null;
    age70: number | null;
  };
  residentRate: number | null;
  nonResidentRate: number | null;
  replaceYn: "Y" | "N" | null;
  sourceUpdatedAt: string | null;
  appFetchedAt: string;
  forecast: Array<{
    time: string;
    congestionLevel: CongestionLevel;
    populationMin: number;
    populationMax: number;
    populationMid: number;
  }>;
};

export type SeoulCityData = {
  areaName: string;
  roadTraffic: TrafficStatus[];
  incidents: IncidentStatus[];
  subways: SubwayStatus[];
  buses: BusStopStatus[];
  parkingLots: ParkingStatus[];
  weather?: WeatherStatus;
  events?: EventStatus[];
  sourceUpdatedAt?: string | null;
  appFetchedAt: string;
};

export type TrafficStatus = {
  roadName: string;
  sectionName: string;
  speed: number | null;
  status: "원활" | "서행" | "정체" | "통제" | "정보없음";
  message?: string;
  lat?: number;
  lng?: number;
};

export type IncidentStatus = {
  type: string;
  location: string;
  startedAt: string | null;
  message: string;
  lat?: number;
  lng?: number;
};

export type SubwayStatus = {
  stationName: string;
  lineName?: string;
  rideCount?: number | null;
  alightCount?: number | null;
  congestionHint?: string;
  lat?: number;
  lng?: number;
};

export type BusStopStatus = {
  stopName: string;
  stopId?: string;
  rideCount?: number | null;
  alightCount?: number | null;
  lat?: number;
  lng?: number;
};

export type ParkingStatus = {
  parkingName: string;
  capacity?: number | null;
  currentCount?: number | null;
  availableCount?: number | null;
  status: "여유" | "보통" | "혼잡" | "정보없음";
  lat?: number;
  lng?: number;
};

export type WeatherStatus = {
  temperature?: number | null;
  precipitation?: string | null;
  pm10?: string | null;
  pm25?: string | null;
  message?: string;
};

export type EventStatus = {
  title: string;
  place?: string;
  startDate?: string;
  endDate?: string;
};
