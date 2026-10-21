/**
 * 신살(神殺) 판정 규칙 — 검증 가능한 고전 명리 규칙 기반 (명세 F3).
 *
 * 핵심 원칙:
 *  - 아래 규칙은 고전 명리학에서 널리 쓰이는 판정식을 코드로 옮긴 것입니다.
 *  - 실제로 조건이 성립한 신살만 반환합니다. (조건 불충족 시 억지로 만들지 않음)
 *  - 적용 기준/규칙은 docs/SAJU_RULES.md 에 문서화합니다.
 *
 * 공통 기준: 삼합(三合) 그룹 기반 신살(도화/역마/화개)은 "년지(年支) 또는 일지(日支)"를
 * 기준점으로 삼아, 네 기둥의 지지 중 해당 글자가 있으면 성립한 것으로 판정합니다.
 */

import type { Pillar, Sinsal } from "./types";

/** 삼합 그룹: 기준지지 → 그룹의 대표 글자들 */
// 寅午戌 / 申子辰 / 巳酉丑 / 亥卯未
const SAMHAP_GROUP: Record<string, string> = {
  寅: "寅午戌",
  午: "寅午戌",
  戌: "寅午戌",
  申: "申子辰",
  子: "申子辰",
  辰: "申子辰",
  巳: "巳酉丑",
  酉: "巳酉丑",
  丑: "巳酉丑",
  亥: "亥卯未",
  卯: "亥卯未",
  未: "亥卯未",
};

/** 삼합 그룹별 도화/역마/화개 지지 */
const SAMHAP_SINSAL: Record<string, { 도화: string; 역마: string; 화개: string }> = {
  寅午戌: { 도화: "卯", 역마: "申", 화개: "戌" },
  申子辰: { 도화: "酉", 역마: "寅", 화개: "辰" },
  巳酉丑: { 도화: "午", 역마: "亥", 화개: "丑" },
  亥卯未: { 도화: "子", 역마: "巳", 화개: "未" },
};

/**
 * 백호대살(白虎大殺) — 특정 간지 7개. 네 기둥 중 하나라도 해당하면 성립.
 * 甲辰, 乙未, 丙戌, 丁丑, 戊辰, 壬戌, 癸丑
 */
const BAEKHO_GANJI = new Set(["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"]);

interface JudgeInput {
  yearJijiHanja: string;
  dayJijiHanja: string;
  /** 네 기둥의 지지 한자 (시주 없으면 3개) */
  allJijiHanja: string[];
  /** 네 기둥의 간지 한자 (시주 없으면 3개) */
  allGanjiHanja: string[];
}

/** 삼합 기반 신살 하나를 판정 */
function judgeSamhap(
  type: "도화" | "역마" | "화개",
  input: JudgeInput,
): Sinsal | null {
  const bases = [
    { label: "년지", jiji: input.yearJijiHanja },
    { label: "일지", jiji: input.dayJijiHanja },
  ];

  const foundIn: string[] = [];
  for (const base of bases) {
    const group = SAMHAP_GROUP[base.jiji];
    if (!group) continue;
    const target = SAMHAP_SINSAL[group][type];
    if (input.allJijiHanja.includes(target)) {
      foundIn.push(`${base.label}(${base.jiji}) 기준 ${target}`);
    }
  }
  if (foundIn.length === 0) return null;

  const META = {
    도화: { name: "도화살", hanja: "桃花殺", keyword: "매력과 표현, 교류" },
    역마: { name: "역마살", hanja: "驛馬殺", keyword: "이동과 변화, 새로운 경험" },
    화개: { name: "화개살", hanja: "華蓋殺", keyword: "몰입과 예술, 내면 집중" },
  } as const;

  // 중복 기준 제거
  return { ...META[type], foundIn: Array.from(new Set(foundIn)) };
}

/** 백호대살 판정 */
function judgeBaekho(input: JudgeInput): Sinsal | null {
  const foundIn = input.allGanjiHanja.filter((g) => BAEKHO_GANJI.has(g));
  if (foundIn.length === 0) return null;
  return {
    name: "백호살",
    hanja: "白虎大殺",
    foundIn: foundIn.map((g) => `${g} 주`),
    keyword: "강렬한 에너지와 추진력",
  };
}

/**
 * 모든 신살 판정. 성립한 것만 배열로 반환.
 */
export function judgeSinsal(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
): Sinsal[] {
  const list = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(
    (p): p is Pillar => p !== null,
  );

  const input: JudgeInput = {
    yearJijiHanja: pillars.year.jijiHanja,
    dayJijiHanja: pillars.day.jijiHanja,
    allJijiHanja: list.map((p) => p.jijiHanja),
    allGanjiHanja: list.map((p) => p.ganjiHanja),
  };

  const results: (Sinsal | null)[] = [
    judgeSamhap("역마", input),
    judgeSamhap("화개", input),
    judgeSamhap("도화", input),
    judgeBaekho(input),
  ];

  return results.filter((s): s is Sinsal => s !== null);
}
