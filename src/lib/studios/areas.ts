/**
 * 스튜디오 추천용 지역 프리셋 — 중심 좌표 기준으로 오붓 지도 검색 범위를 만듭니다.
 * (오붓 v4 지도 검색은 bounds 또는 regionIds 가 필요)
 */

export type Area = { id: string; label: string; lat: number; lng: number };

export const AREAS: Area[] = [
  { id: "gangnam", label: "강남·서초", lat: 37.4979, lng: 127.0276 },
  { id: "seongsu", label: "성수·건대", lat: 37.5446, lng: 127.0557 },
  { id: "jamsil", label: "잠실·송파", lat: 37.5133, lng: 127.1002 },
  { id: "mapo", label: "홍대·마포", lat: 37.5563, lng: 126.9236 },
  { id: "yeouido", label: "여의도·영등포", lat: 37.5219, lng: 126.9245 },
  { id: "jongno", label: "광화문·종로", lat: 37.5704, lng: 126.9769 },
  { id: "yongsan", label: "용산·이태원", lat: 37.5345, lng: 126.9946 },
  { id: "pangyo", label: "판교·분당", lat: 37.3947, lng: 127.1112 },
];

/** 중심 좌표 기준 약 4~5km 박스 */
export function boundsAround(lat: number, lng: number, d = 0.04) {
  return {
    swLat: lat - d,
    swLng: lng - d * 1.25,
    neLat: lat + d,
    neLng: lng + d * 1.25,
  };
}

export type Studio = {
  slug: string;
  title: string;
  region: string;
  image: string | null;
  reviewAverage: number | null;
  reviewCount: number;
  categories: string[];
  lat: number;
  lng: number;
  /** 오붓패스 사용 가능 지역 (없으면 null) */
  passType: string | null;
  /** 부족한 오행(수·목)을 위치로 채워주는 경우 그 이유 (예: "한강에서 300m · 물 기운을 채워줘요") */
  ohaengReason: string | null;
};

/** 오붓 장소 페이지 링크 (+ 오붓도비 UTM) */
export function obudPlaceUrl(base: string, slug: string): string {
  const params = new URLSearchParams({
    utm_source: "saju_exercise",
    utm_medium: "referral",
    utm_campaign: "obud_dobby",
    utm_content: "studio_card",
  });
  return `${base.replace(/\/$/, "")}/place/${encodeURIComponent(slug)}?${params}`;
}
