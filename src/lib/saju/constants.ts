/**
 * 명리학 기본 상수 — 천간(天干)/지지(地支)/오행(五行) 매핑.
 *
 * lunar-typescript 가 반환하는 한자(甲, 子 …)를 한글 표기와 오행으로 변환하기 위한
 * 검증 가능한 고정 테이블입니다. AI 추론으로 계산하지 않습니다. (명세 F3)
 */

export type Ohaeng = "목" | "화" | "토" | "금" | "수";

/** 천간(天干) 10 — 한자 → 한글 */
export const CHEONGAN: Record<string, string> = {
  甲: "갑",
  乙: "을",
  丙: "병",
  丁: "정",
  戊: "무",
  己: "기",
  庚: "경",
  辛: "신",
  壬: "임",
  癸: "계",
};

/** 지지(地支) 12 — 한자 → 한글 */
export const JIJI: Record<string, string> = {
  子: "자",
  丑: "축",
  寅: "인",
  卯: "묘",
  辰: "진",
  巳: "사",
  午: "오",
  未: "미",
  申: "신",
  酉: "유",
  戌: "술",
  亥: "해",
};

/** 지지 → 동물(띠) 한글 */
export const JIJI_ANIMAL: Record<string, string> = {
  子: "쥐",
  丑: "소",
  寅: "호랑이",
  卯: "토끼",
  辰: "용",
  巳: "뱀",
  午: "말",
  未: "양",
  申: "원숭이",
  酉: "닭",
  戌: "개",
  亥: "돼지",
};

/** 천간의 오행 */
export const CHEONGAN_OHAENG: Record<string, Ohaeng> = {
  甲: "목",
  乙: "목",
  丙: "화",
  丁: "화",
  戊: "토",
  己: "토",
  庚: "금",
  辛: "금",
  壬: "수",
  癸: "수",
};

/** 지지의 (대표) 오행 — 지장간 중 본기(本氣) 기준 */
export const JIJI_OHAENG: Record<string, Ohaeng> = {
  寅: "목",
  卯: "목",
  巳: "화",
  午: "화",
  辰: "토",
  戌: "토",
  丑: "토",
  未: "토",
  申: "금",
  酉: "금",
  亥: "수",
  子: "수",
};

/** 오행별 표시용 색 계열(힌트) — 프론트 시각화에서 사용 */
export const OHAENG_META: Record<Ohaeng, { hanja: string; hint: string }> = {
  목: { hanja: "木", hint: "성장과 뻗어나감" },
  화: { hanja: "火", hint: "열정과 발산" },
  토: { hanja: "土", hint: "안정과 중심" },
  금: { hanja: "金", hint: "결단과 단단함" },
  수: { hanja: "水", hint: "유연함과 흐름" },
};

export const ALL_OHAENG: Ohaeng[] = ["목", "화", "토", "금", "수"];
