/**
 * 부족한 오행 → 스튜디오 "위치" 매칭 (수·목).
 * - 수(水) 부족: 한강·호수 근처 스튜디오
 * - 목(木) 부족: 큰 공원·숲 근처 스튜디오
 * 좌표는 대략값(수백 m 오차)이라 거리 기준을 넉넉하게 잡았습니다. 튜닝은 여기서.
 * + 서울 구별 오행 (화·토·금까지 5개 전부). 참고: @taebaek_saju 서울 오행 지도 (threads)
 *   두 색으로 칠해진 구는 두 오행 모두로 봅니다.
 * 점수 = 구 오행 일치(1) + 한강·호수·공원 근처(1). 점수 높은 스튜디오를 먼저 추천.
 */

import type { Ohaeng } from "../saju/constants";

type Pt = [number, number]; // [lat, lng]

/** 한강 중심선 (행주대교 → 강동대교, 다리 위치 기준 대략값) */
const HAN_RIVER: Pt[] = [
  [37.598, 126.81], // 행주대교
  [37.5705, 126.8634], // 가양대교
  [37.553, 126.896], // 성산대교·망원
  [37.541, 126.905], // 양화대교
  [37.5385, 126.926], // 서강대교
  [37.533, 126.94], // 마포대교
  [37.527, 126.948], // 원효대교
  [37.5175, 126.958], // 한강대교·노들섬
  [37.5115, 126.98], // 동작대교
  [37.514, 126.996], // 반포대교
  [37.527, 127.013], // 한남대교
  [37.5345, 127.0215], // 동호대교
  [37.537, 127.035], // 성수대교
  [37.534, 127.058], // 영동대교
  [37.5285, 127.067], // 청담대교
  [37.524, 127.093], // 잠실대교
  [37.5335, 127.103], // 올림픽대교
  [37.542, 127.117], // 천호대교
  [37.565, 127.154], // 강동대교
];

/** 한강 말고 물 기운 포인트 (호수·하천) */
const WATER_SPOTS: { name: string; at: Pt }[] = [
  { name: "석촌호수", at: [37.5097, 127.103] },
  { name: "양재천", at: [37.484, 127.048] },
  { name: "청계천", at: [37.569, 126.99] },
  { name: "탄천", at: [37.366, 127.108] },
  { name: "선유도", at: [37.5434, 126.8996] },
];

/** 나무 기운 포인트 (큰 공원·숲) */
const PARKS: { name: string; at: Pt }[] = [
  { name: "서울숲", at: [37.5444, 127.0374] },
  { name: "올림픽공원", at: [37.5206, 127.1214] },
  { name: "남산", at: [37.5512, 126.9882] },
  { name: "여의도공원", at: [37.5257, 126.9227] },
  { name: "월드컵공원", at: [37.5683, 126.8858] },
  { name: "보라매공원", at: [37.4925, 126.9196] },
  { name: "어린이대공원", at: [37.5481, 127.0811] },
  { name: "양재시민의숲", at: [37.4697, 127.0367] },
  { name: "경의선숲길", at: [37.56, 126.923] },
  { name: "북서울꿈의숲", at: [37.6205, 127.0405] },
  { name: "낙산공원", at: [37.5806, 127.0074] },
  { name: "용산가족공원", at: [37.5222, 126.9817] },
  { name: "분당중앙공원", at: [37.3685, 127.1186] },
  { name: "율동공원", at: [37.3796, 127.1517] },
];

/** 서울 구별 오행 (키: "구" 뺀 이름 — 오붓 API region 값과 맞춤. 중구만 "중") */
export const DISTRICT_OHAENG: Record<string, Ohaeng[]> = {
  노원: ["목"], 동대문: ["목"], 성동: ["목"], 강동: ["목"], 서초: ["목"], 금천: ["목"],
  은평: ["화"], 양천: ["화"],
  도봉: ["토"], 중: ["토"], 용산: ["토"], 관악: ["토"],
  종로: ["금"], 서대문: ["금"], 강서: ["금"], 구로: ["금"], 동작: ["금"],
  강북: ["수"], 성북: ["수"], 영등포: ["수"],
  강남: ["화", "토"],
  송파: ["목", "토"],
  마포: ["목", "수"],
  중랑: ["토", "수"],
  광진: ["토", "수"],
};

/** 구 중심 위치 (대략) — 오붓 region 이 "성동/광진"처럼 묶여 올 때 실제 구를 고르는 데 사용 */
const DISTRICT_CENTER: Record<string, Pt> = {
  강남: [37.5172, 127.0473], 강동: [37.5301, 127.1238], 강북: [37.6396, 127.0257],
  강서: [37.551, 126.8495], 관악: [37.4784, 126.9516], 광진: [37.5469, 127.0857],
  구로: [37.4954, 126.8874], 금천: [37.4569, 126.8955], 노원: [37.6542, 127.0568],
  도봉: [37.6688, 127.0471], 동대문: [37.5744, 127.04], 동작: [37.5124, 126.9393],
  마포: [37.5663, 126.9019], 서대문: [37.5791, 126.9368], 서초: [37.4837, 127.0324],
  성동: [37.551, 127.041], 성북: [37.5894, 127.0167], 송파: [37.5145, 127.1059],
  양천: [37.517, 126.8665], 영등포: [37.5264, 126.8962], 용산: [37.5326, 126.9905],
  은평: [37.6027, 126.9291], 종로: [37.5735, 126.979], 중: [37.5641, 126.9979],
  중랑: [37.6066, 127.0927],
};

