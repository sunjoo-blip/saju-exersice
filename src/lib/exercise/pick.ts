/**
 * 오행 보완 대상 계산 — "채워야 할 기운"을 구하는 보조 유틸.
 *
 * (운동 종목 선정은 AI 가 담당합니다. 여기서는 프롬프트/화면에 보여줄
 *  "부족한 오행" 만 결정적으로 계산합니다.)
 */

import { ALL_OHAENG, type Ohaeng } from "../saju/constants";
import type { SajuResult } from "../saju/types";

/** 보완해야 할 오행 (부족 순: 없는 오행 → 없으면 가장 약한 오행) */
export function fillTargets(saju: SajuResult): Ohaeng[] {
  if (saju.ohaeng.missing.length > 0) return saju.ohaeng.missing;
  const min = Math.min(...ALL_OHAENG.map((o) => saju.ohaeng.counts[o]));
  return ALL_OHAENG.filter((o) => saju.ohaeng.counts[o] === min);
}
