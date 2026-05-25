import { fmt } from "@/utils/helpers";
import { T } from "@/utils/T";

export default function DonutLegend({ data }) {
  const CHART_COLORS = [
    T.gold,
    T.emerald,
    T.rose,
    T.blue,
    T.violet,
    T.cyan,
    "#f472b6",
    "#4ade80",
  ];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 16px",
        marginTop: 12,
      }}
    >
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: CHART_COLORS[i % CHART_COLORS.length],
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: T.textDim,
              textTransform: "capitalize",
            }}
          >
            {d.name}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
            {fmt(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
