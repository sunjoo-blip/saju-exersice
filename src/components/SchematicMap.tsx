"use client";

/**
 * 스튜디오 모식(模式) 지도 — 실제 지도 API 없이 "지도 형태만" 차용한 폴백.
 * - 네이버 지도 키가 없거나 로드에 실패했을 때 밋밋한 목록 대신 사용합니다.
 * - 스튜디오 분포에 맞춰 뷰포트를 자동으로 맞추고(네이버 fitBounds 느낌),
 *   그 동네의 실제 지형(한강·하천·공원)과 핀을 "같은 투영"으로 찍습니다.
 *   → 강 근처 스튜디오는 그려진 강 근처에 찍히고, 멀면 지형은 화면 밖으로 잘립니다.
 * - 핀이 겹치면 세로로 밀어내고(declutter), 카드 영역은 넘지 않게 합니다.
 */

import { useMemo } from "react";
import type { Studio } from "@/lib/studios/areas";
import {
  makeViewport,
  parkDiameterPct,
  project,
  sceneFor,
  X_MIN,
  X_MAX,
  Y_MIN,
  Y_MAX,
  type LngLat,
} from "@/lib/studios/geography";

const MAX_PINS = 5;
const NEAR_X = 20; // 이만큼 가까우면(가로 %) 겹침으로 보고
const MIN_DY = 14; // 세로로 최소 이만큼(%) 벌립니다(라벨 높이보다 크게)

type Placed = { s: Studio; x: number; y: number; active: boolean };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * 핀이 가로로 가까우면서 세로로 겹치면 아래로 밀어 읽히게 만들고,
 * 덩어리가 카드 영역(Y_MAX)을 넘치면 통째로 위로 끌어올려 카드와 안 겹치게 합니다.
 */
function declutter(pins: Placed[]): Placed[] {
  const order = [...pins].sort((a, b) => a.y - b.y);
  for (let i = 1; i < order.length; i++) {
    for (let j = 0; j < i; j++) {
      const dy = order[i].y - order[j].y;
      if (Math.abs(order[i].x - order[j].x) < NEAR_X && dy >= 0 && dy < MIN_DY) {
        order[i].y = order[j].y + MIN_DY;
      }
    }
  }
  const maxY = order.reduce((m, p) => Math.max(m, p.y), 0);
  if (maxY > Y_MAX) order.forEach((p) => (p.y -= maxY - Y_MAX));
  order.forEach((p) => (p.y = clamp(p.y, Y_MIN, Y_MAX)));
  return pins;
}

export default function SchematicMap({
  center,
  studios,
  selected,
  onSelect,
}: {
  center: LngLat;
  studios: Studio[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const shown = useMemo(() => studios.slice(0, MAX_PINS), [studios]);
  const vp = useMemo(() => makeViewport(center, shown), [center.lat, center.lng, shown]); // eslint-disable-line react-hooks/exhaustive-deps
  const scene = useMemo(() => sceneFor(center), [center.lat, center.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // 지형(강·하천·공원)을 같은 뷰포트로 투영
  const water = useMemo(
    () =>
      scene.water.map((line) =>
        line.map((p) => project(vp, p)).map((q) => `${q.x},${q.y}`).join(" "),
      ),
    [scene, vp],
  );
  const parks = useMemo(
    () =>
      scene.parks.map((p) => ({ ...project(vp, p), d: parkDiameterPct(vp, p.r) })),
    [scene, vp],
  );

  // 스튜디오 핀 투영 + 겹침 정리
  const pins = useMemo(() => {
    const placed: Placed[] = shown.map((s) => {
      const p = project(vp, s);
      return {
        s,
        x: clamp(p.x, X_MIN, X_MAX),
        y: clamp(p.y, Y_MIN, Y_MAX),
        active: s.slug === selected,
      };
    });
    return declutter(placed);
  }, [shown, selected, vp]);

  return (
    <div className="studio-schematic" aria-label="스튜디오 위치 지도(모식)">
      <svg className="sm-geo" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {water.map((pts, i) => (
          <polyline key={i} className="sm-water" points={pts} />
        ))}
      </svg>
      {parks.map((p, i) => (
        <div
          key={i}
          className="sm-park"
          aria-hidden
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.d}%` }}
        />
      ))}
      {pins.map(({ s, x, y, active }) => {
        const label = s.title.length > 10 ? `${s.title.slice(0, 10)}…` : s.title;
        // 가장자리 핀은 라벨을 안쪽으로 자라게 해 패널 밖으로 안 넘치게
        const anchor = x < 30 ? " anchor-left" : x > 70 ? " anchor-right" : "";
        return (
          <button
            key={s.slug}
            type="button"
            className={`sm-pin${active ? " active" : ""}${anchor}`}
            style={{ left: `${x}%`, top: `${y}%`, zIndex: active ? 10 : 2 }}
            onClick={() => onSelect(s.slug)}
            aria-pressed={active}
            aria-label={s.title}
          >
            <span className="sm-pin-dot" aria-hidden />
            <span className="sm-pin-label">[{label}]</span>
          </button>
        );
      })}
    </div>
  );
}
