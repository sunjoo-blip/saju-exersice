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

/** 핀이 놓이는 "사용 영역" (아래쪽 Y_MAX 밑은 하단 선택 카드 자리) */
export const X_MIN = 8;
export const X_MAX = 92;
export const Y_MIN = 9;
export const Y_MAX = 55;

export type Viewport = { lat: number; lng: number; halfLat: number; halfLng: number };

const PAD = 1.35; // 스튜디오 바운즈 바깥 여백 배수
const MIN_HALF_LAT = 0.006; // 너무 확대되지 않게(≈0.7km)
const MAX_HALF_LAT = 0.07; // 너무 축소되지 않게
const MIN_HALF_LNG = 0.0075;
const MAX_HALF_LNG = 0.088;
const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * 스튜디오 분포에 맞춰 뷰포트를 자동으로 맞춥니다(네이버 fitBounds 느낌).
 * - 몰려 있으면 확대해 패널을 채우고, 넓게 퍼져 있으면 축소합니다.
 * - 스튜디오가 없으면 지역 중심 기준 기본 줌.
 */
export function makeViewport(center: LngLat, pts: LngLat[]): Viewport {
  if (pts.length === 0) {
    return { lat: center.lat, lng: center.lng, halfLat: 0.05, halfLng: 0.062 };
  }
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const p of pts) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
    halfLat: clampN(((maxLat - minLat) / 2) * PAD, MIN_HALF_LAT, MAX_HALF_LAT),
    halfLng: clampN(((maxLng - minLng) / 2) * PAD, MIN_HALF_LNG, MAX_HALF_LNG),
  };
}

/** 뷰포트 → 사용 영역([X_MIN,X_MAX]×[Y_MIN,Y_MAX]) %로 투영 (북쪽이 위) */
export function project(vp: Viewport, p: LngLat): { x: number; y: number } {
  return {
    x: X_MIN + ((p.lng - (vp.lng - vp.halfLng)) / (2 * vp.halfLng)) * (X_MAX - X_MIN),
    y: Y_MAX - ((p.lat - (vp.lat - vp.halfLat)) / (2 * vp.halfLat)) * (Y_MAX - Y_MIN),
  };
}

/** 공원 블롭 지름(패널 가로 %) — 뷰포트 줌에 맞춰 커지고 작아짐 */
export function parkDiameterPct(vp: Viewport, r: number): number {
  return (r * (X_MAX - X_MIN)) / vp.halfLng;
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
