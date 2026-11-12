/**
 * /api/saju · /api/analyze 공용 — 접속코드 확인 → 입력 검증 → 사주 계산.
 * 생년월일/생시는 결과 생성에만 쓰고 로그로 남기지 않습니다.
 */

import { NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/calculate";
import { sajuInputSchema, type ValidatedSajuInput } from "@/lib/saju/validate";
import { isAllowed } from "@/lib/access";
import type { AnalyzeFailure, PublicSajuSummary } from "@/lib/types";
import type { SajuResult } from "@/lib/saju/types";

export function toPublicSummary(saju: SajuResult): PublicSajuSummary {
  const strip = (p: SajuResult["pillars"]["year"] | null) =>
    p
      ? {
          ganjiHanja: p.ganjiHanja,
          gan: p.gan,
          jiji: p.jiji,
          ganOhaeng: p.ganOhaeng,
          jijiOhaeng: p.jijiOhaeng,
        }
      : null;

  return {
    pillars: {
      year: strip(saju.pillars.year)!,
      month: strip(saju.pillars.month)!,
      day: strip(saju.pillars.day)!,
      hour: strip(saju.pillars.hour),
    },
    ohaeng: saju.ohaeng,
    sinsal: saju.sinsal,
    ilgan: saju.ilgan,
    hourUnknown: saju.hourUnknown,
  };
}

type Fail = NextResponse<AnalyzeFailure>;
const fail = (error: string, code: string, status: number): Fail =>
  NextResponse.json({ ok: false as const, error, code }, { status });

export async function readSajuRequest(
  req: Request,
): Promise<{ input: ValidatedSajuInput; saju: SajuResult } | Fail> {
  // 시크릿 코드 검증 — OpenAI 호출 전에 가장 먼저 차단.
  if (!isAllowed(req)) return fail("접속 코드가 올바르지 않아요.", "UNAUTHORIZED", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("요청 본문이 올바르지 않습니다.", "BAD_REQUEST", 400);
  }

  const parsed = sajuInputSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요.",
      "VALIDATION",
      400,
    );
  }

  try {
    return { input: parsed.data, saju: calculateSaju(parsed.data) };
  } catch (err) {
    return fail(
      `사주 계산 중 오류가 발생했습니다: ${(err as Error).message}`,
      "CALC_FAILED",
      422,
    );
  }
}
