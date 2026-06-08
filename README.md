# SeeWe

SeeWe is a Next.js App Router MVP for a map-based, real-time crowd density and traffic dashboard using Seoul public data APIs. The initial target is Olympic Park, with a focus on the Olympic Park Handball Gymnasium area.

The dashboard shows estimated surrounding population, estimated distribution by entrance, traffic, incident/control, subway, bus, parking, and forecast information. Entrance-level values are always estimates, not measured counts.

## Public APIs Used

- Seoul real-time population API: `citydata_ppltn`
- Seoul real-time city data API: `citydata`
- Seoul Open Data official dataset: https://data.seoul.go.kr/dataList/OA-21285/F/1/datasetView.do
- Seoul real-time city data manual: https://data.seoul.go.kr/SeoulRtd/downloads/%EC%8B%A4%EC%8B%9C%EA%B0%84_%EB%8F%84%EC%8B%9C%EB%8D%B0%EC%9D%B4%ED%84%B0_%EB%A7%A4%EB%89%B4%EC%96%BC.pdf

The app does not call non-public Seoul map internals. The official manual describes 50m grid allocation as part of the source data estimation process, but the implemented app only uses documented public API responses. If an officially permitted public JSON heatmap/grid endpoint is later confirmed, it can be added to improve entrance estimates. Image tiles, if present, should only be used for visualization and not numerical estimation.

## Environment Variables

Create `.env` in the project root:

```bash
SEOUL_OPEN_API_KEY=your_seoul_open_api_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_javascript_map_key
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.gle/yhT166DZaKZsrxi37
```

`SEOUL_OPEN_API_KEY` is used only by server Route Handlers and is never exposed to the browser. `NEXT_PUBLIC_KAKAO_MAP_KEY` is optional for local development; without it, the dashboard renders a schematic fallback map.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000/dashboard.

Production verification:

```bash
npm run lint
npm run build
```

On Windows PowerShell with script execution blocked, use `npm.cmd run lint` and `npm.cmd run build`.

## Routes

- `/dashboard`: live dashboard with area selector, map, summary, entrance cards, charts, traffic, transit, parking, and refresh status.
- `/settings/areas`: area configuration overview for adding future Seoul hotspots.
- `/api/seoul/population?areaNm=올림픽공원`: server proxy for `citydata_ppltn`.
- `/api/seoul/citydata?areaNm=올림픽공원`: server proxy for `citydata`.
- `/api/estimate/gates?areaNm=올림픽공원`: server-side entrance estimate calculation.

## Refresh Behavior

The client checks for the latest available data every 10 seconds with TanStack Query:

- `refetchInterval: 10000`
- `refetchIntervalInBackground: false`
- `staleTime: 0`
- `retry: 2`

Manual refresh uses the same `refetchAll()` logic as automatic refresh and does not reload the page. The UI displays last app refresh time, Seoul source timestamp, next refresh countdown, refresh button state, replacement data status, source-waiting status, and delayed reception errors while keeping previous successful data.

Seoul source data may update more slowly than the app checks. The UI wording is therefore: "Checking for the latest available data every 10 seconds."

Server API responses use a 10-second in-memory cache per `areaNm` and `Cache-Control: public, s-maxage=10, stale-while-revalidate=10`.

## Entrance Estimate Method

1. Read the total surrounding population range from Seoul population data.
2. Start with each configured entrance `baseWeight`.
3. Normalize weights so the total is 1.
4. Adjust entrance weights using nearby transit anchors, parking anchors, road congestion, and incident/control signals.
5. Normalize final weights again.
6. Calculate `estimatedMin`, `estimatedMax`, and `estimatedMid` from the total area population range.
7. Estimate entrance congestion from relative density and area congestion.
8. Attach confidence: high, medium, or low based on source freshness, replacement data, and availability of traffic/transit/parking data.

Every entrance value is displayed as an estimated range with a confidence label.

## Privacy And Ethics

- This service is a reference tool for surrounding crowd density based on Seoul public data.
- Entrance-level population is not an actual measured value. It is an estimate based on population, traffic, and location data.
- This service does not identify or track protest participants, specific group sizes, or individual locations.
- For safety decisions on site, follow official guidance from police, local government, and facility managers.
- Even though the app checks for updates every 10 seconds, displayed values may not change immediately depending on the Seoul source data update interval.

## Add New Areas

Add entries in `lib/config/areas.ts`:

- `areaNm`: official Seoul `AREA_NM`
- `displayName`
- `center`
- `defaultZoom`
- `mainSpot`
- `gates`
- `transitAnchors`
- `roadAnchors`
- `parkingAnchors`

Configured expansion examples include `광화문·덕수궁`, `시청`, `여의도`, `잠실종합운동장`, and `서울역`.
