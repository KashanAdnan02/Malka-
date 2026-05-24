// ── Pulse animation (add to your global CSS if not already present) ────────────
// @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
// .animate-pulse { animation: pulse 1.8s ease-in-out infinite; }

// ── Base shimmer block ─────────────────────────────────────────────────────────
const Shimmer = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

// ── Stats bar skeleton (replaces the 4-card grid) ─────────────────────────────
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
        >
          <div className="flex items-start justify-between">
            <Shimmer className="w-8 h-8 rounded-xl" />
            <Shimmer className="w-2 h-2 rounded-full" />
          </div>
          <Shimmer className="w-16 h-6 rounded-md" />
          <Shimmer className="w-24 h-3 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ── Table skeleton (replaces the spinner inside RecordsTable) ──────────────────
export function TableSkeleton({ rows = 5 }) {
  const cols = ["22%", "10%", "10%", "14%", "18%", "16%", "10%"];

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 flex gap-4">
        {cols.map((w, i) => (
          <Shimmer
            key={i}
            className="h-3 rounded"
            style={{ width: w, flexShrink: 0 }}
          />
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="px-4 py-3.5 border-b border-slate-50 last:border-0 flex items-center gap-4"
          style={{
            animationDelay: `${rowIdx * 80}ms`,
          }}
        >
          {/* Item cell — avatar + two lines */}
          <div className="flex items-center gap-3" style={{ width: "22%", flexShrink: 0 }}>
            <Shimmer className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-3 w-3/4 rounded" />
              <Shimmer className="h-2.5 w-1/2 rounded" />
            </div>
          </div>

          {/* Rati badge */}
          <Shimmer className="h-5 rounded-full" style={{ width: "10%", flexShrink: 0 }} />

          {/* Weight */}
          <Shimmer className="h-3 rounded" style={{ width: "10%", flexShrink: 0 }} />

          {/* Price */}
          <Shimmer className="h-3 rounded" style={{ width: "14%", flexShrink: 0 }} />

          {/* Shop */}
          <Shimmer className="h-3 rounded" style={{ width: "18%", flexShrink: 0 }} />

          {/* Contact */}
          <Shimmer className="h-3 rounded" style={{ width: "16%", flexShrink: 0 }} />

          {/* Actions placeholder */}
          <div style={{ width: "10%", flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}