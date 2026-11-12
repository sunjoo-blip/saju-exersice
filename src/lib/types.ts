/**
 * API 응답 공용 타입 — 프론트/백엔드 공유.
 */

import type { Recommendation } from "./ai/schema";
import type { SajuResult } from "./saju/types";
import type { ExercisePick } from "./exercise/pick";

/** 프론트에 노출하는 사주 요약 (개인 생년월일/생시는 포함하지 않음) */
export interface PublicSajuSummary {
  pillars: {
    year: PublicPillar;
    month: PublicPillar;
    day: PublicPillar;
    hour: PublicPillar | null;
  };
  ohaeng: SajuResult["ohaeng"];
  sinsal: SajuResult["sinsal"];
  ilgan: SajuResult["ilgan"];
  hourUnknown: boolean;
}

export interface PublicPillar {
  ganjiHanja: string;
  gan: string;
  jiji: string;
  ganOhaeng: string;
  jijiOhaeng: string;
}

/** /api/saju — 사주 계산 + 규칙 기반 추천 운동 (AI 없음, 즉시 응답) */
export interface SajuSuccess {
  ok: true;
  saju: PublicSajuSummary;
  picks: ExercisePick[];
}

export interface AnalyzeSuccess extends SajuSuccess {
  recommendation: Recommendation;
}

export interface AnalyzeFailure {
  ok: false;
  error: string;
  code: string;
}

export type AnalyzeResponse = AnalyzeSuccess | AnalyzeFailure;

export type SajuResponse = SajuSuccess | AnalyzeFailure;
