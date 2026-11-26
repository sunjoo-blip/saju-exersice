/**
 * 스튜디오 추천용 지역 프리셋 — 중심 좌표 기준으로 오붓 지도 검색 범위를 만듭니다.
 * (오붓 v4 지도 검색은 bounds 또는 regionIds 가 필요)
 */

export type Area = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** 이 프리셋이 포함하는 구(區) — DISTRICT_OHAENG 키와 맞춤("중구"만 "중"). 보완 오행 지역 필터에 사용 */
  districts: string[];
  /**
   * 보완 오행과 무관하게 항상 노출할지 여부.
   * 서울 밖(부산·대구·제주·경기)은 구 오행 데이터가 없어 필터 대상이 아니므로 항상 노출합니다.
   */
  alwaysShow?: boolean;
};

export const AREAS: Area[] = [
  // 서울 — 보완 오행이 맞을 때만 노출 (구 오행 + 한강·호수·공원 기준)
  { id: "gangnam", label: "강남·서초", lat: 37.4979, lng: 127.0276, districts: ["강남", "서초"] },
  { id: "seongsu", label: "성수·건대", lat: 37.5446, lng: 127.0557, districts: ["성동", "광진"] },
  { id: "jamsil", label: "잠실·송파", lat: 37.5133, lng: 127.1002, districts: ["송파"] },
  { id: "mapo", label: "홍대·마포", lat: 37.5563, lng: 126.9236, districts: ["마포"] },
  { id: "yeouido", label: "여의도·영등포", lat: 37.5219, lng: 126.9245, districts: ["영등포"] },
  { id: "jongno", label: "광화문·종로", lat: 37.5704, lng: 126.9769, districts: ["종로", "중"] },
  { id: "yongsan", label: "용산·이태원", lat: 37.5345, lng: 126.9946, districts: ["용산"] },
  // 경기 — 항상 노출
  { id: "pangyo", label: "판교·분당", lat: 37.3947, lng: 127.1112, districts: [], alwaysShow: true },
  { id: "seongnam", label: "성남", lat: 37.4323, lng: 127.1294, districts: [], alwaysShow: true },
  { id: "hanam", label: "하남", lat: 37.5393, lng: 127.2149, districts: [], alwaysShow: true },
  { id: "suwon", label: "수원", lat: 37.2636, lng: 127.0286, districts: [], alwaysShow: true },
  { id: "ilsan", label: "고양·일산", lat: 37.6584, lng: 126.77, districts: [], alwaysShow: true },
  // 비수도권 — 항상 노출
  { id: "busan", label: "부산", lat: 35.1577, lng: 129.0594, districts: [], alwaysShow: true },
  { id: "daegu", label: "대구", lat: 35.8693, lng: 128.5956, districts: [], alwaysShow: true },
  { id: "jeju", label: "제주", lat: 33.4996, lng: 126.5312, districts: [], alwaysShow: true },
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
