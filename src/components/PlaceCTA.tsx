"use client";

import { useState } from "react";
import type { Recommendation } from "@/lib/ai/schema";

const OBUD_URL = process.env.NEXT_PUBLIC_OBUD_URL || "https://obud.co";

/**
 * 운동 장소 탐색 (명세 F7).
 * - 추천 운동 중 하나 + 지역을 선택해 오붓으로 연결합니다.
 * - 장소를 임의로 생성하지 않습니다. 실제 탐색/예약은 오붓에서 진행됩니다.
 */
export default function PlaceCTA({
  recommendations,
}: {
  recommendations: Recommendation["recommendations"];
}) {
  const [selected, setSelected] = useState(recommendations[0]?.name ?? "");
  const [region, setRegion] = useState("");

  function go() {
    const q = encodeURIComponent([region, selected].filter(Boolean).join(" "));
    // 실제 데이터 연동(후순위) 전까지는 오붓 탐색/검색 진입점으로 연결.
    const url = `${OBUD_URL}/search?q=${q}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="card">
      <p className="section-label">어디서 해볼까?</p>
      <p className="sub" style={{ marginTop: 0 }}>
        추천 운동을 실제로 경험할 수 있는 곳을 찾아보세요.
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
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>지역 (선택)</label>
        <input
          className="input"
          placeholder="예: 강남, 성수, 부산 서면"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
      </div>

      <button type="button" className="btn btn-primary" onClick={go}>
        {selected} 할 수 있는 곳 찾아보기
      </button>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        실제 운영 중인 장소 정보는 오붓에서 확인할 수 있어요. 조건에 맞는 곳이 없으면
        다른 운동이나 지역으로 바꿔보세요.
      </p>
    </div>
  );
}
