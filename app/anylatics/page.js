"use client";
import { useEffect, useState, useMemo } from "react";
import { getAll } from "@/lib/crud";
import Navbar from "@/components/Navbar";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — Light Theme
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f8fafc",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e2e8f0",
  borderHi: "#94a3b8",
  gold: "#f0b429",
  goldDim: "#c9921c",
  emerald: "#34d399",
  rose: "#fb7185",
  blue: "#60a5fa",
  violet: "#a78bfa",
  cyan: "#22d3ee",
  muted: "#64748b",
  text: "#0f172a",
  textDim: "#475569",
};

const CHART_COLORS = [T.gold, T.emerald, T.rose, T.blue, T.violet, T.cyan, "#f472b6", "#4ade80"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n) {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `₨${(n / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `₨${(n / 1_000).toFixed(1)}K`;
  return `₨${Number(n).toLocaleString("en-PK")}`;
}

function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const Icon = {
  Revenue: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Expense: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Net: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Shop: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 22V12h6v10" />
    </svg>
  ),
  Spark: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Weight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Stagger animation wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={className} style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip (Updated for Light Theme)
// ─────────────────────────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, 
      border: `1px solid ${T.border}`,
      borderRadius: 12, 
      padding: "10px 14px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    }}>
      <p style={{ fontSize: 11, color: T.textDim, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: T.textDim }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
            {typeof p.value === "number" && p.value > 999 ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card (Updated for Light Theme)
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, change, delay }) {
  const positive = change >= 0;
  return (
    <Reveal delay={delay}>
      <div style={{
        background: T.card, 
        border: `1px solid ${T.border}`,
        borderRadius: 20, 
        padding: "22px 24px",
        position: "relative", 
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
        className="group hover:border-opacity-80"
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = T.borderHi;
          e.currentTarget.style.boxShadow = `0 10px 40px rgba(0,0,0,0.08)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 120, height: 120, borderRadius: "50%",
          background: accent, opacity: 0.08, filter: "blur(30px)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${accent}15`, 
            border: `1px solid ${accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent,
          }}>
            {icon}
          </div>
          {change !== undefined && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: positive ? T.emerald : T.rose,
              background: positive ? `${T.emerald}12` : `${T.rose}12`,
              border: `1px solid ${positive ? T.emerald : T.rose}30`,
              padding: "2px 8px", borderRadius: 20,
            }}>
              {positive ? "▲" : "▼"} {Math.abs(change)}%
            </span>
          )}
        </div>

        <p style={{
          fontSize: 26, fontWeight: 900, color: T.text,
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 4,
        }}>{value}</p>
        
        {sub && (
          <p style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>{sub}</p>
        )}
        
        <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {label}
        </p>
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Card
// ─────────────────────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, delay = 0, accent, className = "" }) {
  return (
    <Reveal delay={delay} className={className}>
      <div style={{
        background: T.card, 
        border: `1px solid ${T.border}`,
        borderRadius: 20, 
        padding: "24px",
        height: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {accent && (
                <div style={{ width: 3, height: 16, borderRadius: 2, background: accent }} />
              )}
              <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// Top-shop row
// ─────────────────────────────────────────────────────────────────────────────
function ShopRow({ rank, name, revenue, maxRevenue, color }) {
  const barW = pct(revenue, maxRevenue);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
      borderBottom: `1px solid ${T.border}` }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color,
      }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 5,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </p>
        <div style={{ height: 4, background: T.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${barW}%`, borderRadius: 4,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 800, color, flexShrink: 0 }}>
        {fmt(revenue)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Donut legend
// ─────────────────────────────────────────────────────────────────────────────
function DonutLegend({ data }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: T.textDim, textTransform: "capitalize" }}>{d.name}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{fmt(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function Skel({ h = 160, r = 20 }) {
  return (
    <div style={{
      height: h, 
      borderRadius: r,
      background: `linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }} />
  );
}

const axisStyle = { fontSize: 11, fill: T.textDim };
const gridStyle = { strokeDasharray: "3 3", stroke: T.border };

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [records, setRecords] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [eR, rR, sR] = await Promise.all([
        getAll("expense"),
        getAll("records"),
        getAll("shops"),
      ]);
      if (eR.error || rR.error || sR.error) {
        setError("Data load nahi hua. Dobara try karein.");
      } else {
        setExpenses(eR.data || []);
        setRecords(rR.data || []);
        setShops(sR.data || []);
      }
      setLoading(false);
    })();
  }, []);

  const A = useMemo(() => {
    const totalRevenue = records.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
    const totalExpense = expenses.reduce((s, e) => s + (parseFloat(e.price) || 0), 0);
    const totalGrams = records.reduce((s, r) => s + (parseFloat(r.grams) || 0), 0);
    const netBalance = totalRevenue - totalExpense;
    const today = new Date().toISOString().split("T")[0];
    const todayExp = expenses.filter(e => e.created_at?.split("T")[0] === today);
    const todayRec = records.filter(r => r.date?.split("T")[0] === today);
    const todayExpAmt = todayExp.reduce((s, e) => s + (parseFloat(e.price) || 0), 0);
    const todayRecAmt = todayRec.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);

    const monthMap = {};
    records.forEach(r => {
      if (!r.date) return;
      const d = new Date(r.date);
      const k = `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      if (!monthMap[k]) monthMap[k] = { month: k, revenue: 0, expense: 0, count: 0 };
      monthMap[k].revenue += parseFloat(r.price) || 0;
      monthMap[k].count += 1;
    });
    expenses.forEach(e => {
      if (!e.created_at) return;
      const d = new Date(e.created_at);
      const k = `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      if (!monthMap[k]) monthMap[k] = { month: k, revenue: 0, expense: 0, count: 0 };
      monthMap[k].expense += parseFloat(e.price) || 0;
    });

    const monthlyData = Object.values(monthMap)
      .sort((a, b) => new Date(`01 ${a.month}`) - new Date(`01 ${b.month}`))
      .slice(-6);

    const expMap = {};
    expenses.forEach(e => {
      const k = e.item?.trim() || "Other";
      expMap[k] = (expMap[k] || 0) + (parseFloat(e.price) || 0);
    });
    const expenseItems = Object.entries(expMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    const shopMap = {};
    records.forEach(r => {
      const shop = shops.find(s => String(s.id) === String(r.shopId));
      const name = shop?.shop_name || `Shop #${r.shopId}`;
      shopMap[name] = (shopMap[name] || 0) + (parseFloat(r.price) || 0);
    });
    const shopRevenue = Object.entries(shopMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);

    const itemMap = {};
    records.forEach(r => {
      const k = r.item?.toLowerCase().trim() || "other";
      itemMap[k] = (itemMap[k] || 0) + 1;
    });
    const itemDist = Object.entries(itemMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const profitData = monthlyData.map(m => ({
      month: m.month,
      profit: m.revenue - m.expense,
    }));

    return {
      totalRevenue, totalExpense, netBalance, totalGrams,
      totalRecords: records.length, totalExpenses: expenses.length, totalShops: shops.length,
      todayExpAmt, todayRecAmt, todayExpCount: todayExp.length, todayRecCount: todayRec.length,
      monthlyData, expenseItems, shopRevenue, itemDist, profitData,
    };
  }, [expenses, records, shops]);

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    body { background: ${T.bg}; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes pulse-ring {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.04); }
    }
    .recharts-cartesian-axis-tick-value { font-family: 'DM Sans', sans-serif !important; }
  `;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>
      <style>{globalCSS}</style>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px 64px", display: "flex", flexDirection: "column", gap: 28 }}>
        
        {/* Page header */}
        <Reveal delay={0}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 4, height: 20, borderRadius: 2, background: T.gold }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Analytics Dashboard
                </span>
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 900, color: T.text, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
                Business Overview
              </h1>
              <p style={{ fontSize: 14, color: T.textDim, marginTop: 6 }}>
                Expenses, records aur shops ka mukammal tajzia
              </p>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: "10px 16px",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.emerald,
                animation: "pulse-ring 2s ease infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textDim }}>
                {records.length + expenses.length} entries &nbsp;·&nbsp; {shops.length} shops
              </span>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[...Array(6)].map((_, i) => <Skel key={i} h={160} />)}
            </div>
            <Skel h={320} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <Skel h={280} /><Skel h={280} />
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: T.rose }}>{error}</div>
        ) : (
          <>
            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
              <StatCard delay={60} label="Total Revenue" value={fmt(A.totalRevenue)} sub={`${A.totalRecords} records`} icon={<Icon.Revenue />} accent={T.emerald} />
              <StatCard delay={100} label="Total Expense" value={fmt(A.totalExpense)} sub={`${A.totalExpenses} items`} icon={<Icon.Expense />} accent={T.rose} />
              <StatCard delay={140} label="Net Balance" value={fmt(A.netBalance)} sub="Revenue − Expense" icon={<Icon.Net />} accent={A.netBalance >= 0 ? T.emerald : T.rose} />
              <StatCard delay={180} label="Total Weight" value={`${A.totalGrams.toFixed(1)}g`} sub="All records" icon={<Icon.Weight />} accent={T.gold} />
              <StatCard delay={220} label="Active Shops" value={A.totalShops} sub={`Top: ${A.shopRevenue[0]?.name || "—"}`} icon={<Icon.Shop />} accent={T.blue} />
              <StatCard delay={260} label="Aaj Ka Profit" value={fmt(A.todayRecAmt - A.todayExpAmt)} sub={`${A.todayRecCount} rec · ${A.todayExpCount} exp`} icon={<Icon.Spark />} accent={T.violet} />
            </div>

            {/* Today banner */}
            {(A.todayExpAmt > 0 || A.todayRecAmt > 0) && (
              <Reveal delay={300}>
                <div style={{
                  borderRadius: 20, padding: "20px 28px",
                  background: `linear-gradient(135deg, ${T.gold}15 0%, ${T.emerald}10 100%)`,
                  border: `1px solid ${T.gold}30`,
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${T.gold}15`, border: `1px solid ${T.gold}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.gold, flexShrink: 0,
                  }}>
                    <Icon.Spark />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      Aaj Ka Hisaab
                    </p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 900, color: T.text, letterSpacing: "-0.02em" }}>
                      {fmt(A.todayRecAmt)} revenue &nbsp;·&nbsp; {fmt(A.todayExpAmt)} kharch
                    </p>
                  </div>
                  <div style={{
                    padding: "8px 18px", borderRadius: 24,
                    background: A.todayRecAmt >= A.todayExpAmt ? `${T.emerald}15` : `${T.rose}15`,
                    border: `1px solid ${A.todayRecAmt >= A.todayExpAmt ? T.emerald : T.rose}30`,
                    fontSize: 13, fontWeight: 700,
                    color: A.todayRecAmt >= A.todayExpAmt ? T.emerald : T.rose,
                  }}>
                    {A.todayRecAmt >= A.todayExpAmt ? "▲" : "▼"} Net {fmt(Math.abs(A.todayRecAmt - A.todayExpAmt))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Row 1: Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <ChartCard title="Revenue vs Expense" subtitle="Monthly comparison (last 6 months)" delay={320} accent={T.emerald}>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={A.monthlyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.emerald} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.emerald} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.rose} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.rose} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={62} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: T.textDim }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={T.emerald} strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5, fill: T.emerald }} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke={T.rose} strokeWidth={2.5} fill="url(#gExp)" dot={false} activeDot={{ r: 5, fill: T.rose }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Net Profit" subtitle="Revenue minus Expense" delay={360} accent={T.gold}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={A.profitData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} width={62} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="profit" name="Net Profit" radius={[8,8,0,0]} maxBarSize={44}>
                      {A.profitData.map((d, i) => (
                        <Cell key={i} fill={d.profit >= 0 ? T.emerald : T.rose} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <ChartCard title="Top Shops by Revenue" subtitle="Highest earning shops" delay={400} accent={T.violet}>
                {A.shopRevenue.length === 0 ? (
                  <p style={{ color: T.textDim, fontSize: 13 }}>Koi shop data nahi</p>
                ) : (
                  <div>
                    {A.shopRevenue.map((s, i) => (
                      <ShopRow
                        key={s.name}
                        rank={i + 1}
                        name={s.name}
                        revenue={s.revenue}
                        maxRevenue={A.shopRevenue[0].revenue}
                        color={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </div>
                )}
              </ChartCard>

              <ChartCard title="Expense Categories" subtitle="Spending breakdown" delay={440} accent={T.rose}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={A.expenseItems}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {A.expenseItems.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v), ""]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLegend data={A.expenseItems} />
              </ChartCard>
            </div>

            {/* Row 3: Expense Breakdown */}
            <ChartCard title="Expense Breakdown by Item" subtitle="Top spending items ranked" delay={480} accent={T.rose}>
              <ResponsiveContainer width="100%" height={Math.max(200, A.expenseItems.length * 48)}>
                <BarChart data={A.expenseItems} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid {...gridStyle} horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                  <YAxis type="category" dataKey="name" tick={{ ...axisStyle, textAnchor: "end" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name="Amount" radius={[0,8,8,0]} maxBarSize={28}>
                    {A.expenseItems.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Row 4 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <ChartCard title="Shop Revenue Comparison" subtitle="All shops ranked by earning" delay={520} accent={T.blue}>
                <ResponsiveContainer width="100%" height={Math.max(200, A.shopRevenue.length * 48)}>
                  <BarChart data={A.shopRevenue} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid {...gridStyle} horizontal={false} />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
                    <YAxis type="category" dataKey="name" tick={{ ...axisStyle, textAnchor: "end" }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" radius={[0,8,8,0]} maxBarSize={28}>
                      {A.shopRevenue.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Item Type Distribution" subtitle="Record count by item" delay={560} accent={T.cyan}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={A.itemDist}
                      cx="50%" cy="50%"
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {A.itemDist.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => [v + " records", ""]} contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 5: Monthly Activity */}
            <ChartCard title="Monthly Activity Volume" subtitle="Total entries (records + expenses) per month" delay={600} accent={T.gold}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={A.monthlyData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.gold} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="count" name="Records" stroke={T.gold} strokeWidth={2.5} fill="url(#gCount)" dot={{ r: 4, fill: T.gold, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </main>
    </div>
  );
}