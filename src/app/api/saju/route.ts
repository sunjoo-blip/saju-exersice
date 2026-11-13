/**
 * POST /api/saju — 사주 계산 결과만 빠르게 반환 (AI 호출 없음).
 * 프론트는 이 결과를 먼저 그리고, AI 해석·추천 운동은 /api/analyze 로 이어서 채웁니다.
 */

import { NextResponse } from "next/server";
import { readSajuRequest, toPublicSummary } from "@/lib/server/sajuRequest";
import { peekRateLimit, withBrowserCookie } from "@/lib/rateLimit";
import type { SajuResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse<SajuResponse>> {
  const r = await readSajuRequest(req);
  if (r instanceof NextResponse) return r;

  // '내 운동 팔자 보기' 게이트 — 하루 한도를 넘겼으면 결과 자체를 보여주지 않음.
  // (읽기 전용 확인이라 카운터는 올리지 않음. 실제 소진은 /api/analyze 에서.)
  const gate = await peekRateLimit(req);
  if (!gate.allowed) {
    return withBrowserCookie(
      NextResponse.json(
        { ok: false as const, error: gate.message!, code: "RATE_LIMITED" },
        { status: 429 },
      ),
      gate.browserId,
    );
  }

  return withBrowserCookie(
    NextResponse.json({
      ok: true as const,
      saju: toPublicSummary(r.saju),
    }),
    gate.browserId,
  );
}
