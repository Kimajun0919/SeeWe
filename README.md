# SeeWe

SeeWe는 서울시 공개 데이터를 기반으로 주변 혼잡도와 교통 상황을 지도에서 확인하는 Next.js App Router 기반 MVP입니다. 초기 대상지는 올림픽공원이며, 특히 올림픽공원 핸드볼경기장 주변을 중심으로 구성했습니다.

대시보드는 주변 추정 인구, 출입구별 추정 분포, 도로 교통, 사고/통제, 지하철, 버스, 주차, 12시간 예측 정보를 표시합니다. 출입구별 값은 실제 측정값이 아니라 항상 추정값입니다.

## 사용하는 공개 API

- 서울 실시간 인구 데이터 API: `citydata_ppltn`
- 서울 실시간 도시데이터 API: `citydata`
- 서울 열린데이터광장 공식 데이터셋: https://data.seoul.go.kr/dataList/OA-21285/F/1/datasetView.do
- 서울 실시간 도시데이터 매뉴얼: https://data.seoul.go.kr/SeoulRtd/downloads/%EC%8B%A4%EC%8B%9C%EA%B0%84_%EB%8F%84%EC%8B%9C%EB%8D%B0%EC%9D%B4%ED%84%B0_%EB%A7%A4%EB%89%B4%EC%96%BC.pdf

이 앱은 서울시 실시간 도시데이터 지도 내부 API처럼 공식 사용 허가가 확인되지 않은 엔드포인트를 호출하지 않습니다. 공식 매뉴얼에는 50m 격자 배분이 원천 데이터 추정 과정의 일부로 설명되어 있지만, 현재 구현은 문서화된 공개 API 응답만 사용합니다. 향후 공식적으로 허용된 공개 JSON 기반 heatmap/grid 데이터가 확인되면 출입구별 추정 정확도 개선에 사용할 수 있습니다. 이미지 타일 형태의 heatmap은 시각화에는 사용할 수 있지만 수치 추정에는 사용하지 않아야 합니다.

## 환경변수

로컬 개발용 `.env`를 프로젝트 루트에 만듭니다. `.env.example`을 템플릿으로 사용하세요.

```bash
SEOUL_OPEN_API_KEY=your_seoul_open_api_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_javascript_map_key
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.gle/yhT166DZaKZsrxi37
```

`SEOUL_OPEN_API_KEY`는 서버 Route Handler에서만 사용하며 브라우저에 노출하지 않습니다. `NEXT_PUBLIC_KAKAO_MAP_KEY`는 로컬 개발에서는 선택값입니다. 키가 없으면 대시보드는 간이 지도를 표시합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000/dashboard 를 엽니다.

배포 전 검증:

```bash
npm run lint
npm run build
```

Windows PowerShell에서 스크립트 실행이 막힌 경우에는 `npm.cmd run lint`, `npm.cmd run build`를 사용하세요.

## Vercel 배포

Vercel은 이 Next.js App Router 프로젝트의 권장 배포 대상입니다. Next.js를 자동 감지하고 기본적으로 의존성을 설치한 뒤 `npm run build`를 실행합니다.

1. 저장소를 GitHub, GitLab, Bitbucket 중 하나에 push합니다.
2. Vercel에서 새 프로젝트를 만들고 저장소를 가져옵니다.
3. Framework Preset은 `Next.js`로 둡니다.
4. Project Settings -> Environment Variables에 Production과 Preview 환경변수를 추가합니다.

```bash
SEOUL_OPEN_API_KEY=your_seoul_open_api_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_javascript_map_key
NEXT_PUBLIC_FEEDBACK_FORM_URL=https://forms.gle/yhT166DZaKZsrxi37
```

5. 배포합니다. 루트 경로 `/`는 `/dashboard`로 이동합니다.

CLI 배포도 가능합니다.

```bash
npm i -g vercel
vercel
vercel --prod
```

로컬 `.env` 파일이 Vercel에 자동 업로드된다고 가정하지 마세요. Vercel 배포 환경변수는 프로젝트 설정에서 관리해야 합니다.

