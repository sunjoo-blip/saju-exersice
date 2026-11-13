/**
 * GET /api/quota
 * 오늘 분석이 가능한지 '읽기 전용'으로 확인 (카운터 증가 없음).
 * 입력 화면이 '내 운동 팔자 보기' 버튼을 미리 비활성화할지 결정하는 데 씁니다.
 * OpenAI/사주 계산을 하지 않으므로 비용이 들지 않습니다.
 */
import { NextResponse } from "next/server";
import { isAllowed } from "@/lib/access";
import { peekRateLimit, withBrowserCookie } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  if (!isAllowed(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const gate = await peekRateLimit(req);
  return withBrowserCookie(
    NextResponse.json({ ok: true, allowed: gate.allowed, message: gate.message ?? null }),
    gate.browserId,
  );
}
