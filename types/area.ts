export type AreaConfig = {
  areaNm: string;
  displayName: string;
  center: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  mainSpot: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  gates: GateConfig[];
  transitAnchors: TransitAnchor[];
  roadAnchors: RoadAnchor[];
  parkingAnchors: ParkingAnchor[];
};

export type GateType = "public" | "vip_operation" | "player" | "staff";

export type GateConfig = {
  id: string;
  gateNo?: string;
  name: string;
  type?: GateType;
  lat: number;
  lng: number;
  radiusM: number;
  baseWeight: number;
  description?: string;
  directionHint?: string;
};

export type TransitAnchor = {
  id: string;
  type: "subway" | "bus";
  name: string;
  lat: number;
  lng: number;
  influenceWeight: number;
};

export type RoadAnchor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  influenceWeight: number;
};

export type ParkingAnchor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  influenceWeight: number;
};
