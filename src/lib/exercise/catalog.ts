/**
 * 운동 카탈로그 — 오붓 카테고리 ID, 오행/신살 → 운동 매핑 (콘텐츠 기획용 규칙).
 *
 * 추천 운동은 AI 가 고르지 않고 이 규칙으로 결정합니다. (같은 사주 → 항상 같은 추천)
 * AI 는 이미 정해진 운동에 대해 "왜 어울리는지" 문장만 씁니다.
 *
 * ⚠️ 매핑은 과학적 판정이 아닌 엔터테인먼트용 기획 규칙입니다. 튜닝은 여기서만 하면 됩니다.
 */

import type { Ohaeng } from "../saju/constants";

export const ALLOWED_EXERCISES = [
  "요가",
  "필라테스",
  "바레",
  "발레",
  "하이록스 공식",
  "크로스핏",
  "GYM",
  "싱잉볼",
  "클라이밍",
  "번지 피트니스",
  "플라잉 요가",
  "SNPE",
  "스피닝",
  "F45/FS8",
  "그룹 트레이닝",
  "복싱",
] as const;

export type Exercise = (typeof ALLOWED_EXERCISES)[number];

/** 오붓 지도(/discover?categoryIds=) 카테고리 ID */
export const OBUD_CATEGORY_ID: Record<Exercise, number> = {
  요가: 1,
  필라테스: 2,
  바레: 4,
  발레: 9,
  "하이록스 공식": 34,
  크로스핏: 35,
  GYM: 33,
  싱잉볼: 14,
  클라이밍: 15,
  "번지 피트니스": 23,
  "플라잉 요가": 24,
  SNPE: 12,
  스피닝: 25,
  "F45/FS8": 31,
  "그룹 트레이닝": 5,
  복싱: 36,
};

/** 결과 카드/추천 목록에 쓰는 운동 아이콘 */
export const EXERCISE_EMOJI: Record<Exercise, string> = {
  요가: "🧘",
  필라테스: "🤸",
  바레: "🩰",
  발레: "🩰",
  "하이록스 공식": "🏃",
  크로스핏: "🏋️",
  GYM: "💪",
  싱잉볼: "🔔",
  클라이밍: "🧗",
  "번지 피트니스": "🪢",
  "플라잉 요가": "🕊️",
  SNPE: "🦴",
  스피닝: "🚴",
  "F45/FS8": "⏱️",
  "그룹 트레이닝": "👯",
  복싱: "🥊",
};

/**
 * 오행 보완 운동 — "부족한 기운을 채워주는" 운동. (메인 추천 근거)
 * 목: 늘이고 뻗는 / 화: 심박을 올려 발산 / 토: 코어·중심 / 금: 근력·정확함 / 수: 흐르듯 부드러운
 */
export const OHAENG_EXERCISES: Record<Ohaeng, Exercise[]> = {
  목: ["요가", "플라잉 요가", "클라이밍"],
  화: ["복싱", "스피닝", "번지 피트니스", "그룹 트레이닝"],
  토: ["필라테스", "바레", "SNPE"],
  금: ["GYM", "크로스핏", "하이록스 공식", "F45/FS8"],
  수: ["발레", "싱잉볼", "바레"],
};

/** 오행 보완 방향 설명 (프롬프트/화면 공용) */
export const OHAENG_FILL_HINT: Record<Ohaeng, string> = {
  목: "몸을 길게 늘이고 뻗어 성장의 기운을 채우는",
  화: "심박을 올려 열정과 발산의 기운을 채우는",
  토: "코어와 중심을 잡아 안정의 기운을 채우는",
  금: "근력과 정확함으로 단단한 기운을 채우는",
  수: "흐르듯 부드러운 움직임으로 유연함의 기운을 채우는",
};

/** 신살 성향 운동 — 보조 추천 근거 */
export const SINSAL_EXERCISES: Record<string, Exercise[]> = {
  역마살: ["바레", "클라이밍", "스피닝", "하이록스 공식"],
  화개살: ["요가", "필라테스", "싱잉볼", "SNPE"],
  도화살: ["발레", "바레", "플라잉 요가", "그룹 트레이닝"],
  백호살: ["복싱", "크로스핏", "하이록스 공식"],
};

export const SINSAL_HINT: Record<string, string> = {
  역마살: "변화·이동감 있는 운동",
  화개살: "혼자 몰입하거나 내면에 집중하는 운동",
  도화살: "표현·교류를 즐기는 운동",
  백호살: "강렬하게 발산하는 운동",
};

export function obudDiscoverUrl(base: string, exercises: Exercise[]): string {
  const params = new URLSearchParams();
  for (const e of exercises) params.append("categoryIds", String(OBUD_CATEGORY_ID[e]));
  return `${base.replace(/\/$/, "")}/discover?${params.toString()}`;
}
