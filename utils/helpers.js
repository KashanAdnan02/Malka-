export function fmt(n) {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `₨${(n / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `₨${(n / 1_000).toFixed(1)}K`;
  return `₨${Number(n).toLocaleString("en-PK")}`;
}

export function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}
