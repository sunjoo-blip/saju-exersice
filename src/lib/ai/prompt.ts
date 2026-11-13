/**
 * AI 프롬프트 빌더 (사주 계산 로직과 분리 — 명세 4 비기능 요구사항).
 *
 * 계산 모듈이 만든 "검증된 사실"만 주입하고, AI 는 해석/추천/카피 생성만 담당합니다.
 * AI 가 신살을 새로 계산하거나 존재하지 않는 장소를 지어내지 않도록 강하게 제약합니다.
 */

import { OHAENG_META, type Ohaeng } from "../saju/constants";
import type { SajuResult } from "../saju/types";
import { ALLOWED_EXERCISES } from "./schema";
import {
  OHAENG_FILL_HINT,
  SINSAL_EXERCISES,
  SINSAL_HINT,
} from "../exercise/catalog";
import { fillTargets, type ExercisePick } from "../exercise/pick";

/** 추천 가능한 운동 목록 (프롬프트 주입용 문자열) */
const ALLOWED_EXERCISES_LINE = ALLOWED_EXERCISES.join(", ");

/** 신살 → 운동 성향 힌트 (매핑은 lib/exercise/catalog.ts) */
function sinsalHint(name: string, fallback: string): string {
  const list = SINSAL_EXERCISES[name];
  return list ? `${SINSAL_HINT[name]} (${list.join(", ")})` : fallback;
}

function describeOhaeng(o: Ohaeng): string {
  return `${o}(${OHAENG_META[o].hanja}, ${OHAENG_META[o].hint})`;
}

/** 계산 결과를 사람이 읽을 수 있는 "사실 요약"으로 직렬화 */
export function serializeFacts(saju: SajuResult): string {
  const p = saju.pillars;
  const pillarLine = (label: string, pil: typeof p.year | null) =>
    pil
      ? `- ${label}: ${pil.ganjiHanja} (${pil.gan}${pil.jiji}) / 천간오행 ${pil.ganOhaeng}, 지지오행 ${pil.jijiOhaeng}`
      : `- ${label}: (출생시간 미입력으로 제외)`;

  const ohaengLine = Object.entries(saju.ohaeng.counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");

  const sinsalLine =
    saju.sinsal.length > 0
      ? saju.sinsal
          .map(
            (s) =>
              `- ${s.name}(${s.hanja}): 판정됨 [${s.foundIn.join(", ")}] · 기획 힌트: ${
                sinsalHint(s.name, s.keyword)
              }`,
          )
          .join("\n")
      : "- (판정된 신살 없음 — 신살을 새로 만들어내지 말 것)";

  return [
    "## 계산된 사주 사실 (이 데이터만 사용할 것)",
    "### 사주 원국",
    pillarLine("년주", p.year),
    pillarLine("월주", p.month),
    pillarLine("일주", p.day),
    pillarLine("시주", p.hour),
    `- 일간(나): ${saju.ilgan.gan}(${saju.ilgan.ganHanja}), 오행 ${describeOhaeng(
      saju.ilgan.ohaeng,
    )}`,
    "",
    "### 오행 분포",
    `- 개수: ${ohaengLine}`,
    `- 가장 강한 오행: ${describeOhaeng(saju.ohaeng.dominant)}`,
    `- 없는 오행: ${saju.ohaeng.missing.length ? saju.ohaeng.missing.join(", ") : "없음"}`,
    `- 채워야 할 오행(보완 대상): ${fillTargets(saju)
      .map((o) => `${describeOhaeng(o)} → ${OHAENG_FILL_HINT[o]} 운동`)
      .join(" / ")}`,
    "",
    "### 판정된 신살 (실제 성립한 것만)",
    sinsalLine,
    "",
    `### 메타: ${saju.meta.note}`,
  ].join("\n");
}

export const SYSTEM_PROMPT = `당신은 "운동팔자" 서비스의 콘텐츠 작가입니다.
명리학 기반 엔터테인먼트 콘텐츠를 재미있고 감각적인 한국어로 작성합니다.

반드시 지켜야 할 규칙:
1. 아래에 "계산된 사주 사실"로 주어진 데이터만 사용합니다. 사주/오행/신살을 새로 계산하거나 추측하지 마세요.
2. 주어지지 않은 신살을 언급하거나 만들어내지 마세요. "판정된 신살 없음"이면 신살을 지어내지 말고 오행 분포와 일간 위주로 해석하세요.
3. 특정 스튜디오·장소·브랜드 이름을 지어내지 마세요. (장소 추천은 서비스의 다른 단계에서 실제 데이터로 처리됩니다.)
4. 과학적으로 검증된 성격 판정이나 운동 효능으로 단정하지 마세요. "~한 기운", "~와 잘 어울려요" 같은 엔터테인먼트 톤을 유지합니다.
5. 추천 운동 3개는 서비스가 이미 정했습니다. recommendations 에는 "확정된 추천 운동"을 주어진 순서·이름 그대로(띄어쓰기·표기 포함) 넣고, 각 운동의 "추천 근거"에 맞춰 이유만 작성하세요. 다른 운동으로 바꾸거나 순서를 바꾸지 마세요.
   추천 이유·해석·팁에서 운동을 언급할 때도 다음 목록 안의 운동만 씁니다. (러닝, 수영, 댄스, 테니스 등 금지)
   운동 목록: ${ALLOWED_EXERCISES_LINE}
9. 해석의 중심은 "부족한 오행을 채운다"는 관점입니다. 신살은 성향을 더해주는 보조 설명으로 다룹니다.
6. 출력은 지정된 JSON 스키마를 100% 준수합니다. 그 외 텍스트/설명/마크다운을 절대 추가하지 마세요.
7. 반말/존댓말은 친근한 존댓말 톤으로, SNS에서 공유하고 싶어지는 위트 있는 문장을 씁니다.
8. shareText 에는 생년월일·생시 같은 개인정보를 넣지 마세요.`;

export function buildUserPrompt(
  saju: SajuResult,
  picks: ExercisePick[],
  nickname?: string,
): string {
  const who = nickname ? `사용자 닉네임: ${nickname}` : "사용자 닉네임: (없음)";
  const pickLines = picks
    .map((p, i) => `${i + 1}. ${p.name} — 추천 근거: ${p.basis}`)
    .join("\n");
  return `${who}

${serializeFacts(saju)}

## 확정된 추천 운동 (이름·순서 변경 금지)
${pickLines}

위 사실을 바탕으로 "운동팔자" 결과를 생성하세요.
- typeName: 위트있는 운동 성향 유형명 (예: "불씨 찾는 단단한 나무", "역마의 질주러")
- oneLiner: 한 줄 요약
- sajuInterpretation: 일간/오행 분포(특히 부족한 오행)/판정된 신살을 근거로 한 해석 (없는 신살은 언급 금지)
- tendency: 운동 성향 해석
- recommendations: 위 "확정된 추천 운동" 3개를 같은 순서로, 각각 { name, reason }. reason 은 해당 추천 근거(오행 보완/신살/일간)와 연결
- tips: 운동을 지속하기 위한 팁 2~4개
- shareText: SNS 공유용 짧고 위트있는 문구`;
}
