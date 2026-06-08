export type GateEstimate = {
  gateId: string;
  gateName: string;
  lat: number;
  lng: number;
  estimatedMin: number;
  estimatedMax: number;
  estimatedMid: number;
  weight: number;
  congestionLevel: "여유" | "보통" | "약간 붐빔" | "붐빔" | "정보없음";
  confidence: "높음" | "보통" | "낮음";
  reasons: string[];
  isEstimated: true;
};
