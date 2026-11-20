"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Recommendation } from "@/lib/ai/schema";
import type { SajuSuccess } from "@/lib/types";
import { ALL_OHAENG, OHAENG_META, type Ohaeng } from "@/lib/saju/constants";
import { EXERCISE_EMOJI, OHAENG_FILL_HINT } from "@/lib/exercise/catalog";
import OhaengBars from "./OhaengBars";
import PlaceCTA from "./PlaceCTA";
import Character from "./Character";

/** 공유 링크 — 환경변수가 없으면 현재 접속 도메인 사용 (localhost 링크가 공유되던 문제 방지) */
function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

/**
 * 결과지 블러 게이트 on/off. NEXT_PUBLIC_RESULT_GATE=off 면 처음부터 전체 공개.
 * ⚠️ 지금은 화면에서만 가리는 방식이라 응답 데이터에는 전체 결과가 들어 있습니다.
 *    로그인 연동 시 2·1위/상세는 서버에서 로그인 후에만 내려주도록 바꿔야 합니다.
 */
const RESULT_GATE_ON = process.env.NEXT_PUBLIC_RESULT_GATE !== "off";

/** 잠긴 섹션: 내용 대신 흐린 자리표시 문구를 보여줌 (실제 내용은 렌더하지 않음) */
function Locked({
  locked,
  placeholder,
  children,
}: {
  locked: boolean;
  placeholder: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <p className="locked-blur" aria-hidden>
      {placeholder}
    </p>
  );
}

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
}: {
  base: SajuSuccess;
  rec: Recommendation | null;
  recError: string | null;
}) {
  const { saju } = base;
  const recos = rec?.recommendations ?? [];
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const targets = fillTargets(saju.ohaeng.counts, saju.ohaeng.missing);
  const isMissing = saju.ohaeng.missing.length > 0;

  async function renderCard(): Promise<string> {
    return toPng(cardRef.current!, { pixelRatio: 2, cacheBust: true });
  }

  async function saveImage() {
    if (!cardRef.current || !rec) return;
    setSaving(true);
    try {
      const link = document.createElement("a");
      link.download = `운동팔자_${rec.typeName}.png`;
      link.href = await renderCard();
      link.click();
    } catch {
      alert("이미지 저장에 실패했어요. 화면을 캡처해 저장해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * 모바일: OS 공유 시트(카카오톡·인스타 스토리 등)로 결과 이미지 + 링크 공유.
   * 공유 시트가 없는 환경(데스크톱 등)에선 링크 복사로 대체.
   */
  async function share() {
    if (!rec || !cardRef.current) return;
    const text = `${rec.shareText}\n${siteUrl()}`;
    setSharing(true);
    try {
      if (navigator.share) {
        try {
          const blob = await (await fetch(await renderCard())).blob();
          const file = new File([blob], "unwoonpalja.png", { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], text });
            return;
          }
        } catch (e) {
          if ((e as Error).name === "AbortError") return; // 사용자가 공유 취소
        }
        await navigator.share({ text, url: siteUrl() });
        return;
      }
      await copyLink();
    } catch (e) {
      if ((e as Error).name !== "AbortError") await copyLink();
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    if (!rec) return;
    try {
      await navigator.clipboard.writeText(`${rec.shareText}\n${siteUrl()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("복사에 실패했어요. 주소창의 링크를 복사해 주세요.");
    }
  }

  function shareToX() {
    if (!rec) return;
    // 공유 텍스트: 결과 유형 + 서비스 URL (개인 생년월일/생시 미포함 — 명세 F6/4)
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      rec.shareText,
    )}&url=${encodeURIComponent(siteUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // 카운트다운 순서: 3위 → 2위 → 1위 (AI 응답은 1위부터 오므로 뒤집어서 표시)
  const countdown = recos.map((r, i) => ({ ...r, rank: i + 1 })).reverse();
  // 블러 게이트: 3위만 공개, 2위·1위와 이후 섹션은 잠금 해제 후 공개
  const locked = RESULT_GATE_ON && !unlocked;

  /**
   * 잠금 해제. TODO: 오붓 카카오 로그인 연동 후 로그인 성공 시점에 호출.
   * 지금은 버튼을 누르면 바로 풀리는 임시 동작입니다.
   */
  function unlock() {
    setUnlocked(true);
  }

  return (
    <div>
      {recError && (
        <div className="notice" style={{ marginBottom: 16 }}>
          해석을 불러오지 못했어요: {recError}
        </div>
      )}

      {/* ===== 1. 인트로 멘트 ===== */}
      <div className="card intro-card">
        {rec?.character && (
          <div className="intro-character">
            <Character name={rec.character} size={220} />
          </div>
        )}
        <p className="muted" style={{ fontSize: 13, margin: 0 }}>
          나의 운동 팔자는
        </p>
        {rec ? (
          <>
            <div className="share-type">{rec.typeName}</div>
            <p className="serif" style={{ fontSize: 18, lineHeight: 1.5 }}>
              “{rec.oneLiner}”
            </p>
            <p style={{ marginBottom: 0 }}>{rec.intro}</p>
          </>
        ) : (
          !recError && <Skeleton lines={3} />
        )}
        <ol className="intro-agenda">
          <li>나랑 잘 맞는 운동 TOP 3</li>
          <li>나의 운동 성향</li>
          <li>꾸준히 하는 팁</li>
          <li>내게 부족한 기운</li>
          <li>오붓 맞춤 스튜디오</li>
        </ol>
      </div>

      {/* ===== 2. 잘 맞는 운동 TOP 3 (3위 → 1위 카운트다운, 2·1위 잠금) ===== */}
      <div className="card">
        <p className="section-label">나랑 잘 맞는 운동 TOP 3</p>
        {rec ? (
          <div className="gate-wrap">
            {countdown.map((r) => {
              const hidden = locked && r.rank !== 3;
              return (
                <div
                  className={`reco${r.rank === 1 ? " reco-top" : ""}`}
                  key={r.name}
                >
                  <div className="reco-rank">{r.rank}</div>
                  <div
                    style={{ flex: 1 }}
                    className={hidden ? "locked-blur" : undefined}
                    aria-hidden={hidden || undefined}
                  >
                    <div className="reco-name">
                      {hidden ? "🔒 ???" : `${EXERCISE_EMOJI[r.name]} ${r.name}`}
                    </div>
                    <div className="reco-reason">
                      {hidden ? "로그인하면 공개되는 추천 이유예요." : r.reason}
                    </div>
                  </div>
                </div>
              );
            })}
            {locked && (
              <div className="gate-card">
                <p className="gate-title serif">진짜 찰떡은 아직이야.</p>
                <p className="gate-sub">
                  2위·1위와 운동 성향, 팁, 부족한 기운까지
                  <br />
                  전체 결과를 볼 수 있어요
                </p>
                <button type="button" className="btn btn-kakao" onClick={unlock}>
                  카카오로 3초 만에 1위 보기
                </button>
              </div>
            )}
          </div>
        ) : (
          !recError &&
          [3, 2, 1].map((n) => (
            <div className="reco" key={n}>
              <div className="reco-rank">{n}</div>
              <div style={{ flex: 1 }}>
                <Skeleton lines={2} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== 3. 나의 운동 성향 ===== */}
      <div className="card">
        <p className="section-label">나의 운동 성향</p>
        {rec ? (
          <Locked locked={locked} placeholder="시작 버튼을 누르기까지 오래 걸리는 타입이에요. 대신 루틴이 되면…">
            <p>{rec.tendency}</p>
          </Locked>
        ) : (
          !recError && <Skeleton lines={3} />
        )}
      </div>

      {/* ===== 4. 꾸준히 하는 팁 ===== */}
      <div className="card">
        <p className="section-label">꾸준히 하는 팁</p>
        {rec ? (
          <Locked locked={locked} placeholder="처음 2주는 같은 요일, 같은 시간에만. 그리고…">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {rec.tips.map((t, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  {t}
                </li>
              ))}
            </ul>
          </Locked>
        ) : (
          !recError && <Skeleton lines={3} />
        )}
      </div>

      {/* ===== 5. 내게 부족한 기운 (오행) ===== */}
      <div className="card">
        <p className="section-label">내게 부족한 기운</p>
        <Locked locked={locked} placeholder="내 사주에 비어 있는 기운과, 그걸 채우는 운동이에요.">
          <p style={{ marginTop: 0 }}>
            {targets.map((o) => `${o}(${OHAENG_META[o].hanja})`).join(" · ")} 기운이{" "}
            {isMissing ? "비어 있어요" : "가장 약해요"}.
          </p>
          <OhaengBars counts={saju.ohaeng.counts} total={saju.ohaeng.total} />
          <ul style={{ margin: "12px 0 0", paddingLeft: 18 }} className="muted">
            {targets.map((o) => (
              <li key={o} style={{ marginBottom: 4 }}>
                {o}: {OHAENG_FILL_HINT[o]} 운동으로 채워보세요
              </li>
            ))}
          </ul>
        </Locked>
      </div>

      {/* ===== 6. 오붓 맞춤 스튜디오 ===== */}
      {rec &&
        (locked ? (
          <div className="card">
            <p className="section-label">오붓 맞춤 스튜디오</p>
            <Locked locked placeholder="내 동네에서 부족한 기운을 채울 수 있는 스튜디오예요.">
              {null}
            </Locked>
          </div>
        ) : (
          <PlaceCTA recommendations={recos} />
        ))}

      {/* ===== 공유 카드 + 액션 (잠금 해제 후 — 1위 운동이 들어가므로) ===== */}
      {!locked && (
        <>
          <div ref={cardRef} className="share-card" style={{ marginTop: 16 }}>
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
            {rec?.character ? (
              <div className="intro-character">
                <Character name={rec.character} size={180} />
              </div>
            ) : (
              <div className="share-emoji" aria-hidden>
                {recos.map((r) => (
                  <span key={r.name}>{EXERCISE_EMOJI[r.name]}</span>
                ))}
              </div>
            )}
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
                {rec ? (
                  recos.map((r) => (
                    <span className="chip" key={r.name}>
                      {r.name}
                    </span>
                  ))
                ) : (
                  <Skeleton lines={1} />
                )}
              </div>
            </div>
          </div>

          <div className="stack" style={{ marginTop: 16 }}>
            <button
              className="btn btn-primary"
              onClick={saveImage}
              disabled={saving || !rec}
            >
              {saving ? "이미지 만드는 중…" : "결과 이미지 저장하기"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={share}
              disabled={!rec || sharing}
            >
              {copied ? "링크를 복사했어요 ✓" : "친구에게 공유하기"}
            </button>
            <div className="share-row">
              <button className="link-btn" onClick={copyLink} disabled={!rec}>
                링크 복사
              </button>
              <span className="muted">·</span>
              <button className="link-btn" onClick={shareToX} disabled={!rec}>
                X에 공유
              </button>
            </div>
          </div>

        </>
      )}

      <p className="disclaimer">
        운동팔자는 명리학 기반 엔터테인먼트 콘텐츠예요. 과학적 진단이나 의학적
        조언이 아니며, 재미로 즐겨 주세요.
      </p>
    </div>
  );
}
