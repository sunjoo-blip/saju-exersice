"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EXERCISE_EMOJI,
  OBUD_CATEGORY_ID,
  obudDiscoverUrl,
} from "@/lib/exercise/catalog";
import type { Recommendation } from "@/lib/ai/schema";
import {
  REGIONS,
  SEOUL_SUBS,
  obudPlaceUrl,
  type Region,
  type SubArea,
  type Studio,
} from "@/lib/studios/areas";
import type { Ohaeng } from "@/lib/saju/constants";
import StudioMap, { NAVER_MAP_ENABLED } from "./StudioMap";
import SchematicMap from "./SchematicMap";
import { areaOhaeng, districtsOf } from "@/lib/studios/ohaengPlaces";

const OHAENG_LABEL: Record<Ohaeng, string> = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };

const OBUD_URL = process.env.NEXT_PUBLIC_OBUD_URL || "https://www.obud.co";

type Loc = { id: string; label: string; lat: number; lng: number };

/** 하위 지역(SubArea) → 검색/지도에 쓰는 Loc. "서울 전체"는 라벨을 "서울"로 */
function subToLoc(s: SubArea): Loc {
  return { id: s.id, label: s.label === "서울 전체" ? "서울" : s.label, lat: s.lat, lng: s.lng };
}

/**
 * 오붓 맞춤 스튜디오 (명세 F7).
 * - 지역(프리셋 또는 내 위치)을 고르면 추천 운동을 하는 오붓 스튜디오 3곳을 바로 보여줍니다.
 *   데이터: /api/studios → 오붓 공개 지도 검색 API (실제 등록 장소만, 지어내지 않음)
 * - 더 보고 싶으면 오붓 지도(/discover)로 이동합니다.
 */