## 주요 경로

- `/dashboard`: 권역 선택, 지도, 요약, 출입구 카드, 차트, 교통, 대중교통, 주차, 새로고침 상태를 표시하는 대시보드
- `/settings/areas`: 새 서울 주요 권역을 추가하기 위한 설정 구조 확인 화면
- `/api/seoul/population?areaNm=올림픽공원`: `citydata_ppltn` 서버 프록시
- `/api/seoul/citydata?areaNm=올림픽공원`: `citydata` 서버 프록시
- `/api/estimate/gates?areaNm=올림픽공원`: 출입구별 추정 계산 API

## 새로고침 방식

클라이언트는 TanStack Query로 10초마다 최신 데이터를 확인합니다.

- `refetchInterval: 10000`
- `refetchIntervalInBackground: false`
- `staleTime: 0`
- `retry: 2`

수동 새로고침은 자동 새로고침과 같은 `refetchAll()` 로직을 사용하며 페이지 전체를 다시 로드하지 않습니다. UI에는 앱 새로고침 시각, 서울 원천 시각, 다음 자동 확인까지 남은 시간, 새로고침 버튼 상태, 대체 데이터 상태, 원천 데이터 갱신 대기 상태, 데이터 수신 지연 상태를 표시합니다. 오류가 발생해도 가능한 경우 마지막으로 성공한 데이터를 유지합니다.

서울 원천 데이터는 앱의 10초 확인 주기보다 더 느리게 갱신될 수 있습니다. 따라서 UI 문구는 “10초마다 서울시 최신 공개 데이터를 확인합니다.”로 표현합니다.

서버 API 응답은 같은 `areaNm`에 대해 10초 인메모리 캐시를 적용하고 `Cache-Control: public, s-maxage=10, stale-while-revalidate=10` 헤더를 사용합니다.

## 출입구별 추정 방식

1. 서울 인구 데이터에서 권역 전체 주변 인구 범위를 읽습니다.
2. 각 출입구의 `baseWeight`를 기준 가중치로 사용합니다.
3. 가중치 합이 1이 되도록 정규화합니다.
4. 가까운 지하철/버스 기준점, 주차장 기준점, 도로 혼잡, 사고/통제 신호를 반영해 가중치를 조정합니다.
5. 최종 가중치를 다시 정규화합니다.
6. 전체 권역 인구 범위에 가중치를 곱해 `estimatedMin`, `estimatedMax`, `estimatedMid`를 계산합니다.
7. 반경 면적 기반 상대 밀도와 권역 혼잡도를 함께 반영해 출입구 혼잡도를 추정합니다.
8. 원천 데이터 신선도, 대체 데이터 여부, 교통/대중교통/주차 데이터 가용성으로 신뢰도를 계산합니다.

출입구별 값은 항상 추정 범위와 신뢰도를 함께 표시합니다.

## 개인정보와 윤리 원칙

- 이 서비스는 서울시 공개 데이터 기반 주변 혼잡도 참고 도구입니다.
- 출입구별 인구는 실제 측정값이 아닙니다. 전체 권역 인구, 교통, 위치 데이터를 바탕으로 계산한 추정값입니다.
- 이 서비스는 개인 위치, 특정 단체, 집회 참여자 수를 식별하거나 추적하지 않습니다.
- 현장 안전 판단은 경찰, 지자체, 시설 관리자 등 공식 안내를 우선해 주세요.
- 앱은 10초마다 최신 데이터를 확인하지만, 서울시 원천 데이터 갱신 주기에 따라 표시값이 즉시 바뀌지 않을 수 있습니다.

## 새 권역 추가

`lib/config/areas.ts`에 다음 항목을 추가합니다.

- `areaNm`: 서울시가 공식 지원하는 `AREA_NM`
- `displayName`
- `center`
- `defaultZoom`
- `mainSpot`
- `gates`
- `transitAnchors`
- `roadAnchors`
- `parkingAnchors`

현재 확장 예시로 `광화문·덕수궁`, `시청`, `여의도`, `잠실종합운동장`, `서울역`이 설정되어 있습니다.
