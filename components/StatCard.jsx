const { default: Reveal } = require("./Reveal");
import { T } from "@/utils/T";

export default function StatCard({ label, value, sub, icon, accent, change, delay }) {
  const positive = change >= 0;
  return (
    <Reveal delay={delay}>
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "22px 24px",
          position: "relative",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        className="group hover:border-opacity-80"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.borderHi;
          e.currentTarget.style.boxShadow = `0 10px 40px rgba(0,0,0,0.08)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: accent,
            opacity: 0.08,
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${accent}15`,
              border: `1px solid ${accent}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
            }}
          >
            {icon}
          </div>
          {change !== undefined && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: positive ? T.emerald : T.rose,
                background: positive ? `${T.emerald}12` : `${T.rose}12`,
                border: `1px solid ${positive ? T.emerald : T.rose}30`,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              {positive ? "▲" : "▼"} {Math.abs(change)}%
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: T.text,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          {value}
        </p>

        {sub && (
          <p style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>
            {sub}
          </p>
        )}

        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </p>
      </div>
    </Reveal>
  );
}