export default function PlaceCTA({
  recommendations,
  fill = [],
}: {
  recommendations: Recommendation["recommendations"];
  /** 부족한 오행 — 수·목이면 한강·공원 근처 스튜디오를 먼저 추천 */
  fill?: Ohaeng[];
}) {
  const [selected, setSelected] = useState(recommendations[0]?.name);
  // 지역: 시/도(REGIONS) 한 줄 → 서울만 하위 구 칩. 비서울은 대표 좌표로 바로 검색.
  const [regionId, setRegionId] = useState("seoul");
  const [loc, setLoc] = useState<Loc>(() => subToLoc(SEOUL_SUBS[0])); // 서울 전체

  // 선택한 시/도의 하위 지역 — 보완 오행 맞는 구를 앞으로 정렬 + ✨ 강조 (서울만 해당)
  const subRow = useMemo(() => {
    const r = REGIONS.find((x) => x.id === regionId);
    if (!r?.subs) return null;
    const isReco = (s: SubArea) =>
      s.districts.length > 0 &&
      areaOhaeng(s.lat, s.lng, s.districts).some((o) => fill.includes(o));
    const all = r.subs.filter((s) => s.districts.length === 0); // 서울 전체
    const reco = r.subs.filter(isReco);
    const rest = r.subs.filter((s) => s.districts.length > 0 && !isReco(s));
    return { list: [...all, ...reco, ...rest], recoIds: new Set(reco.map((s) => s.id)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, fill.join(",")]);

  function pickRegion(r: Region) {
    setRegionId(r.id);
    setLoc(r.subs ? subToLoc(r.subs[0]) : { id: r.id, label: r.label, lat: r.lat, lng: r.lng });
  }
  const [studios, setStudios] = useState<Studio[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [mapOk, setMapOk] = useState(NAVER_MAP_ENABLED);
  const [picked, setPicked] = useState<string | null>(null);
  const onSelect = useCallback((slug: string) => setPicked(slug), []);
  const onMapUnavailable = useCallback(() => setMapOk(false), []);

  useEffect(() => {
    if (!selected) return;
    const ctrl = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams({
      categoryIds: String(OBUD_CATEGORY_ID[selected]),
      lat: String(loc.lat),
      lng: String(loc.lng),
      limit: "8",
      fill: fill.join(","),
    });
    fetch(`/api/studios?${qs}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j: { studios?: Studio[] }) => {
        const list = j.studios ?? [];
        setStudios(list);
        setPicked(list[0]?.slug ?? null);
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setStudios([]);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, loc, fill.join(",")]);

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
    borderColor: active ? "var(--ink)" : "var(--line)",
    background: active ? "var(--ink)" : "var(--paper)",
    color: active ? "var(--paper)" : "var(--ink)",
    width: "auto",
    flex: "0 0 auto",
  });

  return (
    <div className="card">
      <p className="section-label">
        <span className="sec-num">05</span>오붓 맞춤 스튜디오
      </p>

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
        {/* 1단계: 📍 내 위치 + 시/도 */}
        <div className="chips">
          <button
            type="button"
            className="seg"
            style={chip(loc.id === "me")}
            onClick={pickMyLocation}
          >
            📍 내 위치
          </button>
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className="seg"
              style={chip(loc.id !== "me" && regionId === r.id)}
              onClick={() => pickRegion(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
        {/* 2단계: 서울 하위 구 (오행 추천 ✨ 먼저) */}
        {subRow && (
          <div
            className="chips"
            style={{
              marginTop: 8,
              padding: 10,
              border: "1px solid var(--line)",
              borderRadius: 12,
            }}
          >
            {subRow.list.map((s) => (
              <button
                key={s.id}
                type="button"
                className="seg"
                style={chip(loc.id === s.id)}
                onClick={() => setLoc(subToLoc(s))}
              >
                {subRow.recoIds.has(s.id) ? `✨ ${s.label}` : s.label}
              </button>
            ))}
          </div>
        )}
        <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          ‘내 위치’는 가까운 스튜디오를 찾는 데만 쓰여요. 위치 정보는 저장하거나
          수집하지 않아요.
        </p>
        {locError && (
          <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            {locError}
          </p>
        )}
      </div>

      {/* 추천 근거 문구는 서울 구 오행 기준 — 서울을 골랐을 때만 노출 */}
      {fill.length > 0 && regionId === "seoul" && loc.id !== "me" && (
        <p className="muted" style={{ fontSize: 13, margin: "0 0 10px" }}>
          {fill.map((o) => `${o}(${OHAENG_LABEL[o]})`).join(" · ")} 기운을 채우려고{" "}
          {fill
            .map((o) => districtsOf(o).slice(0, 4).join("·"))
            .join(" / ")}
          {fill.includes("수") && ", 한강·호수 근처"}
          {fill.includes("목") && ", 공원·숲 근처"} 스튜디오를 먼저 골랐어요.
        </p>
      )}

      {mapOk ? (
        <div className="studio-map-wrap" aria-busy={loading}>
          <StudioMap
            center={loc}
            studios={studios ?? []}
            selected={picked}
            onSelect={onSelect}
            onUnavailable={onMapUnavailable}
          />
          {(() => {
            const s = studios?.find((x) => x.slug === picked);
            if (!s) return null;
            return (
              <div className="studio-map-card">
                <StudioCard s={s} />
              </div>
            );
          })()}
          {studios && studios.length === 0 && !loading && (
            <div className="studio-map-empty">
              {loc.label} 근처엔 아직 {selected} 스튜디오가 없어요.
            </div>
          )}
        </div>
      ) : (
        <div className="studio-map-wrap" aria-busy={loading}>
          <SchematicMap
            center={loc}
            studios={studios ?? []}
            selected={picked}
            onSelect={onSelect}
          />
          {(() => {
            const s = studios?.find((x) => x.slug === picked);
            if (!s) return null;
            return (
              <div className="studio-map-card">
                <StudioCard s={s} />
              </div>
            );
          })()}
          {studios && studios.length === 0 && !loading && (
            <div className="studio-map-empty">
              {loc.label} 근처엔 아직 {selected} 스튜디오가 없어요. 다른 지역이나
              운동을 골라보세요.
            </div>
          )}
        </div>
      )}

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

/** 스튜디오 카드 — 오붓 지도 하단 카드 스타일 (사진 · 이름 · 별점 · 지역 · 카테고리) */
function StudioCard({ s }: { s: Studio }) {
  return (
    <a
      className="studio-card"
      href={obudPlaceUrl(OBUD_URL, s.slug)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="studio-thumb">
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt="" loading="lazy" />
        ) : (
          <div className="studio-noimg" aria-hidden />
        )}
        {s.passType && <span className="studio-pass">PASS</span>}
      </div>
      <div className="studio-info">
        <div className="studio-title">{s.title}</div>
        <div className="muted studio-meta">
          {s.reviewAverage ? (
            <>
              <span style={{ color: "#f2b400" }}>★</span> {s.reviewAverage.toFixed(1)}
              {s.reviewCount ? ` (${s.reviewCount})` : ""} ·{" "}
            </>
          ) : null}
          {s.region} · {s.categories.slice(0, 3).join(", ")}
        </div>
        {s.ohaengReason && <div className="studio-ohaeng">{s.ohaengReason}</div>}
      </div>
    </a>
  );
}
