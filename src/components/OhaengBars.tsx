import { ALL_OHAENG, OHAENG_META, type Ohaeng } from "@/lib/saju/constants";

const COLOR: Record<Ohaeng, string> = {
  목: "var(--ohaeng-mok)",
  화: "var(--ohaeng-hwa)",
  토: "var(--ohaeng-to)",
  금: "var(--ohaeng-geum)",
  수: "var(--ohaeng-su)",
};

export default function OhaengBars({
  counts,
  total,
}: {
  counts: Record<Ohaeng, number>;
  total: number;
}) {
  const max = Math.max(1, ...ALL_OHAENG.map((o) => counts[o]));
  return (
    <div className="ohaeng-bars">
      {ALL_OHAENG.map((o) => (
        <div className="ohaeng-bar" key={o}>
          <span>
            {o}
            <span className="muted" style={{ fontSize: 11 }}>
              {OHAENG_META[o].hanja}
            </span>
          </span>
          <div className="ohaeng-track">
            <div
              className="ohaeng-fill"
              style={{
                width: `${(counts[o] / max) * 100}%`,
                background: COLOR[o],
              }}
            />
          </div>
          <span className="muted">{counts[o]}</span>
        </div>
      ))}
    </div>
  );
}
