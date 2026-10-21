# 운동팔자 (Unwoonpalja)

사주를 바탕으로 운동 성향과 어울리는 운동을 추천하는 바이럴 웹서비스 MVP.

> 내 사주에 맞는 운동이 따로 있다고? — 태어난 날짜와 시간으로 알아보는 나의 운동 팔자.

## 기술 스택

- **Next.js 14 (App Router) + TypeScript** — SSR 기반 OG 메타태그/공유 최적화, API Route로 서버 처리
- **lunar-typescript** — 검증된 만세력(절기·음양력·60갑자) 계산
- **OpenAI** — 운동 추천 콘텐츠 생성 (JSON 응답을 서버에서 zod로 검증)
- **zod** — 입력/AI 응답 검증
- **html-to-image** — 결과 카드 PNG 저장
- 디자인: 프레임워크 없는 CSS 디자인 시스템 (`src/app/globals.css`)

## 아키텍처 (계산과 AI 분리)

```
사용자 입력 (F2)
   │  src/lib/saju/validate.ts  (zod 검증)
   ▼
사주 계산 모듈 (F3)               ← 정확성: 라이브러리/규칙 기반, AI 추론 아님
   src/lib/saju/
     calculate.ts  만세력 → 4주(원국)
     ohaeng.ts     오행 분포
     sinsal.ts     신살 판정 (성립한 것만)
   │  "검증된 사실"
   ▼
AI 추천 모듈 (F4)                 ← 해석/카피/추천만 담당
   src/lib/ai/
     prompt.ts     사실 주입 + 제약 프롬프트 (계산 로직과 분리)
     recommend.ts  OpenAI 호출 + 예외 처리
     schema.ts     응답 zod 스키마 (서버 검증)
   │
   ▼
API: src/app/api/analyze/route.ts
   ▼
결과 페이지 (F5) + 이미지 저장/X 공유 (F6) + 장소 탐색 (F7)
   src/app/page.tsx, src/components/*
```

계산 기준과 신살 규칙은 [docs/SAJU_RULES.md](docs/SAJU_RULES.md)에 문서화되어 있습니다.

## 실행

```bash
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 에 OPENAI_API_KEY 입력

npm run dev        # http://localhost:3000
```

### 환경변수

| 변수 | 설명 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API 키 (서버 전용, 필수) |
| `OPENAI_MODEL` | 사용할 모델 (기본 `gpt-4o-mini`) |
| `NEXT_PUBLIC_SITE_URL` | 공유 링크/OG 메타태그용 공개 URL |
| `NEXT_PUBLIC_OBUD_URL` | 장소 탐색 CTA가 연결될 오붓 링크 |

> API 키는 서버 환경변수로만 관리합니다. `.env*` 파일은 커밋하지 않습니다.

## 개인정보 처리 (명세 4)

- 생년월일/생시는 결과 생성에만 사용하고 **저장/로그를 남기지 않습니다.**
- API 응답과 공유 텍스트에는 생년월일/생시가 **포함되지 않습니다.** (사주 간지·오행·신살만)
- 결과 확인 전 회원가입을 요구하지 않습니다.

## MVP 범위

구현됨: 랜딩(F1) · 입력(F2) · 사주 계산(F3) · AI 추천(F4) · 결과(F5) · 이미지 저장/X 공유(F6) ·
장소 탐색 진입(F7, 오붓 연결) · 기본 오류 처리.

후순위(미구현): 실제 스튜디오 검색 API 연동, 지역별 추천, 운동 타로, 통계, 관리자, 재방문 개인화.

## 면책

명리학 기반 **엔터테인먼트 콘텐츠**이며 과학적 진단이나 의학적 조언이 아닙니다.
