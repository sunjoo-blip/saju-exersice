/**
 * POST /api/verify
 * 접속 코드만 확인하는 가벼운 엔드포인트. 랜딩의 '입장' 버튼이 사용합니다.
 * OpenAI/사주 계산은 전혀 하지 않으므로 비용이 들지 않습니다.
 */
import { NextResponse } from "next/server";
import { isAllowed } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request): NextResponse {
  if (!isAllowed(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
