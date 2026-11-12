/**
 * POST /api/analyze
 * 1) 입력 검증 → 2) 사주 계산(검증 모듈) → 3) AI 운동 추천 → 4) 스키마 검증 후 반환.
 *
 * 개인정보 보호(명세 4):
 *  - 생년월일/생시는 결과 생성에만 사용하고 로그로 남기지 않습니다.
 *  - 응답에는 생년월일/생시를 포함하지 않습니다. (사주 간지/오행/신살만 노출)
 */

import { NextResponse } from "next/server";
import { calculateSaju } from "@/lib/saju/calculate";
import { sajuInputSchema } from "@/lib/saju/validate";
import { generateRecommendation, RecommendationError } from "@/lib/ai/recommend";
import { isAllowed } from "@/lib/access";
import type { AnalyzeResponse, PublicSajuSummary } from "@/lib/types";
import type { SajuResult } from "@/lib/saju/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toPublicSummary(saju: SajuResult): PublicSajuSummary {
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

export async function POST(req: Request): Promise<NextResponse<AnalyzeResponse>> {
  // 시크릿 코드 검증 — OpenAI 호출 전에 가장 먼저 차단.
  if (!isAllowed(req)) {
    return NextResponse.json(
      { ok: false, error: "접속 코드가 올바르지 않아요.", code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "요청 본문이 올바르지 않습니다.", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const parsed = sajuInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요.",
        code: "VALIDATION",
      },
      { status: 400 },
    );
  }

  // 사주 계산 (검증 모듈) — 생년월일/생시는 여기서만 쓰이고 로그 금지.
  let saju: SajuResult;
  try {
    saju = calculateSaju(parsed.data);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `사주 계산 중 오류가 발생했습니다: ${(err as Error).message}`,
        code: "CALC_FAILED",
      },
      { status: 422 },
    );
  }

  // AI 추천 생성
  try {
    const recommendation = await generateRecommendation(
      saju,
      parsed.data.nickname,
    );
    return NextResponse.json({
      ok: true,
      saju: toPublicSummary(saju),
      recommendation,
    });
  } catch (err) {
    if (err instanceof RecommendationError) {
      const status = err.code === "NO_API_KEY" ? 503 : 502;
      return NextResponse.json(
        { ok: false, error: err.message, code: err.code },
        { status },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "결과 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        code: "UNKNOWN",
      },
      { status: 500 },
    );
  }
}
