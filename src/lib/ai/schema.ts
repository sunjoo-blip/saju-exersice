/**
 * AI 운동 추천 응답 스키마 (명세 F4).
 * AI 응답은 반드시 이 구조를 통과해야 결과로 노출됩니다. (서버 검증)
 */

import { z } from "zod";

/**
 * 추천 가능한 운동 종류(화이트리스트). 목록/매핑은 lib/exercise/catalog.ts 에서 관리합니다.
 */
import { ALLOWED_EXERCISES } from "../exercise/catalog";
export { ALLOWED_EXERCISES };

export const recommendationSchema = z.object({
  /** 운동 팔자 유형명 (예: "역마의 질주러") */
  typeName: z.string().min(1).max(30),
  /** 한 줄 요약 */
  oneLiner: z.string().min(1).max(80),
  /** 주요 사주 요소 및 신살 해석 */
  sajuInterpretation: z.string().min(1).max(600),
  /** 운동 성향 해석 */
  tendency: z.string().min(1).max(400),
  /** 추천 운동 TOP 3 */
  recommendations: z
    .array(
      z.object({
        /** 반드시 ALLOWED_EXERCISES 목록 안의 값이어야 함 */
        name: z.enum(ALLOWED_EXERCISES),
        reason: z.string().min(1).max(300),
        /** 추천 근거 라벨 (서버가 규칙으로 채움 — 예: "火 기운 보완") */
        basis: z.string().optional(),
      }),
    )
    .length(3),
  /** 운동 지속 팁 */
  tips: z.array(z.string().min(1).max(160)).min(2).max(4),
  /** SNS 공유용 짧은 문구 (개인정보 미포함) */
  shareText: z.string().min(1).max(120),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
