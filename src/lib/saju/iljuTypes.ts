/**
 * 60일주 타입표 — 유형명·후킹 한 줄·캐릭터·찰떡 운동(1위)을 일주별로 고정합니다.
 * 원본: "운동팔자 60일주 타입" 시트 (https://claude.ai/artifact/HqNv6h21he6WYdaULtJgpX)
 * 시트에서 검수/수정한 뒤 이 파일을 다시 생성하세요. (현재 전부 "초안")
 */

import type { Exercise } from "../exercise/catalog";

export type IljuType = {
  /** 일주 한글 (예: "계해") */
  ilju: string;
  hanja: string;
  /** 일간 기준 캐릭터 (10종) */
  character: string;
  /** 결과지 유형명 */
  typeName: string;
  /** 후킹 한 줄 */
  hook: string;
  /** 찰떡 운동 — 추천 TOP3 의 1위로 고정 */
  exercise: Exercise;
  memo?: string;
};

export const ILJU_TYPES: Record<string, IljuType> = {
  갑자: { ilju: "갑자", hanja: "甲子", character: "기린", typeName: "새벽 3시까지 검색하다 결제한 기린", hook: "생각은 깊은데, 일단 꽂히면 누구보다 높이 올라가는 팔자", exercise: "클라이밍" },
  을축: { ilju: "을축", hanja: "乙丑", character: "고양이", typeName: "말없이 버티다 결국 승진하는 고양이", hook: "조용히 버티다 결국 다 이겨버리는 근성파", exercise: "필라테스" },
  병인: { ilju: "병인", hanja: "丙寅", character: "사자", typeName: "단톡방에 제일 먼저 '가자!' 외치는 사자", hook: "시작하는 순간 주변까지 불태우는 분위기 메이커", exercise: "그룹 트레이닝" },
  정묘: { ilju: "정묘", hanja: "丁卯", character: "여우", typeName: "덕질 한 번 시작하면 끝장 보는 여우", hook: "섬세하게 오래 타는 불, 한 번 빠지면 깊게 파는 타입", exercise: "요가" },
  무진: { ilju: "무진", hanja: "戊辰", character: "곰", typeName: "누워만 있다가 등산 1등 하는 곰", hook: "느긋해 보여도 속엔 엄청난 체력이 숨어 있는 팔자", exercise: "크로스핏" },
  기사: { ilju: "기사", hanja: "己巳", character: "다람쥐", typeName: "적금 만기날 제일 신난 다람쥐", hook: "차곡차곡 쌓다가 어느 날 확 달라져 있는 타입", exercise: "GYM" },
  경오: { ilju: "경오", hanja: "庚午", character: "토끼", typeName: "여름에도 뛰고 와야 잠 오는 토끼", hook: "두드릴수록 단단해지는, 땀이 체질인 팔자", exercise: "하이록스 공식" },
  신미: { ilju: "신미", hanja: "辛未", character: "학", typeName: "사진 30장 찍어 1장 올리는 학", hook: "동작 하나도 예쁘게 해야 직성이 풀리는 완벽주의자", exercise: "발레", memo: "남성이면 대체 운동 필요" },
  임신: { ilju: "임신", hanja: "壬申", character: "돌고래", typeName: "주말에 집에만 있으면 몸살 나는 돌고래", hook: "가만히 있으면 병나는, 움직여야 머리가 맑아지는 팔자", exercise: "스피닝" },
  계유: { ilju: "계유", hanja: "癸酉", character: "거북이", typeName: "책상에 먼지 하나 없는 거북이", hook: "깔끔하고 정확하게, 자기 페이스를 절대 안 놓치는 타입", exercise: "바레", memo: "남성이면 대체 운동 필요" },
  갑술: { ilju: "갑술", hanja: "甲戌", character: "기린", typeName: "혼밥 혼영이 제일 편한 기린", hook: "남 신경 안 쓰고 내 길 가는 고독한 꾸준러", exercise: "GYM" },
  을해: { ilju: "을해", hanja: "乙亥", character: "고양이", typeName: "계획 없는 여행이 제일 좋은 고양이", hook: "흐르는 대로 유연하게, 몸이 풀려야 마음도 풀리는 타입", exercise: "플라잉 요가" },
  병자: { ilju: "병자", hanja: "丙子", character: "사자", typeName: "큰소리 쳐놓고 밤에 이불킥하는 사자", hook: "겉은 화끈, 속은 생각 많은 반전 매력", exercise: "복싱" },
  정축: { ilju: "정축", hanja: "丁丑", character: "여우", typeName: "남들 퇴근한 사무실에서 제일 열심인 여우", hook: "티 안 내고 꾸준히, 혼자 있을 때 제일 열심인 팔자", exercise: "필라테스" },
  무인: { ilju: "무인", hanja: "戊寅", character: "곰", typeName: "여행 가면 일정표 짜는 곰", hook: "리더 기질 폭발, 남들 끌고 가면서 같이 크는 타입", exercise: "F45/FS8" },
  기묘: { ilju: "기묘", hanja: "己卯", character: "다람쥐", typeName: "카페 조명 좋아야 집중되는 다람쥐", hook: "예민하고 감각적, 분위기 좋은 곳에서 실력 나오는 팔자", exercise: "요가" },
  경진: { ilju: "경진", hanja: "庚辰", character: "토끼", typeName: "보드게임도 이길 때까지 하는 토끼", hook: "한계 끝까지 밀어붙여야 직성이 풀리는 승부사", exercise: "크로스핏" },
  신사: { ilju: "신사", hanja: "辛巳", character: "학", typeName: "노래방에서 마이크 안 놓는 학", hook: "남들 시선이 곧 동력, 무대 체질 팔자", exercise: "번지 피트니스" },
  임오: { ilju: "임오", hanja: "壬午", character: "돌고래", typeName: "드라마 1화만 보고 다음 거 트는 돌고래", hook: "뜨거웠다 차가웠다, 여러 운동 갈아타야 안 질리는 팔자", exercise: "그룹 트레이닝", memo: "오붓패스 연결 후보" },
  계미: { ilju: "계미", hanja: "癸未", character: "거북이", typeName: "단톡방 정산 담당 거북이", hook: "남 챙기느라 나는 뒷전, 이제 나를 위해 움직일 차례", exercise: "싱잉볼" },
  갑신: { ilju: "갑신", hanja: "甲申", character: "기린", typeName: "마감 전날 제일 빛나는 기린", hook: "압박 속에서 더 강해지는, 고강도가 체질인 타입", exercise: "하이록스 공식" },
  을유: { ilju: "을유", hanja: "乙酉", character: "고양이", typeName: "액자 삐뚤어지면 못 참는 고양이", hook: "예민한 균형 감각, 정교한 동작에서 빛나는 팔자", exercise: "바레", memo: "남성이면 대체 운동 필요" },
  병술: { ilju: "병술", hanja: "丙戌", character: "사자", typeName: "친구 이삿날 제일 먼저 오는 사자", hook: "의리 있고 뜨거운, 같이 하면 끝까지 가는 팔자", exercise: "스피닝" },
  정해: { ilju: "정해", hanja: "丁亥", character: "여우", typeName: "비 오는 날 플레이리스트 따로 있는 여우", hook: "감성 충만, 몸보다 마음이 먼저 풀려야 하는 타입", exercise: "요가" },
  무자: { ilju: "무자", hanja: "戊子", character: "곰", typeName: "10년째 같은 단골집 가는 곰", hook: "묵묵하게 쌓아서 결국 제일 단단해지는 팔자", exercise: "GYM" },
  기축: { ilju: "기축", hanja: "己丑", character: "다람쥐", typeName: "한 번 정한 아침 루틴 안 깨는 다람쥐", hook: "시작은 느려도 한 번 루틴 되면 절대 안 빠지는 타입", exercise: "필라테스" },
  경인: { ilju: "경인", hanja: "庚寅", character: "토끼", typeName: "설명서 안 읽고 일단 조립하는 토끼", hook: "직진 본능, 생각보다 몸이 먼저 나가는 팔자", exercise: "복싱" },
  신묘: { ilju: "신묘", hanja: "辛卯", character: "학", typeName: "옷 핏 1cm에 예민한 학", hook: "날렵하고 예민한 미감, 라인이 살아나는 운동이 찰떡", exercise: "발레", memo: "남성이면 대체 운동 필요" },
  임진: { ilju: "임진", hanja: "壬辰", character: "돌고래", typeName: "새해 목표가 늘 '인생 바꾸기'인 돌고래", hook: "스케일 큰 야망가, 큰 목표가 있어야 움직이는 팔자", exercise: "하이록스 공식", memo: "대회 목표형" },
  계사: { ilju: "계사", hanja: "癸巳", character: "거북이", typeName: "얌전한데 체육대회만 되면 날아다니는 거북이", hook: "차분해 보여도 속은 뜨거운, 반전 체력의 소유자", exercise: "스피닝" },
  갑오: { ilju: "갑오", hanja: "甲午", character: "기린", typeName: "장바구니에 취미용품 가득한 기린", hook: "열정 과다, 하고 싶은 운동이 너무 많은 팔자", exercise: "F45/FS8", memo: "오붓패스 연결 후보" },
  을미: { ilju: "을미", hanja: "乙未", character: "고양이", typeName: "무인도에 떨어져도 잘 살 고양이", hook: "메마른 땅에서도 살아남는 생존력 끝판왕", exercise: "클라이밍" },
  병신: { ilju: "병신", hanja: "丙申", character: "사자", typeName: "유튜브 한 번 보고 바로 따라 하는 사자", hook: "재주 많고 빠른, 새 운동 배우는 속도가 남다른 팔자", exercise: "번지 피트니스" },
  정유: { ilju: "정유", hanja: "丁酉", character: "여우", typeName: "엑셀 셀 간격까지 맞추는 여우", hook: "디테일 장인, 정확한 자세에서 쾌감을 느끼는 타입", exercise: "SNPE" },
  무술: { ilju: "무술", hanja: "戊戌", character: "곰", typeName: "메뉴 고민 없이 늘 같은 거 시키는 곰", hook: "고집 있고 우직한, 한 우물 파면 고수 되는 팔자", exercise: "클라이밍" },
  기해: { ilju: "기해", hanja: "己亥", character: "다람쥐", typeName: "혼자 밥 먹으면 체하는 다람쥐", hook: "다정하고 포근, 같이 하는 사람이 있어야 오래 가는 타입", exercise: "그룹 트레이닝" },
  경자: { ilju: "경자", hanja: "庚子", character: "토끼", typeName: "가계부 1원까지 맞추는 토끼", hook: "차갑고 냉철하게, 기록 재는 맛에 운동하는 팔자", exercise: "GYM" },
  신축: { ilju: "신축", hanja: "辛丑", character: "학", typeName: "졸업사진보다 지금이 더 멋진 학", hook: "묵묵하게 다듬어 결국 빛나는 대기만성형", exercise: "바레", memo: "남성이면 대체 운동 필요" },
  임인: { ilju: "임인", hanja: "壬寅", character: "돌고래", typeName: "정기결제 3일 만에 해지하는 돌고래", hook: "자유로운 영혼, 틀에 박힌 운동은 3일 만에 질리는 타입", exercise: "플라잉 요가", memo: "역마살 많으면 패스 연결" },
  계묘: { ilju: "계묘", hanja: "癸卯", character: "거북이", typeName: "새 신발 길들이는 데 한 달 걸리는 거북이", hook: "순하고 섬세, 몸을 살살 달래줘야 오래 가는 팔자", exercise: "요가" },
  갑진: { ilju: "갑진", hanja: "甲辰", character: "기린", typeName: "꿈 리스트가 노트 한 권인 기린", hook: "크게 클 그릇, 몸도 꾸준히 키울수록 빛나는 타입", exercise: "크로스핏" },
  을사: { ilju: "을사", hanja: "乙巳", character: "고양이", typeName: "재미없는 회의에서 낙서하는 고양이", hook: "화려하고 재치 있는, 재밌어야 계속하는 팔자", exercise: "번지 피트니스" },
  병오: { ilju: "병오", hanja: "丙午", character: "사자", typeName: "엘리베이터 기다리다 계단 뛰어가는 사자", hook: "에너지 최고치, 쏟아내지 않으면 터지는 팔자", exercise: "복싱" },
  정미: { ilju: "정미", hanja: "丁未", character: "여우", typeName: "아침 커피 레시피가 정해진 여우", hook: "따뜻하게 오래 타는, 나만의 루틴을 사랑하는 타입", exercise: "필라테스" },
  무신: { ilju: "무신", hanja: "戊申", character: "곰", typeName: "리뷰 100개 읽고 사는 곰", hook: "듬직하고 실용적, 효과 확실한 운동만 하는 팔자", exercise: "하이록스 공식" },
  기유: { ilju: "기유", hanja: "己酉", character: "다람쥐", typeName: "고장 난 건 일단 직접 고쳐보는 다람쥐", hook: "눈썰미 좋고 손이 야무진, 기술 익히는 재미파", exercise: "클라이밍" },
  경술: { ilju: "경술", hanja: "庚戌", character: "토끼", typeName: "미라클모닝 진짜로 해내는 토끼", hook: "한번 정하면 끝까지, 의지력 만렙 팔자", exercise: "크로스핏" },
  신해: { ilju: "신해", hanja: "辛亥", character: "학", typeName: "반신욕해야 하루가 끝나는 학", hook: "깨끗하고 예민한 감각, 몸과 마음을 같이 씻어내야 하는 팔자", exercise: "싱잉볼" },
  임자: { ilju: "임자", hanja: "壬子", character: "돌고래", typeName: "회의 중에도 다리 떠는 돌고래", hook: "물처럼 넘치는 에너지, 흘려보낼 출구가 꼭 필요한 팔자", exercise: "복싱" },
  계축: { ilju: "계축", hanja: "癸丑", character: "거북이", typeName: "맛집 웨이팅 2시간도 괜찮은 거북이", hook: "인내심 최강, 남들 포기할 때 비로소 시작하는 타입", exercise: "필라테스" },
  갑인: { ilju: "갑인", hanja: "甲寅", character: "기린", typeName: "남들 안 가는 길로 퇴근하는 기린", hook: "독립심 강한 개척자, 혼자 기록 깨는 맛에 사는 팔자", exercise: "하이록스 공식" },
  을묘: { ilju: "을묘", hanja: "乙卯", character: "고양이", typeName: "어떤 자세로든 잠드는 고양이", hook: "유연함이 무기, 늘어나는 만큼 마음도 풀리는 타입", exercise: "요가" },
  병진: { ilju: "병진", hanja: "丙辰", character: "사자", typeName: "축제 인파에서 더 신나는 사자", hook: "밝고 낙천적, 사람 많은 곳에서 에너지 받는 팔자", exercise: "그룹 트레이닝" },
  정사: { ilju: "정사", hanja: "丁巳", character: "여우", typeName: "게임 시작하면 밥때 잊는 여우", hook: "집중하면 무섭게 몰입하는, 땀 흘리는 순간이 힐링인 타입", exercise: "스피닝" },
  무오: { ilju: "무오", hanja: "戊午", character: "곰", typeName: "평소엔 순한데 응원할 땐 목 쉬는 곰", hook: "겉은 산처럼 무던, 속은 용암처럼 뜨거운 팔자", exercise: "복싱" },
  기미: { ilju: "기미", hanja: "己未", character: "다람쥐", typeName: "라면도 자기 레시피로만 끓이는 다람쥐", hook: "은근한 고집쟁이, 내 방식대로 해야 오래 가는 타입", exercise: "SNPE" },
  경신: { ilju: "경신", hanja: "庚申", character: "토끼", typeName: "매운 거 최고 단계부터 시키는 토끼", hook: "강한 걸 강하게, 고강도 아니면 운동이 아닌 팔자", exercise: "F45/FS8" },
  신유: { ilju: "신유", hanja: "辛酉", character: "학", typeName: "오타 하나에 메일 다시 쓰는 학", hook: "날 선 완벽주의, 정확한 동작 하나에 희열을 느끼는 팔자", exercise: "발레", memo: "남성이면 대체 운동 필요" },
  임술: { ilju: "임술", hanja: "壬戌", character: "돌고래", typeName: "몰아서 일하고 주말 내내 자는 돌고래", hook: "파도 같은 기복, 세게 쏟아내고 푹 쉬어야 하는 팔자", exercise: "스피닝" },
  계해: { ilju: "계해", hanja: "癸亥", character: "거북이", typeName: "정주행 시작하면 끝까지 보는 거북이", hook: "느려 보여도 한 번 시작하면 절대 안 멈추는 팔자", exercise: "바레", memo: "남성이면 대체 운동 필요" },
};

/** 일주(일간+일지 한글)로 타입 조회. 예: iljuType("계", "해") */
export function iljuType(gan: string, jiji: string): IljuType | undefined {
  return ILJU_TYPES[`${gan}${jiji}`];
}

/** 60갑자 순번 (갑자=1 … 계해=60) — 페르소나 카드 번호 */
export function iljuNumber(ilju: string): number {
  return Object.keys(ILJU_TYPES).indexOf(ilju) + 1;
}
