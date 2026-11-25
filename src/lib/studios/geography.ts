/**
 * 모식 지도용 지형 데이터 — 실제 lat/lng 로 정의한 하천·해안·공원.
 *
 * 핵심: 지형과 스튜디오 핀을 "같은 투영"(project)으로 찍기 때문에,
 * 선택한 지역을 중심으로 뷰포트를 잡으면 그 동네의 실제 지형만 드러납니다.
 * (강 근처 스튜디오는 그려진 강 근처에, 강이 없는 지역이면 강은 화면 밖으로 잘림)
 * 네이버 지도 키가 없을 때의 폴백이므로 정밀 지형이 아니라 느낌만 전달합니다.
 */

export type LngLat = { lat: number; lng: number };
export type Park = LngLat & { r: number };
/** 한 지역 뷰포트에서 보여줄 지형 세트 */
export type Scene = { water: LngLat[][]; parks: Park[] };

/* 뷰포트 반경(도). 스튜디오 검색 박스(≈4~5km)보다 살짝 넓게 잡아 여백을 둡니다. */
export const HALF_LAT = 0.05;
export const HALF_LNG = 0.062;

/** center 를 화면 가운데로 두고 좌표를 패널 내부 %(0~100) 로 투영 (북쪽이 위) */
export function project(center: LngLat, p: LngLat): { x: number; y: number } {
  return {
    x: 50 + ((p.lng - center.lng) / HALF_LNG) * 50,
    y: 50 - ((p.lat - center.lat) / HALF_LAT) * 50,
  };
}

/* ── 서울·수도권 ───────────────────────────────────────────── */
// 한강 (서→동으로 가로지르는 본류)
const HAN: LngLat[] = [
  { lat: 37.603, lng: 126.822 },
  { lat: 37.582, lng: 126.862 },
  { lat: 37.56, lng: 126.888 },
  { lat: 37.54, lng: 126.905 },
  { lat: 37.528, lng: 126.925 },
  { lat: 37.52, lng: 126.95 },
  { lat: 37.514, lng: 126.982 },
  { lat: 37.515, lng: 127.008 },
  { lat: 37.524, lng: 127.028 },
  { lat: 37.531, lng: 127.052 },
  { lat: 37.532, lng: 127.075 },
  { lat: 37.52, lng: 127.092 },
  { lat: 37.536, lng: 127.112 },
  { lat: 37.556, lng: 127.14 },
];
// 탄천 (한강 → 분당·판교로 내려가는 지류)
const TANCHEON: LngLat[] = [
  { lat: 37.52, lng: 127.085 },
  { lat: 37.48, lng: 127.09 },
  { lat: 37.445, lng: 127.1 },
  { lat: 37.41, lng: 127.11 },
  { lat: 37.375, lng: 127.122 },
  { lat: 37.35, lng: 127.128 },
];
const SEOUL_PARKS: Park[] = [
  { lat: 37.5265, lng: 126.9245, r: 0.004 }, // 여의도공원
  { lat: 37.5202, lng: 127.1217, r: 0.01 }, // 올림픽공원
  { lat: 37.5444, lng: 127.0374, r: 0.007 }, // 서울숲
  { lat: 37.5512, lng: 126.9882, r: 0.01 }, // 남산
  { lat: 37.5717, lng: 126.8782, r: 0.011 }, // 월드컵공원
  { lat: 37.4927, lng: 126.9195, r: 0.006 }, // 보라매공원
  { lat: 37.47, lng: 127.037, r: 0.006 }, // 양재시민의숲
  { lat: 37.3815, lng: 127.123, r: 0.006 }, // 분당중앙공원
];

/* ── 부산 (해안선) ─────────────────────────────────────────── */
const BUSAN_COAST: LngLat[] = [
  { lat: 35.045, lng: 128.966 },
  { lat: 35.072, lng: 129.016 },
  { lat: 35.078, lng: 129.044 },
  { lat: 35.096, lng: 129.038 },
  { lat: 35.12, lng: 129.085 },
  { lat: 35.153, lng: 129.118 },
  { lat: 35.16, lng: 129.16 },
  { lat: 35.178, lng: 129.2 },
];

/* ── 제주 (북부 해안선) ────────────────────────────────────── */
const JEJU_COAST: LngLat[] = [
  { lat: 33.512, lng: 126.455 },
  { lat: 33.517, lng: 126.49 },
  { lat: 33.52, lng: 126.525 },
  { lat: 33.516, lng: 126.56 },
  { lat: 33.512, lng: 126.6 },
];

type Box = { lat: [number, number]; lng: [number, number] };
const SEOUL_BOX: Box = { lat: [37.3, 37.75], lng: [126.7, 127.3] };
const BUSAN_BOX: Box = { lat: [35.0, 35.35], lng: [128.9, 129.3] };
const JEJU_BOX: Box = { lat: [33.2, 33.6], lng: [126.1, 126.95] };

function inBox(c: LngLat, b: Box): boolean {
  return (
    c.lat >= b.lat[0] && c.lat <= b.lat[1] && c.lng >= b.lng[0] && c.lng <= b.lng[1]
  );
}

/** 중심 좌표로 지형 세트를 고릅니다. 모르는 지역이면 지형 없이 핀만. */
export function sceneFor(center: LngLat): Scene {
  if (inBox(center, SEOUL_BOX)) return { water: [HAN, TANCHEON], parks: SEOUL_PARKS };
  if (inBox(center, BUSAN_BOX)) return { water: [BUSAN_COAST], parks: [] };
  if (inBox(center, JEJU_BOX)) return { water: [JEJU_COAST], parks: [] };
  return { water: [], parks: [] };
}
