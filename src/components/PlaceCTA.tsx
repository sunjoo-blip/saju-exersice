"use client";

import { useState } from "react";
import { EXERCISE_EMOJI, obudDiscoverUrl } from "@/lib/exercise/catalog";
import type { ExercisePick } from "@/lib/exercise/pick";

const OBUD_URL = process.env.NEXT_PUBLIC_OBUD_URL || "https://www.obud.co";

/**
 * 운동 장소 탐색 (명세 F7).
 * - 오붓 지도(/discover)로 해당 운동 카테고리가 선택된 상태로 연결합니다.
 *   (이전 /search?q= 링크는 오붓 검색 화면이 q 파라미터를 읽지 않아 빈 검색창만 떴음)
 * - 장소를 임의로 생성하지 않습니다. 실제 탐색/예약은 오붓에서 진행됩니다.
 */
export default function PlaceCTA({
  recommendations,
}: {
  recommendations: ExercisePick[];
}) {
  const [selected, setSelected] = useState(recommendations[0]?.name);

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!selected) return null;

  return (
    <div className="card">
      <p className="section-label">어디서 해볼까?</p>
      <p className="sub" style={{ marginTop: 0 }}>
        오붓 지도에서 내 주변 스튜디오를 바로 찾아보세요.
      </p>

      <div className="field">
        <label>운동 선택</label>
        <div className="chips">
          {recommendations.map((r) => (
            <button
              key={r.name}
              type="button"
              className="seg"
              style={{
                borderColor:
                  selected === r.name
                    ? "var(--gold)"
                    : "rgba(255,255,255,0.16)",
                background:
                  selected === r.name
                    ? "rgba(217,181,106,0.16)"
                    : "rgba(255,255,255,0.04)",
                color: selected === r.name ? "var(--gold-soft)" : "var(--ink)",
                width: "auto",
                flex: "0 0 auto",
              }}
              onClick={() => setSelected(r.name)}
            >
              {EXERCISE_EMOJI[r.name]} {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => open(obudDiscoverUrl(OBUD_URL, [selected]))}
        >
          {selected} 스튜디오 지도에서 보기
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            open(obudDiscoverUrl(OBUD_URL, recommendations.map((r) => r.name)))
          }
        >
          추천 운동 3개 한 번에 보기
        </button>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        실제 운영 중인 장소 정보는 오붓에서 확인할 수 있어요. 오붓패스 하나로 여러
        운동을 번갈아 다녀볼 수도 있어요.
      </p>
    </div>
  );
}
