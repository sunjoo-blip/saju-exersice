/**
 * 오행 보완 대상 계산 — "채워야 할 기운"을 구하는 보조 유틸.
 *
 * (운동 종목 선정은 AI 가 담당합니다. 여기서는 프롬프트/화면에 보여줄
 *  "보완 오행" 만 결정적으로 계산합니다.)
 */

import { OHAENG_SAENG, type Ohaeng } from "../saju/constants";
import type { SajuResult } from "../saju/types";

/**
 * 보완해야 할 오행 — 가장 강한 오행(dominant)의 기운을 상생(相生)으로
 * 흘려보낼 다음 오행 하나. 예) 금(金)이 가장 강하면 금생수 → 수(水) 보완.
 * (오행이 골고루라 약한 오행이 여러 개여도 항상 1개만 반환합니다.)
 */
export function fillTargetFor(dominant: Ohaeng): Ohaeng {
  return OHAENG_SAENG[dominant];
}

/** 보완해야 할 오행 (항상 1개). 소비처 호환을 위해 배열로 반환합니다. */
export function fillTargets(saju: SajuResult): Ohaeng[] {
  return [fillTargetFor(saju.ohaeng.dominant)];
}
