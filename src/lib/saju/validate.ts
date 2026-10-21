/**
 * 입력 검증 (명세 F2). 서버/클라이언트 공용 zod 스키마.
 */

import { z } from "zod";

export const sajuInputSchema = z
  .object({
    year: z.number().int().min(1900).max(2100),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    hour: z.number().int().min(0).max(23).nullable(),
    minute: z.number().int().min(0).max(59).default(0),
    isLunar: z.boolean(),
    isLeapMonth: z.boolean().optional(),
    nickname: z.string().trim().max(20).optional(),
  })
  .refine(
    (v) => {
      // 간단한 일자 유효성 (양력 기준). 음력은 라이브러리에서 재검증됨.
      const dim = new Date(v.year, v.month, 0).getDate();
      return v.day <= dim;
    },
    { message: "해당 월에 존재하지 않는 날짜입니다.", path: ["day"] },
  );

export type ValidatedSajuInput = z.infer<typeof sajuInputSchema>;
