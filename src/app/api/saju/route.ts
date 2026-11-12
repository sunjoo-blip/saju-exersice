/**
 * POST /api/saju — 사주 계산 + 규칙 기반 추천 운동만 빠르게 반환 (AI 호출 없음).
 * 프론트는 이 결과를 먼저 그리고, AI 해석은 /api/analyze 로 이어서 채웁니다.
 */

import { NextResponse } from "next/server";
import { pickExercises } from "@/lib/exercise/pick";
import { readSajuRequest, toPublicSummary } from "@/lib/server/sajuRequest";
import type { SajuResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse<SajuResponse>> {
  const r = await readSajuRequest(req);
  if (r instanceof NextResponse) return r;
  return NextResponse.json({
    ok: true,
    saju: toPublicSummary(r.saju),
    picks: pickExercises(r.saju),
  });
}
