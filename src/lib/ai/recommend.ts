/**
 * OpenAI 호출 + 응답 검증 (명세 F4, 비기능: AI 실패/잘못된 JSON 예외 처리).
 * 서버 전용 모듈 — OPENAI_API_KEY 환경변수를 사용합니다.
 */

import OpenAI from "openai";
import { recommendationSchema, type Recommendation } from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import type { SajuResult } from "../saju/types";
import type { ExercisePick } from "../exercise/pick";

/**
 * gpt-5 / o 계열은 추론 모델이라 기본 설정이면 응답이 20초 이상 걸립니다.
 * 카피 작성에는 깊은 추론이 필요 없으므로 effort 를 최소로 낮춥니다.
 * (OPENAI_REASONING_EFFORT 로 덮어쓰기 가능)
 */
function reasoningOptions(model: string): Record<string, string> {
  const override = process.env.OPENAI_REASONING_EFFORT;
  if (override) return { reasoning_effort: override };
  if (/^gpt-5/.test(model)) return { reasoning_effort: "minimal" };
  if (/^o\d/.test(model)) return { reasoning_effort: "low" };
  return {};
}

/**
 * AI 가 추천 운동 이름/순서를 바꿨더라도 규칙으로 정한 picks 기준으로 맞춘 뒤 검증합니다.
 * 이름이 일치하는 reason 을 우선 쓰고, 없으면 같은 순번의 reason 을 씁니다.
 */
function alignToPicks(parsed: unknown, picks: ExercisePick[]): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const obj = parsed as { recommendations?: unknown };
  if (!Array.isArray(obj.recommendations)) return parsed;
  const recs = obj.recommendations as { name?: unknown; reason?: unknown }[];
  return {
    ...obj,
    recommendations: picks.map((p, i) => {
      const r = recs.find((x) => x?.name === p.name) ?? recs[i] ?? {};
      return { name: p.name, reason: r.reason, basis: p.basis };
    }),
  };
}

export class RecommendationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NO_API_KEY"
      | "AI_FAILED"
      | "INVALID_JSON"
      | "SCHEMA_INVALID",
  ) {
    super(message);
    this.name = "RecommendationError";
  }
}

let client: OpenAI | null = null;
function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new RecommendationError(
      "OPENAI_API_KEY 환경변수가 설정되지 않았습니다.",
      "NO_API_KEY",
    );
  }
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export async function generateRecommendation(
  saju: SajuResult,
  picks: ExercisePick[],
  nickname?: string,
): Promise<Recommendation> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  let raw: string | null = null;
  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      ...reasoningOptions(model),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(saju, picks, nickname) },
      ],
    });
    raw = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    throw new RecommendationError(
      `AI 호출에 실패했습니다: ${(err as Error).message}`,
      "AI_FAILED",
    );
  }

  if (!raw) {
    throw new RecommendationError("AI 응답이 비어 있습니다.", "AI_FAILED");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new RecommendationError(
      "AI 응답이 올바른 JSON이 아닙니다.",
      "INVALID_JSON",
    );
  }

  const result = recommendationSchema.safeParse(alignToPicks(parsed, picks));
  if (!result.success) {
    throw new RecommendationError(
      `AI 응답이 스키마를 만족하지 않습니다: ${result.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}`,
      "SCHEMA_INVALID",
    );
  }

  return result.data;
}
