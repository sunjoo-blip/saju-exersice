/**
 * 스튜디오 추천용 지역 프리셋 — 중심 좌표 기준으로 오붓 지도 검색 범위를 만듭니다.
 * (오붓 v4 지도 검색은 bounds 또는 regionIds 가 필요)
 */

/** 서울 하위 지역 — 포함 구(區)로 보완 오행 추천을 강조. "서울 전체"는 districts: [] */
export type SubArea = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** 포함 구 — DISTRICT_OHAENG 키와 맞춤("중구"만 "중"). 오행 추천 강조에 사용 */
  districts: string[];
};

/** 시/도 — subs 가 있으면 2단계(하위 지역 칩), 없으면 선택 시 대표 좌표로 바로 검색 */
export type Region = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  subs?: SubArea[];
};

/** 서울 25개 구를 묶은 하위 지역 (좌표는 구청 대략값). 보완 오행 추천은 PlaceCTA 에서 강조 */
export const SEOUL_SUBS: SubArea[] = [
  { id: "seoul_all", label: "서울 전체", lat: 37.5665, lng: 126.978, districts: [] },
  { id: "gangnam", label: "강남", lat: 37.5172, lng: 127.0473, districts: ["강남"] },
  { id: "seocho", label: "서초", lat: 37.4837, lng: 127.0324, districts: ["서초"] },
  { id: "songpa", label: "송파", lat: 37.5145, lng: 127.1059, districts: ["송파"] },
  { id: "gangdong", label: "강동", lat: 37.5301, lng: 127.1238, districts: ["강동"] },
  { id: "jongno", label: "종로·중구", lat: 37.5688, lng: 126.9885, districts: ["종로", "중"] },
  { id: "yongsan", label: "용산", lat: 37.5326, lng: 126.9905, districts: ["용산"] },
  { id: "mapo", label: "마포", lat: 37.5663, lng: 126.9019, districts: ["마포"] },
  { id: "seodaemun", label: "서대문·은평", lat: 37.5909, lng: 126.933, districts: ["서대문", "은평"] },
  { id: "seongdong", label: "성동·광진", lat: 37.549, lng: 127.063, districts: ["성동", "광진"] },
  { id: "dongdaemun", label: "동대문·중랑", lat: 37.5905, lng: 127.066, districts: ["동대문", "중랑"] },
  { id: "seongbuk", label: "성북·강북", lat: 37.6145, lng: 127.021, districts: ["성북", "강북"] },
  { id: "nowon", label: "노원·도봉", lat: 37.6615, lng: 127.052, districts: ["노원", "도봉"] },
  { id: "yeongdeungpo", label: "영등포·구로", lat: 37.5109, lng: 126.892, districts: ["영등포", "구로"] },
  { id: "dongjak", label: "동작·관악·금천", lat: 37.4826, lng: 126.929, districts: ["동작", "관악", "금천"] },
  { id: "gangseo", label: "강서·양천", lat: 37.534, lng: 126.858, districts: ["강서", "양천"] },
];

/** 시/도 프리셋 — 서울만 하위 지역, 나머지는 대표 좌표로 바로 검색 */
export const REGIONS: Region[] = [
  { id: "seoul", label: "서울", lat: 37.5665, lng: 126.978, subs: SEOUL_SUBS },
  { id: "gyeonggi", label: "경기", lat: 37.2636, lng: 127.0286 },
  { id: "incheon", label: "인천", lat: 37.4563, lng: 126.7052 },
  { id: "jeju", label: "제주", lat: 33.4996, lng: 126.5312 },
  { id: "busan", label: "부산", lat: 35.1577, lng: 129.0594 },
  { id: "gangwon", label: "강원", lat: 37.8813, lng: 127.7298 },
  { id: "daegu", label: "대구", lat: 35.8693, lng: 128.5956 },
  { id: "daejeon", label: "대전", lat: 36.3504, lng: 127.3845 },
  { id: "chungnam", label: "충남", lat: 36.8151, lng: 127.1139 },
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
