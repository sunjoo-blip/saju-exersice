"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Recommendation } from "@/lib/ai/schema";
import type { SajuSuccess } from "@/lib/types";
import { ALL_OHAENG, OHAENG_META, type Ohaeng } from "@/lib/saju/constants";
import { OHAENG_FILL_HINT } from "@/lib/exercise/catalog";
import OhaengBars from "./OhaengBars";
import PlaceCTA from "./PlaceCTA";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** AI 해석이 오기 전 자리표시 */
function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-group" aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** 보완해야 할 오행 (없는 오행 → 없으면 가장 약한 오행) — lib/exercise/pick.ts 와 같은 규칙 */
function fillTargets(counts: Record<Ohaeng, number>, missing: Ohaeng[]): Ohaeng[] {
  if (missing.length > 0) return missing;
  const min = Math.min(...ALL_OHAENG.map((o) => counts[o]));
  return ALL_OHAENG.filter((o) => counts[o] === min);
}

export default function ResultView({
  base,
  rec,
  recError,
  onRetryInterpretation,
  onRestart,
}: {
  base: SajuSuccess;
  rec: Recommendation | null;
  recError: string | null;
  onRetryInterpretation: () => void;
  onRestart: () => void;
}) {
  const { saju, picks } = base;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const targets = fillTargets(saju.ohaeng.counts, saju.ohaeng.missing);
  const isMissing = saju.ohaeng.missing.length > 0;

  async function saveImage() {
    if (!cardRef.current || !rec) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `운동팔자_${rec.typeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("이미지 저장에 실패했어요. 화면을 캡처해 저장해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  function shareToX() {
    if (!rec) return;
    // 공유 텍스트: 결과 유형 + 서비스 URL (개인 생년월일/생시 미포함 — 명세 F6/4)
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      rec.shareText,
    )}&url=${encodeURIComponent(SITE_URL)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const pillarList = [
    { lbl: "년주", p: saju.pillars.year },
    { lbl: "월주", p: saju.pillars.month },
    { lbl: "일주", p: saju.pillars.day },
    { lbl: "시주", p: saju.pillars.hour },
  ];

  return (
    <div>
      {/* ===== 공유용 이미지 카드 (캡처 대상, 4:5) ===== */}
      <div ref={cardRef} className="share-card">
        <div>
          <div className="brand">운동팔자</div>
          <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
            나의 운동 팔자는
          </p>
          {rec ? (
            <div className="share-type">{rec.typeName}</div>
          ) : (
            <Skeleton lines={1} />
          )}
        </div>
        {rec ? (
          <p className="serif" style={{ fontSize: 18, lineHeight: 1.5 }}>
            “{rec.oneLiner}”
          </p>
        ) : (
          <p className="muted">사주를 해석하는 중…</p>
        )}
        <div>
          <p className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
            추천 운동
          </p>
          <div className="chips">
            {picks.map((p) => (
              <span className="chip" key={p.name}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 액션 ===== */}
      <div className="stack" style={{ marginTop: 16 }}>
        <button
          className="btn btn-primary"
          onClick={saveImage}
          disabled={saving || !rec}
        >
          {saving ? "이미지 만드는 중…" : "결과 이미지 저장하기"}
        </button>
        <button className="btn btn-ghost" onClick={shareToX} disabled={!rec}>
          X에 공유하기
        </button>
      </div>

      {recError && (
        <div className="notice" style={{ marginTop: 16 }}>
          해석을 불러오지 못했어요: {recError}
          <button
            className="btn btn-ghost"
            style={{ marginTop: 10 }}
            onClick={onRetryInterpretation}
          >
            해석 다시 불러오기
          </button>
        </div>
      )}

      {/* ===== 추천 운동 TOP 3 (규칙 기반 — 즉시 표시) ===== */}
      <div className="card">
        <p className="section-label">추천 운동 TOP 3</p>
        {picks.map((p, i) => {
          const reason = rec?.recommendations.find((r) => r.name === p.name)?.reason;
          return (
            <div className="reco" key={p.name}>
              <div className="reco-rank">{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="reco-name">
                  {p.name} <span className="basis">{p.basis}</span>
                </div>
                {reason ? (
                  <div className="reco-reason">{reason}</div>
                ) : (
                  !recError && <Skeleton lines={2} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== 채워야 할 기운 ===== */}
      <div className="card">
        <p className="section-label">채워야 할 기운</p>
        <p style={{ marginTop: 0 }}>
          {targets.map((o) => `${o}(${OHAENG_META[o].hanja})`).join(" · ")} 기운이{" "}
          {isMissing ? "비어 있어요" : "가장 약해요"}.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18 }} className="muted">
          {targets.map((o) => (
            <li key={o} style={{ marginBottom: 4 }}>
              {o}: {OHAENG_FILL_HINT[o]} 운동이 잘 맞아요
            </li>
          ))}
        </ul>
      </div>

      {/* ===== 사주 원국 ===== */}
      <div className="card">
        <p className="section-label">나의 사주 원국</p>
        <div className="pillars">
          {pillarList.map(({ lbl, p }) => (
            <div className="pillar" key={lbl}>
              <div className="lbl">{lbl}</div>
              {p ? (
                <>
                  <div className="hanja">{p.ganjiHanja}</div>
                  <div className="ko">
                    {p.gan}
                    {p.jiji}
                  </div>
                </>
              ) : (
                <>
                  <div className="hanja">—</div>
                  <div className="ko">모름</div>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
          일간(나): <b>{saju.ilgan.gan}</b> · 오행 {saju.ilgan.ohaeng}
          {saju.hourUnknown && " · 출생시간 미입력으로 시주 제외"}
        </p>
      </div>

      {/* ===== 오행 분포 ===== */}
      <div className="card">
        <p className="section-label">오행 분포</p>
        <OhaengBars counts={saju.ohaeng.counts} total={saju.ohaeng.total} />
      </div>

      {/* ===== 신살 (판정된 것만) ===== */}
      {saju.sinsal.length > 0 && (
        <div className="card">
          <p className="section-label">내 안의 기운 (신살)</p>
          <div className="chips">
            {saju.sinsal.map((s) => (
              <span className="chip" key={s.name}>
                {s.name} · {s.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ===== 해석 (AI — 나중에 채움) ===== */}
      <div className="card">
        <p className="section-label">사주 해석</p>
        {rec ? <p>{rec.sajuInterpretation}</p> : !recError && <Skeleton lines={4} />}
      </div>

      <div className="card">
        <p className="section-label">나의 운동 성향</p>
        {rec ? <p>{rec.tendency}</p> : !recError && <Skeleton lines={3} />}
      </div>

      {rec && (
        <div className="card">
          <p className="section-label">꾸준히 하는 팁</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {rec.tips.map((t, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== 장소 탐색 (F7) ===== */}
      <PlaceCTA recommendations={picks} />

      <div className="stack" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={onRestart}>
          다시 보기
        </button>
      </div>

      <p className="disclaimer">
        운동팔자는 명리학 기반 엔터테인먼트 콘텐츠예요. 과학적 진단이나 의학적
        조언이 아니며, 재미로 즐겨 주세요.
      </p>
    </div>
  );
}
