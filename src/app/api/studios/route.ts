/**
 * GET /api/studios?categoryIds=4,2&lat=37.5&lng=127.0&fill=수,목&limit=8
 * - fill: 부족한 오행. 구 오행이 맞거나 한강·공원 근처인 스튜디오를 앞으로 올리고 이유를 붙임
 * 오붓 공개 지도 검색(v4/search/places/list)을 프록시해서 추천 스튜디오를 돌려줍니다. (limit 기본 3, 최대 12)
 * - 로그인/토큰 불필요 (오붓 쪽 OptionalAuth)
 * - 결과지에 필요한 필드만 추려서 반환
 */

import { NextResponse } from "next/server";
import { boundsAround, type Studio } from "@/lib/studios/areas";
import { scoreStudio } from "@/lib/studios/ohaengPlaces";
import { ALL_OHAENG, type Ohaeng } from "@/lib/saju/constants";

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
  latitude?: number;
  longitude?: number;
  obudPassType?: string | null;
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

  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "3", 10) || 3, 1), 12);

  const fill = (url.searchParams.get("fill") ?? "")
    .split(",")
    .filter((o): o is Ohaeng => (ALL_OHAENG as string[]).includes(o));

  // 한국 범위 밖 좌표/카테고리 없음은 거절
  if (!(lat > 33 && lat < 39 && lng > 124 && lng < 132) || categoryIds.length === 0) {
    return NextResponse.json({ ok: false, studios: [] }, { status: 400 });
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    limit: "20",
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
    const all: Studio[] = (json.value ?? []).map((p) => ({
      slug: p.slug,
      title: p.title,
      region: p.region ?? "",
      image: p.images?.[0]?.url ?? null,
      reviewAverage: p.ratingHidden ? null : p.reviewAverage ?? null,
      reviewCount: p.reviewCount ?? 0,
      categories: p.category ?? [],
      lat: p.latitude ?? lat,
      lng: p.longitude ?? lng,
      passType: p.obudPassType ?? null,
      ohaengReason: null,
    }));
    // 오행 점수(구 오행 + 한강·공원 근처) 높은 순, 같으면 원래 순서(가까운 순)
    const scored = all.map((st, i) => {
      const { score, reason } = scoreStudio(st.lat, st.lng, st.region, fill);
      st.ohaengReason = reason;
      return { st, score, i };
    });
    scored.sort((a, b) => b.score - a.score || a.i - b.i);
    const studios = scored.slice(0, limit).map((x) => x.st);
    return NextResponse.json({ ok: true, studios });
  } catch {
    return NextResponse.json({ ok: false, studios: [] }, { status: 502 });
  }
}
