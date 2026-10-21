import type { Ohaeng } from "./constants";

/** 입력: 사용자가 제공하는 생년월일/시 정보 (명세 F2) */
export interface SajuInput {
  /** 양력 기준 연 */
  year: number;
  /** 월 (1-12) */
  month: number;
  /** 일 (1-31) */
  day: number;
  /** 시 (0-23). 출생 시간을 모를 경우 null */
  hour: number | null;
  /** 분 (0-59). 미입력 시 0 */
  minute: number;
  /** 입력이 음력인지 여부. true면 음력 → 내부에서 양력으로 변환 */
  isLunar: boolean;
  /** 음력일 때 윤달 여부 */
  isLeapMonth?: boolean;
  /** 닉네임(선택) */
  nickname?: string;
}

/** 하나의 기둥(주) — 천간 + 지지 */
export interface Pillar {
  /** 한자 간지 (예: 甲子) */
  ganjiHanja: string;
  /** 천간 한글 (예: 갑) */
  gan: string;
  /** 지지 한글 (예: 자) */
  jiji: string;
  /** 천간 한자 */
  ganHanja: string;
  /** 지지 한자 */
  jijiHanja: string;
  /** 천간 오행 */
  ganOhaeng: Ohaeng;
  /** 지지 오행 */
  jijiOhaeng: Ohaeng;
}

/** 오행 분포 (각 오행 개수 + 비율) */
export interface OhaengDistribution {
  counts: Record<Ohaeng, number>;
  total: number;
  /** 가장 강한 오행 */
  dominant: Ohaeng;
  /** 분포에 전혀 없는 오행들 */
  missing: Ohaeng[];
}

/** 판정된 신살 하나 */
export interface Sinsal {
  /** 신살 이름 (예: 역마살) */
  name: string;
  /** 한자 */
  hanja: string;
  /** 어떤 기준(일지/년지)과 어떤 지지에서 판정됐는지 */
  foundIn: string[];
  /** 콘텐츠 기획용 간단 설명 */
  keyword: string;
}

/** 계산 결과 전체 — AI 프롬프트로 전달되는 "검증된 사실" */
export interface SajuResult {
  /** 사주 원국 4주 (시주는 출생시간 모를 경우 null) */
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar | null;
  };
  /** 오행 분포 */
  ohaeng: OhaengDistribution;
  /** 실제로 판정된 신살만 (명세 F3: 없으면 억지로 만들지 않음) */
  sinsal: Sinsal[];
  /** 일간(日干) — 나를 대표하는 천간 */
  ilgan: { gan: string; ganHanja: string; ohaeng: Ohaeng };
  /** 시주 제외 여부 (출생시간 모름) */
  hourUnknown: boolean;
  /** 적용된 계산 메타 (검증/문서화용) */
  meta: {
    solarDate: string;
    lunarDate: string;
    note: string;
  };
}
