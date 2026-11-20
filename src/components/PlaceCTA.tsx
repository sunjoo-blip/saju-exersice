"use client";

import { useEffect, useState } from "react";
import {
  EXERCISE_EMOJI,
  OBUD_CATEGORY_ID,
  obudDiscoverUrl,
} from "@/lib/exercise/catalog";
import type { Recommendation } from "@/lib/ai/schema";
import { AREAS, obudPlaceUrl, type Studio } from "@/lib/studios/areas";

const OBUD_URL = process.env.NEXT_PUBLIC_OBUD_URL || "https://www.obud.co";

type Loc = { id: string; label: string; lat: number; lng: number };

/**
 * 오붓 맞춤 스튜디오 (명세 F7).
 * - 지역(프리셋 또는 내 위치)을 고르면 추천 운동을 하는 오붓 스튜디오 3곳을 바로 보여줍니다.
 *   데이터: /api/studios → 오붓 공개 지도 검색 API (실제 등록 장소만, 지어내지 않음)
 * - 더 보고 싶으면 오붓 지도(/discover)로 이동합니다.
 */
export default function PlaceCTA({
  recommendations,
}: {
  recommendations: Recommendation["recommendations"];
}) {
  const [selected, setSelected] = useState(recommendations[0]?.name);
  const [loc, setLoc] = useState<Loc>(AREAS[0]);
  const [studios, setStudios] = useState<Studio[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const ctrl = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams({
      categoryIds: String(OBUD_CATEGORY_ID[selected]),
      lat: String(loc.lat),
      lng: String(loc.lng),
    });
    fetch(`/api/studios?${qs}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j: { studios?: Studio[] }) => setStudios(j.studios ?? []))
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setStudios([]);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [selected, loc]);

  function pickMyLocation() {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("이 브라우저에선 위치를 쓸 수 없어요. 지역을 골라주세요.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLoc({
          id: "me",
          label: "내 위치",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setLocError("위치 권한이 없어요. 지역을 골라주세요."),
      { timeout: 8000 },
    );
  }

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!selected) return null;

  const chip = (active: boolean) => ({
    borderColor: active ? "var(--gold)" : "rgba(255,255,255,0.16)",
    background: active ? "rgba(217,181,106,0.16)" : "rgba(255,255,255,0.04)",
    color: active ? "var(--gold-soft)" : "var(--ink)",
    width: "auto",
    flex: "0 0 auto",
  });

  return (
    <div className="card">
      <p className="section-label">오붓 맞춤 스튜디오</p>

      <div className="field">
        <label>운동</label>
        <div className="chips">
          {recommendations.map((r) => (
            <button
              key={r.name}
              type="button"
              className="seg"
              style={chip(selected === r.name)}
              onClick={() => setSelected(r.name)}
            >
              {EXERCISE_EMOJI[r.name]} {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>지역</label>
        <div className="chips">
          <button
            type="button"
            className="seg"
            style={chip(loc.id === "me")}
            onClick={pickMyLocation}
          >
            📍 내 위치
          </button>
          {AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="seg"
              style={chip(loc.id === a.id)}
              onClick={() => setLoc(a)}
            >
              {a.label}
            </button>
          ))}
        </div>
        {locError && (
          <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            {locError}
          </p>
        )}
      </div>

      <div className="studio-list" aria-busy={loading}>
        {loading && !studios && <p className="muted">스튜디오 찾는 중…</p>}
        {studios && studios.length === 0 && !loading && (
          <p className="muted" style={{ margin: 0 }}>
            {loc.label} 근처엔 아직 {selected} 스튜디오가 없어요. 다른 지역이나
            운동을 골라보세요.
          </p>
        )}
        {studios?.map((s) => (
          <a
            key={s.slug}
            className="studio-card"
            href={obudPlaceUrl(OBUD_URL, s.slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" loading="lazy" />
            ) : (
              <div className="studio-noimg" aria-hidden />
            )}
            <div className="studio-info">
              <div className="studio-title">{s.title}</div>
              <div className="muted studio-meta">
                {s.region}
                {s.reviewAverage ? ` · ★ ${s.reviewAverage.toFixed(1)}` : ""}
                {s.reviewCount ? ` (${s.reviewCount})` : ""}
              </div>
              <div className="muted studio-meta">
                {s.categories.slice(0, 3).join(" · ")}
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="stack" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => open(obudDiscoverUrl(OBUD_URL, [selected]))}
        >
          오붓 지도에서 {selected} 더 보기
        </button>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        오붓패스 하나로 여러 스튜디오를 번갈아 다녀볼 수도 있어요.
      </p>
    </div>
  );
}
