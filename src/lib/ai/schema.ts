/**
 * AI 운동 추천 응답 스키마 (명세 F4).
 * AI 응답은 반드시 이 구조를 통과해야 결과로 노출됩니다. (서버 검증)
 */

import { z } from "zod";

/**
 * 추천 가능한 운동 종류(화이트리스트). AI 는 반드시 이 목록 안에서만 추천하며,
 * 서버에서 enum 으로 검증해 목록 밖 운동은 결과로 노출되지 않습니다.
 */
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
      }),
    )
    .length(3),
  /** 운동 지속 팁 */
  tips: z.array(z.string().min(1).max(160)).min(2).max(4),
  /** SNS 공유용 짧은 문구 (개인정보 미포함) */
  shareText: z.string().min(1).max(120),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