/** region 문자열("성동/광진")과 좌표로 실제 구 하나를 고름 */
function pickDistrict(region: string, lat: number, lng: number): string {
  const parts = region.split("/").map(normalizeDistrict).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  let best = parts[0];
  let bestD = Infinity;
  for (const name of parts) {
    const c = DISTRICT_CENTER[name];
    if (!c) continue;
    const dd = dist([lat, lng], c);
    if (dd < bestD) {
      bestD = dd;
      best = name;
    }
  }
  return best;
}

/** 오행별 해당 구 목록 (안내 문구용) */
export function districtsOf(o: Ohaeng): string[] {
  return Object.entries(DISTRICT_OHAENG)
    .filter(([, os]) => os.includes(o))
    .map(([d]) => (d === "중" ? "중구" : d));
}

function normalizeDistrict(region: string): string {
  const r = region.trim().replace(/\s+/g, "");
  if (r === "중구" || r === "중") return "중";
  return r.replace(/구$/, "");
}

const RIVER_M = 1000; // 한강에서 이 거리 안
const SPOT_M = 800; // 호수·하천·공원에서 이 거리 안

/** 두 점 사이 거리(m) — 짧은 거리라 등장방형 근사 */
function toXY([lat, lng]: Pt, lat0: number): [number, number] {
  const R = 6371000;
  return [
    ((lng * Math.PI) / 180) * R * Math.cos((lat0 * Math.PI) / 180),
    ((lat * Math.PI) / 180) * R,
  ];
}
function dist(a: Pt, b: Pt): number {
  const [ax, ay] = toXY(a, a[0]);
  const [bx, by] = toXY(b, a[0]);
  return Math.hypot(ax - bx, ay - by);
}
function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const [px, py] = toXY(p, p[0]);
  const [ax, ay] = toXY(a, p[0]);
  const [bx, by] = toXY(b, p[0]);
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function roundM(m: number): string {
  return m < 950 ? `${Math.max(100, Math.round(m / 100) * 100)}m` : `${(m / 1000).toFixed(1)}km`;
}

export type OhaengMatch = { ohaeng: Ohaeng; reason: string; meters: number };

/** 스튜디오 위치가 부족한 오행(수·목)을 채워주는지 판별. 가장 가까운 근거 하나를 돌려줌 */
export function matchOhaengPlace(
  lat: number,
  lng: number,
  targets: Ohaeng[],
): OhaengMatch | null {
  const p: Pt = [lat, lng];
  const found: OhaengMatch[] = [];

  if (targets.includes("수")) {
    let river = Infinity;
    for (let i = 0; i < HAN_RIVER.length - 1; i++) {
      river = Math.min(river, distToSegment(p, HAN_RIVER[i], HAN_RIVER[i + 1]));
    }
    if (river <= RIVER_M) {
      found.push({ ohaeng: "수", meters: river, reason: `한강에서 ${roundM(river)} · 물 기운을 채워줘요` });
    }
    for (const w of WATER_SPOTS) {
      const d = dist(p, w.at);
      if (d <= SPOT_M) {
        found.push({ ohaeng: "수", meters: d, reason: `${w.name}에서 ${roundM(d)} · 물 기운을 채워줘요` });
      }
    }
  }

  if (targets.includes("목")) {
    for (const park of PARKS) {
      const d = dist(p, park.at);
      if (d <= SPOT_M) {
        found.push({ ohaeng: "목", meters: d, reason: `${park.name}에서 ${roundM(d)} · 나무 기운을 채워줘요` });
      }
    }
  }

  if (found.length === 0) return null;
  return found.sort((a, b) => a.meters - b.meters)[0];
}

const OHAENG_WORD: Record<Ohaeng, string> = { 목: "나무", 화: "불", 토: "흙", 금: "쇠", 수: "물" };

/**
 * 스튜디오 점수 매기기: 구 오행 일치 + 위치(한강·공원) 근처.
 * reason 은 구체적인 위치 근거를 우선, 없으면 구 근거.
 */
export function scoreStudio(
  lat: number,
  lng: number,
  region: string,
  targets: Ohaeng[],
): { score: number; reason: string | null } {
  if (targets.length === 0) return { score: 0, reason: null };
  const place = matchOhaengPlace(lat, lng, targets);
  // 오붓 region 은 "성동/광진", "종로/중구" 처럼 묶여 오기도 함 → 좌표로 실제 구 선택
  const d = pickDistrict(region, lat, lng);
  const districtHit = (DISTRICT_OHAENG[d] ?? []).find((o) => targets.includes(o));
  const score = (place ? 1 : 0) + (districtHit ? 1 : 0);
  const districtName = d === "중" ? "중구" : `${d}구`;
  const reason = place
    ? place.reason
    : districtHit
      ? `${OHAENG_WORD[districtHit]} 기운의 동네 ${districtName} · ${districtHit}(${OHAENG_WORD[districtHit]}) 기운을 채워줘요`
      : null;
  return { score, reason };
}
