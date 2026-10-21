/**
 * 오행(五行) 분포 계산. 네 기둥의 천간/지지 오행을 집계합니다.
 */

import { ALL_OHAENG, type Ohaeng } from "./constants";
import type { OhaengDistribution, Pillar } from "./types";

export function calcOhaengDistribution(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null },
): OhaengDistribution {
  const counts: Record<Ohaeng, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  const list = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(
    (p): p is Pillar => p !== null,
  );

  for (const p of list) {
    counts[p.ganOhaeng] += 1;
    counts[p.jijiOhaeng] += 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  let dominant: Ohaeng = "목";
  let max = -1;
  for (const o of ALL_OHAENG) {
    if (counts[o] > max) {
      max = counts[o];
      dominant = o;
    }
  }

  const missing = ALL_OHAENG.filter((o) => counts[o] === 0);

  return { counts, total, dominant, missing };
}
