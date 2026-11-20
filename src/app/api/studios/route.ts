/**
 * GET /api/studios?categoryIds=4,2&lat=37.5&lng=127.0
 * 오붓 공개 지도 검색(v4/search/places/list)을 프록시해서 추천 스튜디오 3곳을 돌려줍니다.
 * - 로그인/토큰 불필요 (오붓 쪽 OptionalAuth)
 * - 결과지에 필요한 필드만 추려서 반환
 */

import { NextResponse } from "next/server";
import { boundsAround, type Studio } from "@/lib/studios/areas";

export const runtime = "nodejs";

const OBUD_API = process.env.OBUD_API_URL || "https://api.obud.co";

type RawPlace = {
  slug: string;
  title: string;
  region?: string;
  images?: { url?: string }[];
  reviewAverage?: number;
  reviewCount?: number;
  ratingHidden?: boolean;
  category?: string[];
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const categoryIds = (url.searchParams.get("categoryIds") ?? "")
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 3);

  // 한국 범위 밖 좌표/카테고리 없음은 거절
  if (!(lat > 33 && lat < 39 && lng > 124 && lng < 132) || categoryIds.length === 0) {
    return NextResponse.json({ ok: false, studios: [] }, { status: 400 });
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    limit: "3",
    sort: "distance",
  });
  const b = boundsAround(lat, lng);
  for (const [k, v] of Object.entries(b)) params.set(k, String(v));
  for (const id of categoryIds) params.append("categoryIds", String(id));

  try {
    const res = await fetch(`${OBUD_API}/v4/search/places/list?${params}`, {
      headers: { "accept-language": "ko" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`obud api ${res.status}`);
    const json = (await res.json()) as { value?: RawPlace[] };
    const studios: Studio[] = (json.value ?? []).slice(0, 3).map((p) => ({
      slug: p.slug,
      title: p.title,
      region: p.region ?? "",
      image: p.images?.[0]?.url ?? null,
      reviewAverage: p.ratingHidden ? null : p.reviewAverage ?? null,
      reviewCount: p.reviewCount ?? 0,
      categories: p.category ?? [],
    }));
    return NextResponse.json({ ok: true, studios });
  } catch {
    return NextResponse.json({ ok: false, studios: [] }, { status: 502 });
  }
}
