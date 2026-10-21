"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { AnalyzeSuccess } from "@/lib/types";
import OhaengBars from "./OhaengBars";
import PlaceCTA from "./PlaceCTA";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function ResultView({
  data,
  onRestart,
}: {
  data: AnalyzeSuccess;
  onRestart: () => void;
}) {
  const { saju, recommendation: rec } = data;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  async function saveImage() {
    if (!cardRef.current) return;
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
    // 공유 텍스트: 결과 유형 + 서비스 URL (개인 생년월일/생시 미포함 — 명세 F6/4)
    const text = rec.shareText;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
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
          <div className="share-type">{rec.typeName}</div>
        </div>
        <p className="serif" style={{ fontSize: 18, lineHeight: 1.5 }}>
          “{rec.oneLiner}”
        </p>
        <div>
          <p className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
            추천 운동
          </p>
          <div className="chips">
            {rec.recommendations.map((r) => (
              <span className="chip" key={r.name}>
                {r.name}
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
          disabled={saving}
        >
          {saving ? "이미지 만드는 중…" : "결과 이미지 저장하기"}
        </button>
        <button className="btn btn-ghost" onClick={shareToX}>
          X에 공유하기
        </button>
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

      {/* ===== 해석 ===== */}
      <div className="card">
        <p className="section-label">사주 해석</p>
        <p>{rec.sajuInterpretation}</p>
      </div>

      <div className="card">
        <p className="section-label">나의 운동 성향</p>
        <p>{rec.tendency}</p>
      </div>

      {/* ===== 추천 운동 TOP 3 ===== */}
      <div className="card">
        <p className="section-label">추천 운동 TOP 3</p>
        {rec.recommendations.map((r, i) => (
          <div className="reco" key={r.name}>
            <div className="reco-rank">{i + 1}</div>
            <div>
              <div className="reco-name">{r.name}</div>
              <div className="reco-reason">{r.reason}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== 지속 팁 ===== */}
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

      {/* ===== 장소 탐색 (F7) ===== */}
      <PlaceCTA recommendations={rec.recommendations} />

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
