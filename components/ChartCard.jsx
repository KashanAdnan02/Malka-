const { default: Reveal } = require("./Reveal");
import { T } from "@/utils/T";

export default function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
  accent,
  className = "",
}) {
  return (
    <Reveal delay={delay} className={className}>
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: "24px",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              {accent && (
                <div
                  style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: accent,
                  }}
                />
              )}
              <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
                {title}
              </p>
            </div>
            {subtitle && (
              <p style={{ fontSize: 12, color: T.textDim }}>{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </Reveal>
  );
}