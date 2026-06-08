"use client";

import { create } from "zustand";

export type MapLayerKey =
  | "population"
  | "entrances"
  | "roadTraffic"
  | "incidents"
  | "publicTransit"
  | "parking";

type MapLayerState = {
  layers: Record<MapLayerKey, boolean>;
  toggleLayer: (layer: MapLayerKey) => void;
};

export const useMapLayers = create<MapLayerState>((set) => ({
  layers: {
    population: true,
    entrances: true,
    roadTraffic: true,
    incidents: true,
    publicTransit: true,
    parking: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
}));
