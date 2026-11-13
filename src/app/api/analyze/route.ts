/**
 * POST /api/analyze
 * 1) 입력 검증 → 2) 사주 계산(검증 모듈) → 3) 규칙 기반 추천 운동 결정 → 4) AI 해석 → 5) 스키마 검증 후 반환.
 *
 * 개인정보 보호(명세 4):
 *  - 생년월일/생시는 결과 생성에만 사용하고 로그로 남기지 않습니다.
 *  - 응답에는 생년월일/생시를 포함하지 않습니다. (사주 간지/오행/신살만 노출)
 */

import { NextResponse } from "next/server";
import { generateRecommendation, RecommendationError } from "@/lib/ai/recommend";
import { pickExercises } from "@/lib/exercise/pick";
import { readSajuRequest, toPublicSummary } from "@/lib/server/sajuRequest";
import { checkRateLimit, withBrowserCookie } from "@/lib/rateLimit";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel 함수 타임아웃 여유
export const maxDuration = 60;

export async function POST(req: Request): Promise<NextResponse<AnalyzeResponse>> {
  const r = await readSajuRequest(req);
  if (r instanceof NextResponse) return r;
  const { input, saju } = r;
  const picks = pickExercises(saju);

  // 하루 1회 제한 — OpenAI 호출 전에 평가/선점.
  const rate = await checkRateLimit(req);
  if (!rate.allowed) {
    return withBrowserCookie(
      NextResponse.json(
        { ok: false as const, error: rate.message!, code: "RATE_LIMITED" },
        { status: 429 },
      ),
      rate.browserId,
    );
  }

  try {
    const recommendation = await generateRecommendation(saju, picks, input.nickname);
    return withBrowserCookie(
      NextResponse.json({
        ok: true as const,
        saju: toPublicSummary(saju),
        picks,
        recommendation,
      }),
      rate.browserId,
    );
  } catch (err) {
    // 생성 실패는 과금이 없으므로 소진한 하루 한도를 되돌려줍니다.
    await rate.rollback();
    if (err instanceof RecommendationError) {
      const status = err.code === "NO_API_KEY" ? 503 : 502;
      return withBrowserCookie(
        NextResponse.json(
          { ok: false as const, error: err.message, code: err.code },
          { status },
        ),
        rate.browserId,
      );
    }
    return withBrowserCookie(
      NextResponse.json(
        {
          ok: false as const,
          error: "결과 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          code: "UNKNOWN",
        },
        { status: 500 },
      ),
      rate.browserId,
    );
  }
}
