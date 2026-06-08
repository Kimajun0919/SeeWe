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

export type GateConfig = {
  id: string;
  name: string;
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
