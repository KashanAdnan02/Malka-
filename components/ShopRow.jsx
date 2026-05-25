const { pct, fmt } = require("@/utils/helpers");
import { T } from "@/utils/T";

export default function ShopRow({ rank, name, revenue, maxRevenue, color }) {
  const barW = pct(revenue, maxRevenue);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          color,
        }}
      >
        {rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            marginBottom: 5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </p>
        <div
          style={{
            height: 4,
            background: T.border,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barW}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${color}, ${color}99)`,
              transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 800, color, flexShrink: 0 }}>
        {fmt(revenue)}
      </p>
    </div>
  );
}
