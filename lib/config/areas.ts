import type { AreaConfig } from "@/types/area";

export const areaConfigs: AreaConfig[] = [
  {
    areaNm: "올림픽공원",
    displayName: "Olympic Park",
    center: {
      lat: 37.51940809870298,
      lng: 127.1224106503952,
    },
    defaultZoom: 4,
    mainSpot: {
      id: "olympic-handball-gymnasium",
      name: "Olympic Park Handball Gymnasium",
      lat: 37.519891,
      lng: 127.126554,
    },
    gates: [
      {
        id: "east-gate",
        name: "East Entrance",
        lat: 37.52004,
        lng: 127.13077,
        radiusM: 180,
        baseWeight: 0.34,
        description: "Closest entrance to Olympic Park Station and the arena cluster.",
        directionHint: "Subway-heavy access from Olympic Park Station.",
      },
      {
        id: "west-gate",
        name: "West Entrance",
        lat: 37.52056,
        lng: 127.11481,
        radiusM: 170,
        baseWeight: 0.22,
        description: "Access from Mongchontoseong Station and Olympic-ro west side.",
        directionHint: "Pedestrian access from west-side transit.",
      },
      {
        id: "south-gate",
        name: "South Entrance",
        lat: 37.51671,
        lng: 127.12128,
        radiusM: 170,
        baseWeight: 0.26,
        description: "Access from Hanseong Baekje Station and Wiryeseong-daero.",
        directionHint: "Mixed subway, bus, and taxi access.",
      },
      {
        id: "north-gate",
        name: "North Entrance",
        lat: 37.52519,
        lng: 127.1238,
        radiusM: 160,
        baseWeight: 0.18,
        description: "Lower-base access from the north residential edge of the park.",
        directionHint: "Lower default flow unless road or parking signals rise.",
      },
    ],
    transitAnchors: [
      {
        id: "olympic-park-station",
        type: "subway",
        name: "Olympic Park Station",
        lat: 37.516402,
        lng: 127.130639,
        influenceWeight: 0.16,
      },
      {
        id: "hanseong-baekje-station",
        type: "subway",
        name: "Hanseong Baekje Station",
        lat: 37.516245,
        lng: 127.116743,
        influenceWeight: 0.12,
      },
      {
        id: "mongchontoseong-station",
        type: "subway",
        name: "Mongchontoseong Station",
        lat: 37.517409,
        lng: 127.112359,
        influenceWeight: 0.11,
      },
      {
        id: "olympic-park-bus-stop",
        type: "bus",
        name: "Olympic Park bus stops",
        lat: 37.519432,
        lng: 127.123671,
        influenceWeight: 0.07,
      },
    ],
    roadAnchors: [
      {
        id: "olympic-ro",
        name: "Olympic-ro",
        lat: 37.51765,
        lng: 127.11817,
        influenceWeight: 0.1,
      },
      {
        id: "wiryeseong-daero",
        name: "Wiryeseong-daero",
        lat: 37.51612,
        lng: 127.12438,
        influenceWeight: 0.1,
      },
      {
        id: "gangdong-daero",
        name: "Gangdong-daero",
        lat: 37.52443,
        lng: 127.13012,
        influenceWeight: 0.08,
      },
    ],
    parkingAnchors: [
      {
        id: "olympic-park-parking",
        name: "Olympic Park Parking Lot",
        lat: 37.521497,
        lng: 127.126003,
        influenceWeight: 0.08,
      },
      {
        id: "handball-gymnasium-parking",
        name: "Handball Gymnasium nearby parking lot",
        lat: 37.520145,
        lng: 127.127452,
        influenceWeight: 0.09,
      },
    ],
  },
  {
    areaNm: "광화문·덕수궁",
    displayName: "Gwanghwamun and Deoksugung",
    center: { lat: 37.572892, lng: 126.97691 },
    defaultZoom: 5,
    mainSpot: {
      id: "gwanghwamun-square",
      name: "Gwanghwamun Square",
      lat: 37.572892,
      lng: 126.97691,
    },
    gates: [
      { id: "north", name: "North Access", lat: 37.575817, lng: 126.97682, radiusM: 180, baseWeight: 0.25 },
      { id: "south", name: "South Access", lat: 37.569458, lng: 126.976945, radiusM: 180, baseWeight: 0.25 },
      { id: "east", name: "East Access", lat: 37.572362, lng: 126.98123, radiusM: 170, baseWeight: 0.25 },
      { id: "west", name: "West Access", lat: 37.57201, lng: 126.97303, radiusM: 170, baseWeight: 0.25 },
    ],
    transitAnchors: [
      {
        id: "gwanghwamun-station",
        type: "subway",
        name: "Gwanghwamun Station",
        lat: 37.571607,
        lng: 126.976602,
        influenceWeight: 0.14,
      },
      {
        id: "cityhall-station",
        type: "subway",
        name: "City Hall Station",
        lat: 37.565704,
        lng: 126.977088,
        influenceWeight: 0.12,
      },
    ],
    roadAnchors: [
      { id: "sejong-daero", name: "Sejong-daero", lat: 37.570856, lng: 126.976788, influenceWeight: 0.12 },
    ],
    parkingAnchors: [
      { id: "sejong-parking", name: "Sejong-ro public parking", lat: 37.573517, lng: 126.976405, influenceWeight: 0.06 },
    ],
  },
  {
    areaNm: "시청",
    displayName: "City Hall",
    center: { lat: 37.566295, lng: 126.977945 },
    defaultZoom: 5,
    mainSpot: {
      id: "seoul-city-hall",
      name: "Seoul City Hall",
      lat: 37.566295,
      lng: 126.977945,
    },
    gates: [
      { id: "plaza-north", name: "Plaza North", lat: 37.56695, lng: 126.9781, radiusM: 150, baseWeight: 0.28 },
      { id: "plaza-south", name: "Plaza South", lat: 37.564973, lng: 126.977711, radiusM: 150, baseWeight: 0.25 },
      { id: "euljiro", name: "Euljiro Access", lat: 37.566202, lng: 126.98209, radiusM: 150, baseWeight: 0.23 },
      { id: "deoksugung", name: "Deoksugung Access", lat: 37.565804, lng: 126.974738, radiusM: 150, baseWeight: 0.24 },
    ],
    transitAnchors: [
      {
        id: "city-hall-station",
        type: "subway",
        name: "City Hall Station",
        lat: 37.565704,
        lng: 126.977088,
        influenceWeight: 0.16,
      },
      {
        id: "euljiro-1ga",
        type: "subway",
        name: "Euljiro 1-ga Station",
        lat: 37.566017,
        lng: 126.982618,
        influenceWeight: 0.1,
      },
    ],
    roadAnchors: [
      { id: "sejong-daero", name: "Sejong-daero", lat: 37.565155, lng: 126.9772, influenceWeight: 0.12 },
    ],
    parkingAnchors: [
      { id: "cityhall-parking", name: "City Hall parking", lat: 37.56664, lng: 126.97795, influenceWeight: 0.07 },
    ],
  },
  {
    areaNm: "여의도",
    displayName: "Yeouido",
    center: { lat: 37.526394, lng: 126.925931 },
    defaultZoom: 5,
    mainSpot: {
      id: "yeouido-park",
      name: "Yeouido Park",
      lat: 37.526394,
      lng: 126.925931,
    },
    gates: [
      { id: "park-north", name: "Park North", lat: 37.529867, lng: 126.925163, radiusM: 190, baseWeight: 0.24 },
      { id: "park-south", name: "Park South", lat: 37.522756, lng: 126.925012, radiusM: 190, baseWeight: 0.23 },
      {
        id: "station",
        name: "Yeouido Station Access",
        lat: 37.521624,
        lng: 126.924191,
        radiusM: 190,
        baseWeight: 0.29,
      },
      { id: "han-river", name: "Han River Access", lat: 37.531713, lng: 126.933065, radiusM: 190, baseWeight: 0.24 },
    ],
    transitAnchors: [
      {
        id: "yeouido-station",
        type: "subway",
        name: "Yeouido Station",
        lat: 37.521624,
        lng: 126.924191,
        influenceWeight: 0.16,
      },
      {
        id: "national-assembly-station",
        type: "subway",
        name: "National Assembly Station",
        lat: 37.528086,
        lng: 126.917876,
        influenceWeight: 0.11,
      },
    ],
    roadAnchors: [
      { id: "uisa-daero", name: "Uisadang-daero", lat: 37.526764, lng: 126.918808, influenceWeight: 0.1 },
      { id: "yeoui-daero", name: "Yeoui-daero", lat: 37.525235, lng: 126.92504, influenceWeight: 0.12 },
    ],
    parkingAnchors: [
      { id: "yeouido-park-parking", name: "Yeouido Park parking", lat: 37.52548, lng: 126.922374, influenceWeight: 0.08 },
    ],
  },
  {
    areaNm: "잠실종합운동장",
    displayName: "Jamsil Sports Complex",
    center: { lat: 37.515275, lng: 127.07304 },
    defaultZoom: 5,
    mainSpot: {
      id: "jamsil-olympic-stadium",
      name: "Jamsil Olympic Stadium",
      lat: 37.515275,
      lng: 127.07304,
    },
    gates: [
      { id: "north", name: "North Gate", lat: 37.518912, lng: 127.073157, radiusM: 180, baseWeight: 0.24 },
      { id: "south", name: "South Gate", lat: 37.511822, lng: 127.073648, radiusM: 180, baseWeight: 0.2 },
      {
        id: "sports-complex-station",
        name: "Sports Complex Station Access",
        lat: 37.511134,
        lng: 127.073998,
        radiusM: 190,
        baseWeight: 0.34,
      },
      { id: "east", name: "East Gate", lat: 37.515672, lng: 127.078674, radiusM: 180, baseWeight: 0.22 },
    ],
    transitAnchors: [
      {
        id: "sports-complex-station",
        type: "subway",
        name: "Sports Complex Station",
        lat: 37.511134,
        lng: 127.073998,
        influenceWeight: 0.18,
      },
      {
        id: "samseong-station",
        type: "subway",
        name: "Samseong Station",
        lat: 37.508844,
        lng: 127.06316,
        influenceWeight: 0.08,
      },
    ],
    roadAnchors: [
      { id: "olympic-ro", name: "Olympic-ro", lat: 37.512871, lng: 127.075337, influenceWeight: 0.12 },
      { id: "teheran-ro", name: "Teheran-ro", lat: 37.506851, lng: 127.065156, influenceWeight: 0.08 },
    ],
    parkingAnchors: [
      { id: "jamsil-complex-parking", name: "Sports complex parking", lat: 37.516486, lng: 127.076756, influenceWeight: 0.1 },
    ],
  },
  {
    areaNm: "서울역",
    displayName: "Seoul Station",
    center: { lat: 37.554678, lng: 126.970606 },
    defaultZoom: 5,
    mainSpot: {
      id: "seoul-station-main",
      name: "Seoul Station",
      lat: 37.554678,
      lng: 126.970606,
    },
    gates: [
      { id: "east", name: "East Exit Area", lat: 37.554841, lng: 126.972518, radiusM: 160, baseWeight: 0.32 },
      { id: "west", name: "West Exit Area", lat: 37.554086, lng: 126.967403, radiusM: 160, baseWeight: 0.25 },
      { id: "north", name: "North Transfer Area", lat: 37.557001, lng: 126.970811, radiusM: 160, baseWeight: 0.24 },
      { id: "south", name: "South Transfer Area", lat: 37.552128, lng: 126.970441, radiusM: 160, baseWeight: 0.19 },
    ],
    transitAnchors: [
      {
        id: "seoul-station-subway",
        type: "subway",
        name: "Seoul Station",
        lat: 37.554678,
        lng: 126.970606,
        influenceWeight: 0.18,
      },
      {
        id: "seoul-station-bus-transfer",
        type: "bus",
        name: "Seoul Station bus transfer center",
        lat: 37.555188,
        lng: 126.972429,
        influenceWeight: 0.12,
      },
    ],
    roadAnchors: [
      { id: "hangang-daero", name: "Hangang-daero", lat: 37.552967, lng: 126.971021, influenceWeight: 0.1 },
      { id: "toegye-ro", name: "Toegye-ro", lat: 37.555947, lng: 126.97375, influenceWeight: 0.1 },
    ],
    parkingAnchors: [
      { id: "seoul-station-parking", name: "Seoul Station parking", lat: 37.553417, lng: 126.968487, influenceWeight: 0.08 },
    ],
  },
];

export const defaultAreaNm = "올림픽공원";

export function getAreaConfig(areaNm: string): AreaConfig | undefined {
  return areaConfigs.find((area) => area.areaNm === areaNm);
}

export function getDefaultAreaConfig(): AreaConfig {
  return areaConfigs[0];
}
