import type { GateType } from "./area";
import type { ConfidenceLevel, NormalizedCongestionLevel } from "./seoul";

export type GateEstimate = {
  gateId: string;
  gateNo?: string;
  gateName: string;
  gateType?: GateType;
  lat: number;
  lng: number;
  estimatedMin: number;
  estimatedMax: number;
  estimatedMid: number;
  weight: number;
  congestionLevel: NormalizedCongestionLevel;
  confidence: ConfidenceLevel;
  reasons: string[];
  isEstimated: true;
};
