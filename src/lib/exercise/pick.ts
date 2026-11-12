/**
 * 추천 운동 3개를 규칙으로 결정 (결정적: 같은 사주 → 같은 결과).
 *
 *  1·2순위: 부족한 오행 보완 (없는 오행 → 없으면 가장 약한 오행)
 *  3순위:   판정된 신살 성향 (없으면 일간 오행 살리기)
 */

import { ALL_OHAENG, OHAENG_META, type Ohaeng } from "../saju/constants";
import type { SajuResult } from "../saju/types";
import {
  ALLOWED_EXERCISES,
  OHAENG_EXERCISES,
  SINSAL_EXERCISES,
  type Exercise,
} from "./catalog";

export interface ExercisePick {
  name: Exercise;
  /** 화면/프롬프트에 노출하는 추천 근거 (예: "火 기운 보완", "백호살") */
  basis: string;
  kind: "ohaeng" | "sinsal" | "ilgan";
}

/** 보완해야 할 오행 (부족 순) */
export function fillTargets(saju: SajuResult): Ohaeng[] {
  if (saju.ohaeng.missing.length > 0) return saju.ohaeng.missing;
  const min = Math.min(...ALL_OHAENG.map((o) => saju.ohaeng.counts[o]));
  return ALL_OHAENG.filter((o) => saju.ohaeng.counts[o] === min);
}

function seedOf(saju: SajuResult): number {
  const p = saju.pillars;
  const key = [p.year, p.month, p.day, p.hour]
    .map((x) => x?.ganjiHanja ?? "-")
    .join("");
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function pickExercises(saju: SajuResult): ExercisePick[] {
  const seed = seedOf(saju);
  const picked: ExercisePick[] = [];
  const used = new Set<Exercise>();

  const take = (pool: Exercise[], salt: number): Exercise | null => {
    const free = pool.filter((e) => !used.has(e));
    if (free.length === 0) return null;
    return free[(seed + salt) % free.length];
  };
  const push = (name: Exercise | null, basis: string, kind: ExercisePick["kind"]) => {
    if (!name || picked.length >= 3) return;
    used.add(name);
    picked.push({ name, basis, kind });
  };

  // 1·2순위 — 오행 보완
  const targets = fillTargets(saju);
  const slots = targets.length >= 2 ? [targets[0], targets[1]] : [targets[0], targets[0]];
  slots.forEach((o, i) =>
    push(take(OHAENG_EXERCISES[o], i), `${OHAENG_META[o].hanja} 기운 보완`, "ohaeng"),
  );

  // 3순위 — 신살 (여러 개면 seed 로 하나)
  const sinsal = saju.sinsal.filter((s) => SINSAL_EXERCISES[s.name]);
  if (sinsal.length > 0) {
    const s = sinsal[seed % sinsal.length];
    push(take(SINSAL_EXERCISES[s.name], 7), s.name, "sinsal");
  }
  if (picked.length < 3 && targets[2]) {
    const o = targets[2];
    push(take(OHAENG_EXERCISES[o], 3), `${OHAENG_META[o].hanja} 기운 보완`, "ohaeng");
  }
  if (picked.length < 3) {
    const o = saju.ilgan.ohaeng;
    push(take(OHAENG_EXERCISES[o], 5), `일간 ${OHAENG_META[o].hanja} 기운 살리기`, "ilgan");
  }
  // 안전장치 — 풀이 다 겹쳐 3개가 안 되면 전체에서 채움
  while (picked.length < 3) {
    push(take([...ALLOWED_EXERCISES], picked.length), "균형 잡기", "ohaeng");
  }
  return picked;
}
